"use server";

export async function fetchProfileImage(url: string) {
  if (!url) return null;

  try {
    // Adicionamos Headers para "enganar" o Google
    // Fingimos ser um Chrome rodando no Windows
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
      Referer: "https://scholar.google.com/",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
    };

    // Usamos o 'next: { revalidate }' para cachear
    // Se a imagem já foi baixada na última hora (3600s), a Vercel nem bate no Google,
    // ela devolve a cópia salva. Isso evita o erro 429 (Too Many Requests).
    const response = await fetch(url, {
      headers,
      next: { revalidate: 86400 }, // Cache por 24 horas (imagens de perfil mudam pouco)
    });

    if (!response.ok) {
      console.error(
        `❌ Erro Google Scholar (${response.status}): ${response.statusText}`
      );
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Detecta o tipo de conteúdo ou assume jpeg
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("❌ Erro fatal ao buscar imagem:", error);
    return null;
  }
}
