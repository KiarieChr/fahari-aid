import { useCallback, useRef } from 'react';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // A clean "Ding" sound

export const useNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNewOrderSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      }
      
      // Reset sound to start if it's already playing
      audioRef.current.currentTime = 0;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio playback failed. User interaction might be required.", error);
        });
      }
    } catch (err) {
      console.error("Error playing notification sound:", err);
    }
  }, []);

  return { playNewOrderSound };
};
