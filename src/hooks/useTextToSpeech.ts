import { useState, useCallback, useEffect } from "react";
import { useAvatarChat } from "@/context/AvatarChat/AvatarChatContext"; // Importar o contexto

export const useTextToSpeech = () => {
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const { isMuted } = useAvatarChat();

  const speak = useCallback(
    (text: string) => {
      // Sempre cancela falas anteriores
      window.speechSynthesis.cancel();

      if (isMuted) {
        // Se estiver mudo, "finja" que está falando para o GIF animar
        setIsAvatarSpeaking(true);

        // Estima um tempo de fala falso baseado no tamanho do texto
        // (ex: 60ms por caractere, com um mínimo de 1 segundo)
        const fakeSpeakTime = Math.max(1000, text.length * 60);

        setTimeout(() => {
          setIsAvatarSpeaking(false);
        }, fakeSpeakTime);
      } else {
        // Se NÃO estiver mudo, toca o áudio normalmente
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";

        utterance.onstart = () => {
          setIsAvatarSpeaking(true);
        };

        utterance.onend = () => {
          setIsAvatarSpeaking(false);
        };

        // Limpa em caso de erro
        utterance.onerror = () => {
          setIsAvatarSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      }
    },
    [isMuted]
  );

  // Efeito para cancelar a fala se o componente for desmontado
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsAvatarSpeaking(false);
  }, []);

  return { isAvatarSpeaking, speak, stop };
};
