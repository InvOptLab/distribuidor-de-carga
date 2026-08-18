"use client";

import type React from "react";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useMemo,
} from "react";
import { askAssistantAction } from "@/actions/chat-action";
import { useLocale, useTranslations } from "next-intl";
import { useGlobalContext } from "../Global";
import Fuse from "fuse.js";
import { TipoTrava } from "@/algoritmo/communs/interfaces/interfaces";


// Definição dos tipos
export type MessageSender = "user" | "bot" | "action";

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
}

type ChatSize = "small" | "medium" | "large";

interface AvatarChatContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<string | undefined>;
  clearChat: () => void;
  isSearching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  chatSize: ChatSize;
  setChatSize: React.Dispatch<React.SetStateAction<ChatSize>>;
  cycleSize: () => void;
}

const AvatarChatContext = createContext<AvatarChatContextType | undefined>(
  undefined,
);

export const AvatarChatProvider = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("Assistant");
  const tUtils = useTranslations("Utils");

  const locale = useLocale();
  const globalCtx = useGlobalContext();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>("medium");

  const [messages, setMessages] = useState<Message[]>([

    {
      id: "welcome",
      text: t("welcome"),
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleMute = () => setIsMuted((prev) => !prev);

  const clearChat = () =>
    setMessages([
      {
        id: "welcome",
        text: t("welcome"),
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

  const cycleSize = () => {
    setChatSize((prev) => {
      if (prev === "small") return "medium";
      if (prev === "medium") return "large";
      return "small";
    });
  };

  const sendMessage = async (text: string): Promise<string | undefined> => {
    if (!text.trim()) return;

    setSearching(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await askAssistantAction(text, locale);

      if (!response.success) {
        throw new Error(response.error || tUtils("unknownError"));
      }

      let answerText = response.answer;

      if (response.toolCalls && response.toolCalls.length > 0) {
        const docenteFuse = new Fuse(globalCtx.docentes, { 
          keys: ["nome"], 
          threshold: 0.5, 
          ignoreLocation: true 
        });
        
        const disciplinaFuse = new Fuse(globalCtx.disciplinas, { 
          keys: ["nome", "codigo"], 
          threshold: 0.5,
          ignoreLocation: true 
        });

        const searchDocente = (query: string) => {
          if (!query) return null;
          const q = query.toLowerCase().trim();
          
          let match = globalCtx.docentes.find(d => d.nome.toLowerCase() === q);
          if (match) return match;
          
          match = globalCtx.docentes.find(d => d.nome.toLowerCase().includes(q) || q.includes(d.nome.toLowerCase()));
          if (match) return match;
          
          const result = docenteFuse.search(query);
          return result.length > 0 ? result[0].item : null;
        };

        const searchDisciplina = (query: string) => {
          if (!query) return null;
          const q = query.toLowerCase().trim();
          
          const regex = /^([a-z0-9]+)[\s-]*(\d+)$/i;
          const rgMatch = q.match(regex);
          
          let match = globalCtx.disciplinas.find(d => {
            if (rgMatch) {
              const codigo = rgMatch[1].toLowerCase();
              const turma = parseInt(rgMatch[2]);
              return d.codigo.toLowerCase() === codigo && d.turma === turma;
            }
            return d.codigo.toLowerCase() === q || d.nome.toLowerCase() === q;
          });
          if (match) return match;
          
          match = globalCtx.disciplinas.find(d => 
             d.nome.toLowerCase().includes(q) || 
             d.codigo.toLowerCase().includes(q) ||
             q.includes(d.nome.toLowerCase()) ||
             q.includes(d.codigo.toLowerCase())
          );
          if (match) return match;
          
          const result = disciplinaFuse.search(query);
          return result.length > 0 ? result[0].item : null;
        };

        for (const toolCall of response.toolCalls) {
          if (toolCall.name === "atribuir_docente") {
            const { nome_docente, identificador_turma } = toolCall.args;
            const docente = searchDocente(nome_docente);
            const disciplina = searchDisciplina(identificador_turma);

            if (docente && disciplina) {
              const docenteName = docente.nome;

              globalCtx.setAtribuicoes(prev => {
                const index = prev.findIndex(a => a.id_disciplina === disciplina.id);
                if (index >= 0) {
                  const nova = [...prev];
                  if (!nova[index].docentes.includes(docenteName)) {
                    nova[index] = { ...nova[index], docentes: [...nova[index].docentes, docenteName] };
                  }
                  return nova;
                } else {
                  return [...prev, { id_disciplina: disciplina.id, docentes: [docenteName] }];
                }
              });
              answerText = `Feito! Atribuí o(a) docente ${docenteName} à turma ${disciplina.nome}.`;
            } else {
              answerText = `Falha na busca (Base: ${globalCtx.docentes.length} docentes). Não encontrei docente "${nome_docente}" ou turma "${identificador_turma}".`;
            }
          } else if (toolCall.name === "travar_atribuicao") {
            const { nome_docente, identificador_turma } = toolCall.args;
            const disciplina = searchDisciplina(identificador_turma);

            if (disciplina) {
              if (nome_docente) {
                const docente = searchDocente(nome_docente);
                if (docente) {
                  const docenteName = docente.nome;
                  globalCtx.setTravas(prev => [
                    ...prev.filter(t => !(t.id_disciplina === disciplina.id && t.nome_docente === docenteName)),
                    { id_disciplina: disciplina.id, nome_docente: docenteName, trava: true, tipo_trava: TipoTrava.Cell }
                  ]);
                  answerText = `Pronto! Travei a atribuição de ${docenteName} na turma ${disciplina.nome}.`;
                } else {
                  answerText = `Falha: Não encontrei o docente "${nome_docente}".`;
                }
              } else {
                globalCtx.setTravas(prev => [
                  ...prev.filter(t => !(t.id_disciplina === disciplina.id && !t.nome_docente)),
                  { id_disciplina: disciplina.id, trava: true, tipo_trava: TipoTrava.Column }
                ]);
                answerText = `Travei a turma inteira ${disciplina.nome}.`;
              }
            } else {
              answerText = `Falha: Não encontrei a turma "${identificador_turma}".`;
            }
          } else if (toolCall.name === "remover_atribuicao") {
            const { nome_docente, identificador_turma } = toolCall.args;
            const docente = searchDocente(nome_docente);
            const disciplina = searchDisciplina(identificador_turma);

            if (docente && disciplina) {
              const docenteName = docente.nome;

              globalCtx.setAtribuicoes(prev => {
                return prev.map(a => {
                  if (a.id_disciplina === disciplina.id) {
                    return { ...a, docentes: a.docentes.filter(d => d !== docenteName) };
                  }
                  return a;
                });
              });
              answerText = `Removi o(a) docente ${docenteName} da turma ${disciplina.nome}.`;
            } else {
              answerText = `Falha (Base: ${globalCtx.docentes.length} docentes). Não encontrei docente "${nome_docente}" ou turma "${identificador_turma}".`;
            }
          } else if (toolCall.name === "destravar_atribuicao") {
            const { nome_docente, identificador_turma } = toolCall.args;
            const disciplina = searchDisciplina(identificador_turma);

            if (disciplina) {
              if (nome_docente) {
                const docente = searchDocente(nome_docente);
                if (docente) {
                  const docenteName = docente.nome;
                  globalCtx.setTravas(prev => prev.filter(t => !(t.id_disciplina === disciplina.id && t.nome_docente === docenteName)));
                  answerText = `A atribuição de ${docenteName} na turma ${disciplina.nome} foi destravada.`;
                } else {
                  answerText = `Falha: Não encontrei o docente "${nome_docente}".`;
                }
              } else {
                globalCtx.setTravas(prev => prev.filter(t => !(t.id_disciplina === disciplina.id && !t.nome_docente)));
                answerText = `Destravei a turma inteira ${disciplina.nome}.`;
              }
            } else {
              answerText = `Falha: Não encontrei a turma "${identificador_turma}".`;
            }
          } else if (toolCall.name === "limpar_atribuicoes_docente") {
            const { nome_docente } = toolCall.args;
            const docente = searchDocente(nome_docente);

            if (docente) {
              const docenteName = docente.nome;
              globalCtx.setAtribuicoes(prev => prev.map(a => ({
                ...a,
                docentes: a.docentes.filter(d => d !== docenteName)
              })));
              answerText = `Limpei todas as atribuições do(a) docente ${docenteName}.`;
            } else {
              answerText = `Falha: Não encontrei o docente "${nome_docente}" (total na base: ${globalCtx.docentes.length}).`;
            }
          } else if (toolCall.name === "alterar_status_docente") {
            const { nome_docente, ativar } = toolCall.args;
            const docente = searchDocente(nome_docente);

            if (docente) {
              const docenteName = docente.nome;
              globalCtx.setDocentes(prev => prev.map(d => 
                d.nome === docenteName ? { ...d, ativo: ativar } : d
              ));
              answerText = `O status de ${docenteName} foi alterado para ${ativar ? 'Ativo' : 'Inativo'}.`;
            } else {
              answerText = `Falha: Não encontrei o docente "${nome_docente}".`;
            }
          } else if (toolCall.name === "consultar_estado_docente") {
            const { nome_docente } = toolCall.args;
            const docente = searchDocente(nome_docente);

            if (docente) {
              const atribuicoesDocente = globalCtx.atribuicoes.filter(a => a.docentes.includes(docente.nome));
              const nomesDisciplinas = atribuicoesDocente.map(a => {
                const disc = globalCtx.disciplinas.find(d => d.id === a.id_disciplina);
                return disc ? disc.nome : a.id_disciplina;
              });

              answerText = `**Relatório de ${docente.nome}:**\n- Status: ${docente.ativo ? 'Ativo' : 'Inativo'}\n- Turmas atribuídas (${nomesDisciplinas.length}):\n${nomesDisciplinas.length > 0 ? nomesDisciplinas.map(n => '  - ' + n).join('\n') : '  Nenhuma.'}`;
            } else {
              answerText = `Falha: Não encontrei o docente "${nome_docente}" (base com ${globalCtx.docentes.length} regs).`;
            }
          } else if (toolCall.name === "consultar_estado_turma") {
            const { identificador_turma } = toolCall.args;
            const disciplina = searchDisciplina(identificador_turma);

            if (disciplina) {
              const atribuicao = globalCtx.atribuicoes.find(a => a.id_disciplina === disciplina.id);
              const docentesDaTurma = atribuicao ? atribuicao.docentes : [];

              answerText = `**Relatório da Turma ${disciplina.nome} (${disciplina.codigo}):**\n- Carga: ${disciplina.carga || 'Não definida'}\n- Docentes Alocados (${docentesDaTurma.length}):\n${docentesDaTurma.length > 0 ? docentesDaTurma.map(d => '  - ' + d).join('\n') : '  Nenhum.'}`;
            } else {
              answerText = `Falha: Não encontrei a turma "${identificador_turma}".`;
            }
          }
        }
      }

      if (!answerText) {
        answerText = "Não consegui processar a sua solicitação.";
      }

      // Adiciona resposta do bot
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answerText,
        sender: (response.toolCalls && response.toolCalls.length > 0) ? "action" : "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      return answerText; // Retorna o texto para o componente poder "Falar"
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t("connectionError"),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return t("connectionError"); // Retorno de erro para áudio
    } finally {
      setIsTyping(false);
      setSearching(false);
    }
  };

  const value = useMemo(
    () => ({
      isChatOpen,
      openChat,
      closeChat,
      isMuted,
      toggleMute,
      messages,
      sendMessage,
      isTyping,
      clearChat,
      isSearching,
      setSearching,
      chatSize,
      setChatSize,
      cycleSize,
    }),
    [isChatOpen, isMuted, messages, isTyping, isSearching, chatSize],
  );

  return (
    <AvatarChatContext.Provider value={value}>
      {children}
    </AvatarChatContext.Provider>
  );
};

export const useAvatarChat = () => {
  const context = useContext(AvatarChatContext);
  if (!context) {
    throw new Error("useAvatarChat must be used within an AvatarChatProvider");
  }
  return context;
};
