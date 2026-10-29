"use client";

import { Check, Pause, Play, Shield, Square, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  sessionId: string;
  onAudioSent: (audioMsg: { id: number; mediaUrl: string; duration: number; isAnonymized: boolean }) => void;
  onCancel: () => void;
}

export function AudioRecorder({ sessionId, onAudioSent, onCancel }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [anonymize, setAnonymize] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Start recording on mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          setAudioBlob(rawBlob);
          setAudioUrl(URL.createObjectURL(rawBlob));
          setRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        };

        recorder.start(100);
        setRecording(true);
        setSeconds(0);

        timerRef.current = window.setInterval(() => {
          setSeconds((prev) => {
            if (prev >= 60) {
              // Auto stop at 60s
              recorder.stop();
              return 60;
            }
            return prev + 1;
          });
        }, 1000);
      } catch (err) {
        console.error("Mic access failed", err);
        setError("Microphone access denied or unavailable.");
      }
    }

    void initMic();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  }

  function togglePreview() {
    if (!audioPreviewRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audioPreviewRef.current = audio;
    }

    if (isPlaying) {
      audioPreviewRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current?.play();
      setIsPlaying(true);
    }
  }

  async function applyPitchModulation(blob: Blob): Promise<Blob> {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Render with pitch modification using OfflineAudioContext (deeper, anonymous tone)
      const offlineCtx = new OfflineAudioContext(
        decodedBuffer.numberOfChannels,
        decodedBuffer.length,
        decodedBuffer.sampleRate,
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decodedBuffer;
      // Slight pitch shift via playbackRate down to ~0.84 for voice privacy
      source.playbackRate.value = 0.84;

      const filter = offlineCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3500;

      source.connect(filter);
      filter.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();

      // Convert rendered AudioBuffer to WAV blob
      return audioBufferToWav(renderedBuffer);
    } catch (e) {
      console.warn("Pitch modulation fallback to original audio", e);
      return blob;
    }
  }

  async function handleSend() {
    if (!audioBlob || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      let finalBlob = audioBlob;
      if (anonymize) {
        finalBlob = await applyPitchModulation(audioBlob);
      }

      const formData = new FormData();
      formData.append("file", finalBlob, anonymize ? "voice_note.wav" : "voice_note.webm");
      formData.append("duration", String(Math.max(1, seconds)));
      formData.append("anonymized", anonymize ? "true" : "false");

      const res = await fetch(`/api/sessions/${sessionId}/audio`, {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        messageId?: number;
        mediaUrl?: string;
      };

      if (data.ok && data.messageId && data.mediaUrl) {
        onAudioSent({
          id: data.messageId,
          mediaUrl: data.mediaUrl,
          duration: Math.max(1, seconds),
          isAnonymized: anonymize,
        });
      } else {
        setError(data.error ?? "Failed to send audio note.");
      }
    } catch {
      setError("Network error while uploading audio.");
    } finally {
      setSubmitting(false);
    }
  }

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${String(rem).padStart(2, "0")}`;
  };

  return (
    <div className="rounded-3xl border border-rose/30 bg-rose-soft/70 p-4 shadow-soft">
      {error ? (
        <div className="mb-3 flex items-center justify-between text-xs text-danger">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Recording status or preview */}
        <div className="flex items-center gap-3">
          {recording ? (
            <div className="flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-danger" />
              </span>
              <span className="font-mono text-sm font-semibold text-danger tabular-nums">
                {formatSecs(seconds)} / 1:00
              </span>
              <span className="text-xs text-muted">Recording…</span>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="size-8 rounded-full p-0"
                onClick={togglePreview}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
              </Button>
              <span className="font-mono text-xs font-medium tabular-nums">{formatSecs(seconds)}</span>
              <span className="text-xs text-muted">Ready to send</span>
            </div>
          ) : null}
        </div>

        {/* Anonymity toggle */}
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs text-ink transition hover:bg-surface">
          <input
            type="checkbox"
            checked={anonymize}
            onChange={(e) => setAnonymize(e.target.checked)}
            className="size-3.5 accent-rose"
          />
          <Shield className="size-3.5 text-rose" />
          <span className="font-medium">Anonymize voice</span>
        </label>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {recording ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={stopRecording}
              className="gap-1.5 rounded-full text-xs font-semibold"
            >
              <Square className="size-3.5 fill-current text-danger" />
              Stop
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="size-8 rounded-full p-0 text-muted hover:text-ink"
                aria-label="Discard recording"
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="rose"
                size="sm"
                disabled={submitting}
                onClick={handleSend}
                className="gap-1.5 rounded-full px-4 text-xs font-semibold"
              >
                <Check className="size-3.5" />
                {submitting ? "Sending…" : "Send note"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Utility to write an AudioBuffer to an uncompressed 16-bit PCM WAV Blob */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = numSamples * (bitDepth / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      let sample = 0;
      if (channelData && typeof channelData[i] === "number") {
        sample = channelData[i] as number;
      }
      sample = Math.max(-1, Math.min(1, sample));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
