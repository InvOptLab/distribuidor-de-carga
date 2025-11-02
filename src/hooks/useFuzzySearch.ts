import { useMemo } from "react";
import Fuse from "fuse.js";
import { avatarChatData, QA } from "@/context/AvatarChat/avatarChatData";

// Opções de configuração para o Fuse.js
const fuseOptions = {
  // Em quais 'chaves' do nosso objeto de dados ele deve procurar
  keys: ["question"],

  // O 'limite' de similaridade (0.0 = acerto perfeito, 1.0 = aceita qualquer coisa)
  // Um valor entre 0.3 e 0.5 costuma ser ideal.
  // Isso significa que a busca não precisa ser perfeita.
  threshold: 0.6,

  // Inclui a pontuação (score) no resultado
  includeScore: true,
};

/**
 * Hook para gerenciar a lógica de busca difusa (fuzzy search)
 * com o Fuse.js
 */
export const useFuzzySearch = () => {
  // 'useMemo' para garantir que o índice de busca seja criado apenas uma vez.
  const fuse = useMemo(() => {
    const searchableData = avatarChatData;
    return new Fuse(searchableData, fuseOptions);
  }, []);

  // Função para encontrar a melhor correspondência
  const findBestMatch = (userInput: string): QA | null => {
    // Busca no índice do Fuse
    const results = fuse.search(userInput);

    // O Fuse retorna um array de resultados, ordenado do melhor (0.0) para o pior
    if (results.length > 0) {
      // Retorna o 'item' do primeiro resultado (o melhor)
      return results[0].item;
    }

    // Nenhum resultado encontrado acima do 'threshold'
    return null;
  };

  return { findBestMatch };
};
