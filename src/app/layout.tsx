import { ReactNode } from 'react';

// Como temos um arquivo `not-found.tsx` na raiz do app (necessário para
// rotas que não dão match em nenhum locale), o Next.js exige a presença
// de um layout raiz, mesmo que ele apenas repasse os filhos.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
