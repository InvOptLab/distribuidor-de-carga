import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["pt-BR", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await é necessário pois requestLocale agora é uma Promise
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
