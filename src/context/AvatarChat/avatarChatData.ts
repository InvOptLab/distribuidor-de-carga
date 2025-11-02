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
    id: "qa-01",
    question: "Como eu faço uma atribuição manual?",
    answer:
      "Para atribuir um docente a uma turma, basta clicar na célula correspondente à linha do docente e à coluna da turma. A célula ficará vermelha, indicando a atribuição.",
  },
  {
    id: "qa-02",
    question: "Como eu removo uma atribuição manual?",
    answer:
      "Clique novamente na célula vermelha (que indica uma atribuição). A atribuição será desfeita e a célula voltará à sua cor original (de prioridade ou branca).",
  },
  {
    id: "qa-03",
    question: "O que são as 'Travas'?",
    answer:
      "Travas são uma forma de proteger células, linhas ou colunas de alterações. Uma célula travada (cinza) não pode ser atribuída ou desatribuída. Além disso, atribuições travadas não são removidas ao usar a função 'Limpar'.",
  },
  {
    id: "qa-04",
    question: "Como eu adiciono ou removo uma Trava?",
    answer:
      "Mantenha a tecla Ctrl pressionada e clique no local que deseja travar (ou destravar):\n Para travar uma célula: Ctrl + Clique na célula.\n Para travar uma linha: Ctrl + Clique no nome do docente.\n Para travar uma coluna: Ctrl + Clique no cabeçalho da turma.",
  },
  {
    id: "qa-05",
    question: "O que significam as cores nas células?",
    answer:
      "As cores indicam o estado da célula:\n Vermelha: O docente está atribuído àquela turma." +
      "\n Cinza: A célula está travada." +
      "\n Tons de Verde/Azul: Indicam a prioridade que o docente deu para aquela turma (quanto mais intensa, maior a prioridade)." +
      "\n Branca: O docente não indicou prioridade para a turma.",
  },
  {
    id: "qa-06",
    question: "Por que o nome de um docente está destacado em rosa/vermelho?",
    answer:
      "Isso indica um conflito de horário. Significa que o docente está atribuído a duas ou mais turmas que ocorrem no mesmo dia e horário.",
  },
  {
    id: "qa-07",
    question: "O que o botão 'Executar' faz?",
    answer:
      "O botão 'Executar' inicia o algoritmo de otimização (como o Busca Tabu ou MILP) para gerar uma solução de atribuição automaticamente. Uma janela de progresso será exibida durante a execução.",
  },
  {
    id: "qa-08",
    question: "A solução do algoritmo é salva automaticamente?",
    answer:
      "Não. Após o algoritmo terminar, você verá a solução na janela de diálogo. Você precisa clicar no botão 'Aplicar' para que essa nova solução seja carregada na grade. A solução só é salva no histórico após ser aplicada.",
  },
  {
    id: "qa-09",
    question: "O que o botão 'Limpar' faz?",
    answer:
      "O botão 'Limpar' remove todas as atribuições (células vermelhas) da grade, exceto aquelas que estão travadas (células cinzas). Esta ação é irreversível.",
  },
  {
    id: "qa-10",
    question: "Qual a diferença entre 'Salvar' e 'Download'?",
    answer:
      "Salvar: Salva o estado atual da grade (incluindo suas alterações manuais) no histórico de soluções da aplicação." +
      "\nDownload: Exporta o estado atual da grade (atribuições, travas, etc.) como um arquivo JSON para o seu computador.",
  },
  {
    id: "qa-11",
    question: "Como posso ver mais detalhes de um docente ou turma?",
    answer:
      "Apenas passe o mouse sobre o nome de um docente ou sobre o cabeçalho de uma turmas. Um cartão com informações detalhadas (como saldo do docente ou horários da turma) aparecerá no canto inferior da tela.",
  },
  {
    id: "qa-12",
    question: "Como posso filtrar a grade?",
    answer:
      "Clique no ícone de Filtro (funil) na barra de ações. Um painel lateral será aberto, permitindo que você filtre docentes e turmas por nome, código, nível, grupo, dias da semana, e outros campos.",
  },
];

export const fallbackResponse: QA = {
  id: "fallback",
  question: "Fallback", // Apenas para uso interno
  answer:
    "Desculpe, eu não consegui entender. Você pode tentar reformular a pergunta?",
};
