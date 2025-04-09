import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8013");

const useSubtitles = (roomId: string, setSubtitle: (text: string) => void) => {
  useEffect(() => {
    socket.emit("join", roomId);

    socket.on("subtitle", (text: string) => {
      setSubtitle(text);
    });

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let clearTimer: NodeJS.Timeout | null = null;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;

      //set and emit live subtitle
      setSubtitle(transcript);
      socket.emit("subtitle", { roomId, text: transcript });

    
      if (clearTimer) {
        clearTimeout(clearTimer);
      }

      
      if (result.isFinal) {
        clearTimer = setTimeout(() => {
          setSubtitle("");
        }, 3000);
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
    };

    recognition.start();

    return () => {
      recognition.stop();
      socket.off("subtitle");
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [roomId, setSubtitle]);
};

export default useSubtitles;
