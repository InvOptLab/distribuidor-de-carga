/**
 * Tipos de algoritmos disponíveis no sistema
 */
export type AlgorithmType = "tabu-search" | "integer-solver" | "simulated-annealing";

/**
 * Seção de configuração de um algoritmo
 */
export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * Definição de um algoritmo
 */
export interface Algorithm {
  id: AlgorithmType;
  name: string;
  description: string;
  icon: string;
  configSections: ConfigSection[];
}

/**
 * Algoritmos disponíveis no sistema
 */
export const AVAILABLE_ALGORITHMS: Algorithm[] = [
  {
    id: "tabu-search",
    name: "Busca Tabu",
    description: "Algoritmo de busca local com memória adaptativa",
    icon: "🔍",
    configSections: [
      {
        id: "tabu-list",
        title: "Lista Tabu",
        description: "Configure o tipo e tamanho da lista tabu",
        icon: "🚫",
      },
      {
        id: "constraints",
        title: "Restrições",
        description: "Gerencie as restrições rígias e flexíveis do algoritmo",
        icon: "⚖️",
      },
      {
        id: "objectiveCost",
        title: "Custos da Função Objetivo",
        description:
          "Configure os custos que serão considerados na função objetivo",
        icon: "🎯",
      },
      {
        id: "neighborhood",
        title: "Geração da Vizinhança",
        description: "Configure as funções de geração de vizinhança",
        icon: "🔄",
      },
      {
        id: "stop-criteria",
        title: "Critérios de Parada",
        description: "Defina quando o algoritmo deve parar",
        icon: "⏹️",
      },
      {
        id: "aspiration",
        title: "Critérios de Aspiração",
        description: "Configure critérios para aceitar soluções tabu",
        icon: "✨",
      },
    ],
  },
  {
    id: "integer-solver",
    name: "Solver Inteiro",
    description: "Solver de programação linear inteira",
    icon: "🧮",
    configSections: [
      {
        id: "constraints",
        title: "Restrições",
        description: "Gerencie as restrições rígias e flexíveis do algoritmo",
        icon: "⚖️",
      },
      {
        id: "objectiveCost",
        title: "Custos da Função Objetivo",
        description:
          "Configure os custos que serão considerados na função objetivo",
        icon: "🎯",
      },
    ],
  },
  {
    id: "simulated-annealing",
    name: "Simulated Annealing",
    description: "Têmpera Simulada: Algoritmo de busca estocástica inspirado no resfriamento de metais",
    icon: "🔥",
    configSections: [
      {
        id: "sa-config",
        title: "Parâmetros do Resfriamento",
        description: "Configure Temperatura Inicial, Taxa de Resfriamento e Iterações",
        icon: "🌡️",
      },
      {
        id: "constraints",
        title: "Restrições",
        description: "Gerencie as restrições rígias e flexíveis do algoritmo",
        icon: "⚖️",
      },
      {
        id: "objectiveCost",
        title: "Custos da Função Objetivo",
        description:
          "Configure os custos que serão considerados na função objetivo",
        icon: "🎯",
      },
      {
        id: "neighborhood",
        title: "Geração da Vizinhança",
        description: "Configure as funções de geração de vizinhança",
        icon: "🔄",
      },
      {
        id: "stop-criteria",
        title: "Critérios de Parada",
        description: "Defina quando o algoritmo deve parar",
        icon: "⏹️",
      }
    ],
  },
];

