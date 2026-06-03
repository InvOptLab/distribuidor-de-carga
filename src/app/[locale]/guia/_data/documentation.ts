import { Module } from "../_types/docs";

export const documentationData: Module[] = [
  {
    id: "importacao-dados",
    title: "Gestão e Importação de Dados",
    icon: "dashboard",
    chapters: [
      {
        id: "carregar-dados",
        title: "Carregando seus Dados",
        sections: [
          { id: "como-importar", title: "Como importar um arquivo" },
          { id: "substituicao-dados", title: "Substituição e Backup" },
        ],
        content: [
          {
            type: "heading",
            id: "como-importar",
            content: "Como importar um arquivo",
            level: 2,
          },
          {
            type: "text",
            content:
              "O primeiro passo para utilizar o Distribuidor de Carga é alimentar o sistema com a base de dados da sua instituição, contendo os docentes e as turmas do semestre.",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Acesse a página de Importação",
                description:
                  "No menu na parte superior, clique em 'DADOS' e depois na opção 'Carregar Dados'.",
              },
              {
                label: "Selecione o Arquivo",
                description:
                  "Arraste e solte o seu arquivo JSON na área pontilhada, ou clique sobre ela para abrir o explorador de arquivos do seu computador.",
              },
              {
                label: "Aguarde o Processamento",
                description:
                  "O sistema fará a leitura e validação do documento para garantir que a estrutura dos dados está correta.",
              },
            ],
          },
          {
            type: "image",
            src: "/guia/carregar-dados/carregar-dados.png",
            alt: "[Espaço para Imagem: Tela de Upload de Arquivo com o card pontilhado]",
            caption:
              "Figura 1: Área de arrastar e soltar arquivos na tela de Importação.",
          },
          {
            type: "heading",
            id: "substituicao-dados",
            content: "Substituição e Backup",
            level: 2,
          },
          {
            type: "text",
            content:
              "Se você já possui dados carregados na sua sessão atual e tenta enviar um novo arquivo, o sistema emitirá um alerta de segurança.",
          },
          {
            type: "callout",
            severity: "warning",
            title: "Atenção ao Substituir Dados",
            content:
              "Carregar um novo arquivo apagará permanentemente os docentes, turmas e atribuições que estão atualmente na memória do navegador. Sempre recomendamos utilizar o botão 'Fazer Backup' na janela de aviso antes de prosseguir.",
          },
          {
            type: "video",
            videoUrl: "https://www.youtube.com/embed/qrlRUmIRWYc",
            caption:
              "Vídeo 1: Demonstração do alerta de segurança e o processo recomendado para a criação de backup antes de substituir os dados.",
          },
        ],
      },
    ],
  },
  {
    id: "visualizacoes",
    title: "Ambiente de Atribuições",
    icon: "assignment",
    chapters: [
      {
        id: "visao-tabela",
        title: "Visão em Tabela (Principal)",
        sections: [
          { id: "tabela-overview", title: "Visão Geral e Barra de Ações" },
          { id: "filtros-tabela", title: "Filtros e Buscas" },
          { id: "acoes-atribuicao", title: "Ações da Grade" },
          { id: "historico-exportacao", title: "Histórico e Exportação" },
          { id: "padrao-cores", title: "Entendendo as Cores" },
          { id: "travas-manuais", title: "Inserindo Travas Manuais" },
        ],
        content: [
          {
            type: "heading",
            id: "tabela-overview",
            content: "Visão Geral e Barra de Ações",
            level: 2,
          },
          {
            type: "text",
            content:
              "A Visão em Tabela (Grade de Atribuições) é o coração do sistema. É nela que você visualiza o cruzamento completo entre os Docentes (linhas) e as Turmas (colunas), além de controlar o motor de otimização através da barra de ferramentas superior.",
          },
          {
            type: "image",
            src: "/guia/visualizacoes/visao-tabela/tela-tabela.png",
            alt: "[Espaço para Imagem: Visão geral da Tabela de Atribuições com a Action Bar destacada]",
            caption:
              "Figura 2: Interface principal da Tabela de Atribuições e sua barra de ferramentas.",
          },
          {
            type: "heading",
            id: "filtros-tabela",
            content: "Filtros e Buscas",
            level: 2,
          },
          {
            type: "text",
            content:
              "Para facilitar a navegação em grades muito extensas, utilize o botão de 'Filtros' (ícone de funil) na barra superior. O painel lateral direito será aberto oferecendo as seguintes opções:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Filtros de Docentes: Busque pelo nome do professor ou aplique regras específicas.",
              "Filtros de Turmas: Busque pelo código ou nome da matéria.",
              "Limpeza Rápida: Você pode remover todos os filtros ativos a qualquer momento para voltar à visualização completa da grade.",
            ],
          },
          {
            type: "heading",
            id: "acoes-atribuicao",
            content: "Ações da Grade (Executando e Limpando)",
            level: 2,
          },
          {
            type: "text",
            content:
              "Na barra de ações, você encontra os controles diretos que afetam os dados da tabela:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Executar Algoritmo: Representado pelo ícone de 'Play', este botão aciona o processo de otimização que distribuirá a carga automaticamente baseando-se nas prioridades e restrições.",
              "Limpar Atribuições: Representado pelo ícone de 'Vassoura', remove todas as atribuições atuais da grade, permitindo recomeçar o processo do zero (as travas manuais não são afetadas por padrão).",
              "Salvar no Histórico (ícone de Disquete): Grava a configuração atual da grade na memória do sistema. Soluções já salvas desabilitam este botão para evitar duplicações.",
              "Download (ícone de Seta para baixo): Baixa a grade atual em formato de arquivo (JSON) para o seu computador.",
            ],
          },
          {
            type: "heading",
            id: "padrao-cores",
            content: "Entendendo as Cores (Feedback Visual)",
            level: 2,
          },
          {
            type: "text",
            content:
              "A tabela foi projetada para fornecer informações rápidas através de um sistema de cores dinâmico em suas células e textos:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Tons de Verde nas Células: Indicam o nível de preferência/prioridade preenchida no formulário. A intensidade do verde varia de acordo com a prioridade atribuída.",
              "Cinza: Representa visualmente uma 'Trava' aplicada em uma célula vazia (ou seja, o docente foi travado naquela turma e não poderá ser atribuído a ela).",
              "Vermelho Acinzentado: Representa uma Atribuição Travada (o docente foi atribuído para a turma e essa atribuição não será alterada).",
              "Célula do Docente em Vermelho: Alerta crítico de Choque de Horários. Indica que o docente em questão foi atribuído em turmas cujos horários se sobrepõem.",
            ],
          },
          {
            type: "heading",
            id: "travas-manuais",
            content: "Inserindo Travas Manuais",
            level: 2,
          },
          {
            type: "text",
            content:
              "A 'Trava' fixa uma relação entre um Docente e uma Turma. Ao travar uma célula, você impede que o algoritmo de otimização remova ou modifique aquela atribuição durante a execução.",
          },
          {
            type: "callout",
            severity: "info",
            title: "Como aplicar uma Trava",
            content:
              "Para travar (ou destravar) uma atribuição, basta localizar a célula de interseção entre o Docente e a Turma desejada, segurar a tecla 'Ctrl' (ou 'Cmd' no Mac) no seu teclado e dar um Clique na célula (Ctrl + Click). A célula mudará de cor (para cinza ou vermelho acinzentado) indicando que a trava foi aplicada com sucesso.",
          },
          {
            type: "gif",
            src: "/placeholder-trava.gif",
            alt: "[Espaço para GIF: Mostrando o usuário segurando Ctrl e clicando na célula, que muda de cor]",
            caption:
              "Animação: Utilizando o atalho Ctrl + Click para inserir uma trava manual.",
          },
        ],
      },
      {
        id: "visao-bloco",
        title: "Visão em Blocos",
        sections: [
          { id: "blocos-navegacao", title: "Visão Geral e Navegação Dinâmica" },
          {
            id: "blocos-docentes",
            title: "Cartões de Docentes e Carga Didática",
          },
          {
            id: "blocos-turmas",
            title: "Cartões de Turmas e Alertas de Conflito",
          },
          { id: "blocos-acoes", title: "Atribuições e Travas nos Cartões" },
        ],
        content: [
          {
            type: "heading",
            id: "blocos-navegacao",
            content: "Visão Geral e Navegação Dinâmica",
            level: 2,
          },
          {
            type: "text",
            content:
              "A Visão em Blocos oferece uma interface ágil baseada em cartões (Cards), ideal para gerir as atribuições com um forte foco visual. A sua principal característica é a navegação em profundidade (Drill-down):",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Foco no Docente: Ao clicar no cartão de um Docente, a tela transita para mostrar apenas as Turmas relacionadas a esse professor (as que ele já leciona e as que ele tem preferência).",
              "Foco na Turma: Inversamente, ao clicar num cartão de Turma, a tela transita para mostrar todos os Docentes que têm compatibilidade ou preferência por essa turma.",
              "Trilho de Navegação (Breadcrumbs): No topo da tela, um trilho visual permite-lhe ver exatamente onde está (ex: Docente João -> Turma de Cálculo) e voltar facilmente as telas anteriores.",
            ],
          },
          {
            type: "video",
            videoUrl: "https://www.youtube.com/embed/Du95oeU7uXc",
            caption:
              "Vídeo 2: Demonstração da navegação dinâmica em profundidade (drill-down). O fluxo ilustra a transição da 'Disciplina Anônima 50' para o perfil do 'Docente 21', seguindo para a exploração da 'Disciplina Anônima 43'.",
          },
          {
            type: "heading",
            id: "blocos-docentes",
            content: "Cartões de Docentes e Carga Didática",
            level: 2,
          },
          {
            type: "text",
            content:
              "O cartão do Docente resume o estado atual do professor no semestre. A interface fornece feedback visual imediato sobre a sua carga de trabalho:",
          },
          {
            type: "image",
            src: "/guia/visualizacoes/visao-bloco/bloco-docente-carga-limite.png",
            alt: "[Espaço para Imagem: Cartão de um docente com a barra de progresso vermelha indicando sobrecarga]",
            caption:
              "Figura 3: Exemplo de Cartão de Docente detalhando a carga didática.",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Barra de Carga Didática: Uma barra de progresso horizontal mostra a proporção de carga didática atribuídas em relação ao limite máximo do docente. Se a carga ultrapassar o limite, a barra fica instantaneamente Vermelha para alertar sobre a sobrecarga.",
              "Saldo e Prioridades: Etiquetas coloridas (Chips) indicam o saldo de horas do professor (verde para positivo, vermelho para negativo) e o seu nível de prioridade (apenas para os formulários preenchidos).",
            ],
          },
          {
            type: "heading",
            id: "blocos-turmas",
            content: "Cartões de Turmas e Alertas de Conflito",
            level: 2,
          },
          {
            type: "text",
            content:
              "Os cartões de Turma apresentam informações essenciais como o código, curso, período (ícone de lua para turmas noturnas) e o idioma (se for lecionada em inglês). O sistema monitoriza a integridade dos horários em tempo real:",
          },
          {
            type: "callout",
            severity: "error",
            title: "Alerta de Conflito de Horário",
            content:
              "Se um docente for atribuído a duas turmas que ocorrem no mesmo dia e hora, o cartão da Turma assume um estado de alerta crítico: a borda do cartão torna-se vermelha e um ícone de aviso (Triângulo com ponto de exclamação) surge no canto superior direito.",
          },
          {
            type: "heading",
            id: "blocos-acoes",
            content: "Atribuições e Travas nos Cartões",
            level: 2,
          },
          {
            type: "text",
            content:
              "Ao contrário da Visão em Tabela, onde as ações são feitas nas células, na Visão em Blocos as ações de gestão realizam-se diretamente no rodapé de cada cartão:",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Adicionar ou Remover Atribuição",
                description:
                  "Clique no ícone de Adição (+) azul no rodapé do cartão para atribuir a turma ao docente. Se a turma já estiver atribuída, o botão transforma-se num ícone de Subtração (-) vermelho para remover a atribuição.",
              },
              {
                label: "Travar a Atribuição",
                description:
                  "Clique no ícone de Cadeado para fixar a atribuição. O cadeado irá fechar-se, e o cartão ganhará um fundo e uma borda alaranjados, com um ícone de cadeado no canto superior, indicando que o algoritmo não poderá alterar esta relação.",
              },
              {
                label: "Destravar",
                description:
                  "Basta clicar novamente no ícone de Cadeado (agora aberto) para retirar a restrição manual e devolver a liberdade ao motor de otimização.",
              },
            ],
          },
          {
            type: "gif",
            src: "/placeholder-botoes-bloco.gif",
            alt: "[Espaço para GIF: Mostrando o mouse a clicar no botão de + e depois no cadeado no rodapé de um cartão]",
            caption:
              "Animação: Realizando uma atribuição e travando-a diretamente pelo rodapé do cartão.",
          },
        ],
      },
      {
        id: "visao-planilha",
        title: "Visão em Planilha",
        sections: [
          { id: "planilha-overview", title: "Visão Geral e Edição em Massa" },
          {
            id: "planilha-colunas",
            title: "Gerenciamento e Ordenação de Colunas",
          },
          { id: "planilha-exportacao", title: "Exportação para Excel" },
        ],
        content: [
          {
            type: "heading",
            id: "planilha-overview",
            content: "Visão Geral e Edição em Massa",
            level: 2,
          },
          {
            type: "text",
            content:
              "A Visão em Planilha oferece uma interface densa de dados, inspirada no Microsoft Excel ou Google Sheets. Ela foi desenhada para momentos em que é necessário visualizar muitas propriedades das turmas de uma só vez ou realizar edições pontuais de forma ágil.",
          },
          {
            type: "image",
            src: "/placeholder-planilha.jpg",
            alt: "[Espaço para Imagem: Visão geral da tabela em estilo planilha com múltiplas colunas abertas]",
            caption:
              "Figura 4: Interface da Visão em Planilha com dados tabulares detalhados.",
          },
          {
            type: "text",
            content:
              "Nesta interface, a edição de atribuições ocorre diretamente na célula correspondente, sem necessidade de navegar para outras telas:",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Localize a Célula de Docentes",
                description:
                  "Na linha da turma desejada, encontre a coluna 'Docentes' e clique sobre ela.",
              },
              {
                label: "Selecione ou Remova",
                description:
                  "Uma janela de seleção rápida (Dialog) será aberta, listando todos os professores disponíveis. Você pode marcar novos docentes para a turma ou desmarcar os atuais.",
              },
              {
                label: "Atualização Automática",
                description:
                  "Ao confirmar, a célula é atualizada instantaneamente e o sistema já contabiliza a nova carga didática em segundo plano.",
              },
            ],
          },
          {
            type: "heading",
            id: "planilha-colunas",
            content: "Gerenciamento e Ordenação de Colunas",
            level: 2,
          },
          {
            type: "text",
            content:
              "Como as turmas possuem muitos atributos (Turno, Nível, Horários, Curso, Carga, etc.), a planilha permite que você personalize completamente a sua visualização de trabalho.",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Ocultar e Exibir Colunas: Na barra superior, clique no botão 'Gerenciar Colunas' para abrir o Gerenciador de Colunas. Utilize os seletores (switches) para esconder informações que não são úteis no momento, limpando a sua área de trabalho.",
              "Ordenação Rápida: Clique no título (cabeçalho) de qualquer coluna para ordenar os dados alfabeticamente ou numericamente. Um segundo clique inverte a ordem (crescente/decrescente).",
            ],
          },
          {
            type: "gif",
            src: "/placeholder-column-manager.gif",
            alt: "[Espaço para GIF: Utilizando o Gerenciador de Colunas para ocultar as colunas de Curso e Nível, comprimindo a tabela]",
            caption:
              "Animação: Utilizando o Gerenciador de Colunas para focar apenas nas métricas desejadas.",
          },
          {
            type: "heading",
            id: "planilha-exportacao",
            content: "Exportação para Excel (.xlsx)",
            level: 2,
          },
          {
            type: "text",
            content:
              "Se você precisar apresentar a grade para a direção do departamento ou realizar análises externas, pode utilizar o módulo de exportação nativo.",
          },
          {
            type: "callout",
            severity: "success",
            title: "Exportação Fidedigna",
            content:
              "O botão de 'Exportar Planilha' gera um arquivo .xlsx que respeita exatamente a sua visualização atual. Se você ocultou a coluna 'Horários' e ordenou a tabela pela 'Carga Horária', o Excel gerado virá sem a coluna de horários e ordenado pela carga. O que você vê é o que você exporta.",
          },
        ],
      },
    ],
  },
];
