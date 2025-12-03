import { Document } from "langchain";

export interface IVectorStoreRepository {
  /**
   * Prepara a base de dados (ex: carrega PDF, cria index)
   */
  initialize(): Promise<void>;

  /**
   * Busca documentos relevantes baseados na query
   */
  search(query: string, k?: number): Promise<Document[]>;
}
