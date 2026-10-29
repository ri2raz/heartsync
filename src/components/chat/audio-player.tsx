"use client";

import { Pause, Play, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  duration?: number | null;
  isMine: boolean;
  body?: string;
}

export function AudioPlayer({ src, duration, isMine, body }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAnonymized = body?.toLowerCase().includes("anonymized");

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const rem = Math.floor(s % 60);
    return `${mins}:${String(rem).padStart(2, "0")}`;
  };

  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause voice note" : "Play voice note"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95",
            isMine ? "bg-bg text-ink" : "bg-ink text-bg",
          )}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-[140px]">
          {/* Progress bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-current/20">
            <div
              className={cn("h-full transition-all duration-100", isMine ? "bg-rose" : "bg-ink")}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums opacity-75">
            <span>{formatSecs(currentTime)}</span>
            <span>{formatSecs(totalDuration)}</span>
          </div>
        </div>
      </div>

      {isAnonymized ? (
        <div className="flex items-center gap-1 text-[10px] opacity-80">
          <ShieldCheck className="size-3 text-rose" />
          <span>Voice pitch anonymized</span>
        </div>
      ) : null}
    </div>
  );
}
