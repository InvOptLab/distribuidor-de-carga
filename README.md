# 🎓 Distribuidor de Carga Didática (Faculty Assignment Problem - FAP)

Uma plataforma web _full-stack_ avançada projetada para resolver o **Problema de Atribuição de Professores (Faculty Assignment Problem - FAP).**
Este sistema combina modelagem matemática rigorosa, algoritmos de otimização (exatos e heurísticos) e uma interface de usuário interativa e colaborativa para transformar o complexo processo de alocação de turmas em uma tarefa ágil, baseada em dados e otimizada.

## 🚀 Visão Geral e Possibilidade

O **Distribuidor de Carga Didática** não é apenas um executor de algoritmos; é um ambiente de tomada de decisão. Ele permite que coordenadores e gestores acadêmicos:

- **Automatizem alocações:** Processem grandes volumes de dados de docentes, disciplinas e horários para gerar distribuições iniciais de alta qualidade.

- **Simulem cenários:** Ajustem pesos de funções objetivo, relaxem ou enrijeçam restrições (ex: choque de horários, carga máxima/mínima) e comparem diferentes soluções em tempo real.

- **Trabalhem colaborativamente:** Diversos usuários podem interagir com a grade de atribuições simultaneamente, com sincronização via WebSockets.

- **Analisem gargalos:** Visualizem gráficos de distribuição de carga, violações de restrições e estatísticas detalhadas de cada cenário gerado.

---

## 🛠️ Stack Tecnológico

A plataforma foi construída com tecnologias modernas, garantindo performance, tipagem estática e reatividade:

### Frontend & UI/UX

- **Framework:** Next.js (App Router) + React.

- **Linguagem:** TypeScript, garantindo segurança e manutenibilidade estrutural.
- **Estilização:** Material-UI (MUI), proporcionando uma interface limpa, acessível e responsiva.
- **Gráficos:** Componentes dinâmicos para visualização de estatísticas complexas de distribuição.

### Backend, Estado & Colaboração

- **BaaS (Backend as a Service):** Supabase (PostgreSQL).
- **Real Time:** Utilização de Supabase WebSockets (`realtime.sql`) para garantir que as edições na grade de alocação sejam refletidas instantaneamente para todos os usuários conectados.

### Inteligência e Otimização

- **Solvers Matemáticos:** Integração com o solver HiGHS (compilado para WebAssembly - `highs.wasm`) para execução de modelos MILP diretamente no navegador/cliente.

- **IA Generativa:** Implementação de um serviço RAG (Retrieval-Augmented Generation) integrando **Google Gemini** e Vector Stores (Supabase) para atuar como um assistente virtual capaz de tirar dúvidas contextuais sobre as atribuições.

## 🧠 Arquitetura do Motor de Otimização (`src/algoritmo`)

O núcleo inteligente da plataforma foi desenvolvido com uma arquitetura fortemente orientada a objetos e altamente extensível, dividida em dois grandes métodos de resolução:

### 1. Abordagem Exata (MILP)

Utiliza Programação Linear Inteira Mista (Mixed-Integer Linear Programming) para encontrar o ótimo global matemático.

- O modelo formula restrições rígidas (hard constraints) e penalidades (soft constraints).
- Conta com técnicas de Presolve para redução do espaço de busca antes de enviar a matriz matemática para o solver HiGHS.

### 2. Metaheurística (Busca Tabu)

Para instâncias muito grandes onde o modelo exato se torna intratável temporalmente, a plataforma dispõe de uma robusta implementação de Tabu Search.

- **Estruturas de Vizinhança (Neighborhood Generation):** Movimentos atômicos como `Add` (adicionar docente a uma turma), `Remove` (remover docente) e `Swap` (trocar atribuições).

- **Lista Tabu:** Controle inteligente de soluções recentes para escapar de ótimos locais, com critérios de aspiração (ex: `AspirationCriteria/Objective`).

- **Flexibilidade:** Permite configurar todos os componentes do algoritmo.

### 3. Restrições e Componentes Modulares

A lógica de validação é isolada em classes específicas, permitindo plugar e desplugar regras conforme a necessidade da instituição:

- `ChoqueDeHorarios`
- `CargaDeTrabalhoMaximaDocente` / `CargaDeTrabalhoMinimaDocente`
- `DisciplinaSemDocente`
- `ValidaTravas` (respeito às predefinições manuais imutáveis)

As funções objetivo também são modulares (`MinimizarDiferencaCargaDidatica`, `MinimizarDiferencaSaldos`, etc.), permitindo compor o cálculo de "fitness" da solução.

---

## 💻 Principais Funcionalidades da Interface

- `app/inputfile/` **(Ingestão de Dados)**: Interface para upload e validação estrutural de arquivos JSON contendo a configuração semestral (docentes, disciplinas, formulários de preferência).

- `app/atribuicoes/` **(A Grade Colaborativa)**: Uma interface em formato de DataGrid altamente customizada. Possui filtros avançados, efeitos de hover contextuais para identificar rapidamente os pares turma-docente, e sincronização em tempo real.

- `app/comparar/` **(Análise de Cenários)**: Ferramenta lado a lado que permite selecionar diferentes execuções do algoritmo (ou modificações manuais) e comparar as métricas: distribuição de prioridades atendidas, violações de restrições e histogramas de carga de trabalho.

- `app/history/` **&** `app/statistics/`: Rastreabilidade completa. Todo algoritmo executado salva sua solução, permitindo analisar a convergência da Busca Tabu ou o gap do MILP, através de visualizações em árvore (`DataTreeView`) e gráficos em barra.

- **Chatbot com IA** (`components/AvatarChat/`): Um widget flutuante com um avatar dinâmico (com animações `idle`, `searching`, `talking`) que fornece assistência contextualizada ao usuário, alavancando a arquitetura RAG construída em `src/services/ai`.

## ⚙️ Como Executar o Projeto Localmente

Clone o repositório:

```Bash
git clone <url-do-repositorio>
cd distribuidor-de-carga-develop
```

Instale as dependências:

```Bash
npm install
```

Configure as Variáveis de Ambiente:
Crie um arquivo `.env.local` na raiz do projeto com base no `.env.example.` Você precisará das credenciais do Supabase e das chaves de API para os serviços de IA (ex: `GOOGLE_GEMINI_API_KEY`).

Inicie o servidor de desenvolvimento:

```Bash
npm run dev
```

Acesse: Abra <http://localhost:3000> no seu navegador.

## 📂 Estrutura de Diretórios de Destaque

```Plaintext
📦 src
 ┣ 📂 algoritmo           # Motor Core: Abstrações, MILP, Busca Tabu e Restrições
 ┣ 📂 app                 # Rotas do Next.js (App Router) e páginas da interface
 ┃ ┣ 📂 atribuicoes       # DataGrid principal colaborativo
 ┃ ┣ 📂 comparar          # Dashboards de comparação de soluções
 ┃ ┣ 📂 config            # Parametrização dos algoritmos e pesos
 ┃ ┗ ...
 ┣ 📂 components          # Componentes visuais reutilizáveis (UI)
 ┣ 📂 context             # Gerenciamento de estado global e contextos React
 ┣ 📂 hooks               # Custom hooks (ex: Supabase Realtime, Text-to-Speech)
 ┣ 📂 lib                 # Configurações de clientes externos (Supabase, Chart Exporter)
 ┗ 📂 services            # Serviços externos, incluindo a factory de IA e RAG
```
