import { useState, useCallback, useEffect } from "react";

/**
 * Hook para gerenciar a funcionalidade de Text-to-Speech (TTS).
 * Retorna o estado de fala e a função para iniciar a fala.
 */
export const useTextToSpeech = () => {
  // Este estado é crucial para o lip-sync
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);

  /**
   * Inicia a fala usando a Web Speech API.
   * As callbacks onstart/onend controlam o estado isAvatarSpeaking.
   */
  const speak = useCallback((text: string) => {
    // Para qualquer fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR"; // Garante a voz correta

    utterance.onstart = () => {
      setIsAvatarSpeaking(true);
    };

    utterance.onend = () => {
      setIsAvatarSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Efeito para garantir que a fala seja cancelada se o componente
  // que usa o hook for desmontado
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { isAvatarSpeaking, speak };
};
