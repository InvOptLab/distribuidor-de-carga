import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["pt-BR", "en"],
  defaultLocale: "pt-BR",
  // Muda de 'as-needed' para 'always'.
  // Isso obriga o Next a mudar a URL de '/' para '/pt-BR' visivelmente
  localePrefix: "always",
});

export const config = {
  // Pega absolutamente TUDO, exceto arquivos de sistema e imagens
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
