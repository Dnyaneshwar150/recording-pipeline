"use client";

import React from "react";
import { useRecorder } from "@/hooks/use-recorder";
import { RecorderCard } from "@/components/recorder-card";
import { ChunkList } from "@/components/chunk-list";
import { PipelineInfo } from "@/components/pipeline-info";

export default function Home() {
  const { session, analyserData, startRecording, stopRecording, retryChunk } =
    useRecorder();

  return (
    <main className="min-h-screen bg-[#F6F7F9]">
      {/* Header */}
      <header className="w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#0F0F0F] tracking-tight">
                Recording Pipeline
              </h1>
              <p className="text-[10px] text-[#4B4B4B]">
                Reliable chunked recording & transcription
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                session.status === "recording"
                  ? "bg-red-500 animate-pulse"
                  : session.status === "completed"
                    ? "bg-green-500"
                    : "bg-[#E5E7EB]"
              }`}
            />
            <span className="text-[10px] text-[#4B4B4B] capitalize">
              {session.status}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col items-center gap-6">
        {/* Pipeline info */}
        <PipelineInfo />

        {/* Recorder */}
        <RecorderCard
          isRecording={session.status === "recording"}
          duration={session.duration}
          analyserData={analyserData}
          onStart={startRecording}
          onStop={stopRecording}
          sessionId={session.sessionId}
        />

        {/* Chunk list */}
        <ChunkList
          chunks={session.chunks}
          onRetry={retryChunk}
          sessionStatus={session.status}
        />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E7EB] bg-white mt-auto">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] text-[#4B4B4B]">
            OPFS + Chunked Upload + Whisper Transcription
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-[#4B4B4B]">System Online</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
