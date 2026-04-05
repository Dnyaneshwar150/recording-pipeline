"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { saveChunkToOPFS, readChunkFromOPFS } from "@/lib/opfs";
import type { ChunkInfo, SessionInfo } from "@/lib/types";

const CHUNK_INTERVAL_MS = 5_000; // 5-second chunks
const MAX_RETRIES = 3;

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useRecorder() {
  const [session, setSession] = useState<SessionInfo>({
    sessionId: "",
    status: "idle",
    duration: 0,
    chunks: [],
  });
  const [analyserData, setAnalyserData] = useState<number[]>([]);
  const [fullRecordingUrl, setFullRecordingUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fullRecorderRef = useRef<MediaRecorder | null>(null);
  const fullChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const chunkTimerRef = useRef<ReturnType<typeof setInterval>>();
  const sessionIdRef = useRef("");

  /* ── Analyser visualisation loop ── */
  const updateAnalyser = useCallback((time?: number) => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    // Downsample to 64 bars
    const step = Math.floor(data.length / 64);
    const bars: number[] = [];
    for (let i = 0; i < 64; i++) {
      bars.push(data[i * step] / 255);
    }
    setAnalyserData(bars);
    animFrameRef.current = requestAnimationFrame(updateAnalyser);
  }, []);

  /* ── Update a single chunk's state ── */
  const updateChunk = useCallback(
    (chunkIndex: number, update: Partial<ChunkInfo>) => {
      setSession((prev) => ({
        ...prev,
        chunks: prev.chunks.map((ch) =>
          ch.chunkIndex === chunkIndex ? { ...ch, ...update } : ch
        ),
      }));
    },
    []
  );

  /* ── Upload + ack + transcribe pipeline per chunk ── */
  const processChunk = useCallback(
    async (sessionId: string, chunkIndex: number, blob: Blob) => {
      const attempt = async (retries: number): Promise<void> => {
        try {
          /* 1) Save to OPFS */
          updateChunk(chunkIndex, { status: "saving", progress: 10 });
          await saveChunkToOPFS(sessionId, chunkIndex, blob);
          updateChunk(chunkIndex, { progress: 20 });

          /* 2) Upload to backend */
          updateChunk(chunkIndex, { status: "uploading", progress: 30 });
          const formData = new FormData();
          formData.append("sessionId", sessionId);
          formData.append("chunkIndex", String(chunkIndex));
          formData.append("audio", blob, `chunk_${chunkIndex}.webm`);

          const uploadRes = await fetch("/api/chunk", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) throw new Error("Upload failed");
          updateChunk(chunkIndex, { status: "uploaded", progress: 50 });

          /* 3) Acknowledge */
          updateChunk(chunkIndex, { status: "acknowledging", progress: 60 });
          const ackRes = await fetch("/api/chunk/ack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, chunkIndex }),
          });

          if (!ackRes.ok) throw new Error("Ack failed");
          updateChunk(chunkIndex, { status: "acknowledged", progress: 75 });

          /* 4) Transcribe */
          updateChunk(chunkIndex, { status: "transcribing", progress: 85 });
          const transcribeRes = await fetch("/api/chunk/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, chunkIndex }),
          });

          if (!transcribeRes.ok) throw new Error("Transcription failed");

          const transcribeData = await transcribeRes.json();
          updateChunk(chunkIndex, {
            status: "transcribed",
            progress: 100,
            transcription: transcribeData.chunk?.transcription || "",
          });
        } catch (err) {
          if (retries < MAX_RETRIES) {
            updateChunk(chunkIndex, {
              status: "retrying",
              retries: retries + 1,
              error: `Retry ${retries + 1}/${MAX_RETRIES}`,
            });

            /* Try re-reading from OPFS if we have it */
            const opfsBlob = await readChunkFromOPFS(sessionId, chunkIndex);
            const retryBlob = opfsBlob || blob;
            await new Promise((r) => setTimeout(r, 1000 * (retries + 1)));
            return attempt(retries + 1);
          }

          updateChunk(chunkIndex, {
            status: "failed",
            progress: 0,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      };

      await attempt(0);
    },
    [updateChunk]
  );

  /* ── Retry a failed chunk from OPFS ── */
  const retryChunk = useCallback(
    async (chunkIndex: number) => {
      const sessionId = sessionIdRef.current;
      const opfsBlob = await readChunkFromOPFS(sessionId, chunkIndex);
      if (!opfsBlob) {
        updateChunk(chunkIndex, {
          status: "failed",
          error: "No OPFS data found for retry",
        });
        return;
      }
      updateChunk(chunkIndex, {
        status: "retrying",
        progress: 5,
        retries: 0,
        error: undefined,
      });
      await processChunk(sessionId, chunkIndex, opfsBlob);
    },
    [processChunk, updateChunk]
  );

  /* ── Start recording ── */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      /* Set up analyser */
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const newSessionId = generateSessionId();
      sessionIdRef.current = newSessionId;
      chunkIndexRef.current = 0;

      setSession({
        sessionId: newSessionId,
        status: "recording",
        duration: 0,
        chunks: [],
      });
      setFullRecordingUrl(null);
      fullChunksRef.current = [];

      /* Register session in backend */
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: newSessionId }),
      });

      /* Start full recorder */
      const fullRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      fullRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          fullChunksRef.current.push(e.data);
        }
      };
      fullRecorder.onstop = () => {
        const fullBlob = new Blob(fullChunksRef.current, { type: "audio/webm;codecs=opus" });
        setFullRecordingUrl(URL.createObjectURL(fullBlob));
      };
      fullRecorder.start();
      fullRecorderRef.current = fullRecorder;

      /* Duration timer */
      timerRef.current = setInterval(() => {
        setSession((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      /* Start analyser loop */
      updateAnalyser();

      /* Chunk Recorder logic */
      const startChunkRecorder = () => {
        if (!streamRef.current) return null;
        const mediaRecorder = new MediaRecorder(streamRef.current, {
          mimeType: "audio/webm;codecs=opus",
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const idx = chunkIndexRef.current++;
            const newChunk: ChunkInfo = {
              chunkIndex: idx,
              status: "recording",
              progress: 0,
              transcription: "",
              retries: 0,
              size: e.data.size,
              timestamp: Date.now(),
            };

            setSession((prev) => ({
              ...prev,
              chunks: [...prev.chunks, newChunk],
            }));

            /* Fire-and-forget processing */
            processChunk(newSessionId, idx, e.data);
          }
        };

        mediaRecorder.start();
        return mediaRecorder;
      };

      mediaRecorderRef.current = startChunkRecorder();

      chunkTimerRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = startChunkRecorder();
        }
      }, CHUNK_INTERVAL_MS);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [processChunk, updateAnalyser]);

  /* ── Stop recording ── */
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (fullRecorderRef.current?.state === "recording") {
      fullRecorderRef.current.stop();
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    cancelAnimationFrame(animFrameRef.current);
    setAnalyserData([]);

    if (timerRef.current) clearInterval(timerRef.current);
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);

    /* Mark session completed */
    if (sessionIdRef.current) {
      await fetch(`/api/session/${sessionIdRef.current}`, {
        method: "PATCH",
      });
    }

    setSession((prev) => ({ ...prev, status: "completed" }));
  }, []);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    session,
    analyserData,
    fullRecordingUrl,
    startRecording,
    stopRecording,
    retryChunk,
  };
}
