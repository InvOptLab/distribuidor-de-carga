"use server";

export async function fetchProfileImage(url: string) {
  try {
    if (!url) return null;
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Retorna a imagem formatada pronta para o src
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    return null;
  }
}
