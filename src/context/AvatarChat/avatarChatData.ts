export interface QA {
  id: string;
  question: string;
  answer: string;
}

export const avatarChatData: QA[] = [
  {
    id: "q1",
    question: "Qual é o seu nome?",
    answer: "Meu nome é José. Sou seu assistente virtual neste software.",
  },
  {
    id: "q2",
    question: "O que este software faz?",
    answer:
      "Esta plataforma ajuda você a gerenciar seus projetos de otimização de forma eficiente.",
  },
  {
    id: "q3",
    question: "Como eu começo?",
    answer:
      "É fácil! Você pode começar criando um novo projeto no painel principal ou importando seus dados.",
  },
];
