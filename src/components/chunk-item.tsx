"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ChunkInfo } from "@/lib/types";

interface ChunkItemProps {
  chunk: ChunkInfo;
  onRetry: (chunkIndex: number) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  recording: {
    label: "Recording",
    color: "#4B4B4B",
    bgColor: "#F6F7F9",
    icon: "●",
  },
  saving: {
    label: "Saving to OPFS",
    color: "#4B4B4B",
    bgColor: "#F6F7F9",
    icon: "↓",
  },
  uploading: {
    label: "Uploading",
    color: "#2563eb",
    bgColor: "#eff6ff",
    icon: "↑",
  },
  uploaded: {
    label: "Uploaded",
    color: "#2563eb",
    bgColor: "#eff6ff",
    icon: "✓",
  },
  acknowledging: {
    label: "Acknowledging",
    color: "#d97706",
    bgColor: "#fffbeb",
    icon: "⟳",
  },
  acknowledged: {
    label: "Acknowledged",
    color: "#16a34a",
    bgColor: "#dcfce7",
    icon: "✓",
  },
  transcribing: {
    label: "Transcribing",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    icon: "⟳",
  },
  transcribed: {
    label: "Complete",
    color: "#16a34a",
    bgColor: "#dcfce7",
    icon: "✓",
  },
  failed: {
    label: "Failed",
    color: "#dc2626",
    bgColor: "#fef2f2",
    icon: "✕",
  },
  retrying: {
    label: "Retrying",
    color: "#d97706",
    bgColor: "#fffbeb",
    icon: "⟳",
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function ChunkItem({ chunk, onRetry }: ChunkItemProps) {
  const config = STATUS_CONFIG[chunk.status] || STATUS_CONFIG.recording;
  const isComplete = chunk.status === "transcribed";
  const isFailed = chunk.status === "failed";
  const isProcessing =
    !isComplete &&
    !isFailed &&
    chunk.status !== "recording";

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${chunk.chunkIndex * 0.05}s` }}
    >
      <div
        className={`
          rounded-xl border transition-all duration-300 overflow-hidden
          ${isComplete
            ? "border-green-200 bg-green-50/50"
            : isFailed
              ? "border-red-200 bg-red-50/50"
              : "border-[#E5E7EB] bg-white"
          }
        `}
      >
        {/* Main row */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Chunk index badge */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
            }}
          >
            {chunk.chunkIndex + 1}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#0F0F0F]">
                Chunk {chunk.chunkIndex + 1}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                }}
              >
                <span className="text-[8px]">{config.icon}</span>
                {config.label}
              </span>
              {chunk.retries > 0 && (
                <span className="text-[10px] text-[#4B4B4B]">
                  (retry {chunk.retries})
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-[#4B4B4B]">
                {formatBytes(chunk.size)}
              </span>
              <span className="text-[10px] text-[#4B4B4B]">
                {new Date(chunk.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Progress or retry */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isFailed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(chunk.chunkIndex)}
                className="h-7 px-3 text-[10px] rounded-lg border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                Retry
              </Button>
            )}

            {isProcessing && (
              <div className="w-20">
                <Progress
                  value={chunk.progress}
                  className="h-1.5 bg-[#E5E7EB]"
                />
              </div>
            )}

            {isComplete && (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Transcription text */}
        {chunk.transcription && (
          <div className="px-4 pb-3 pt-0">
            <div className="bg-[#F6F7F9] rounded-lg px-3 py-2 border border-[#E5E7EB]/50">
              <div className="flex items-center gap-1.5 mb-1">
                <svg
                  className="w-3 h-3 text-[#4B4B4B]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-[10px] font-medium text-[#4B4B4B] uppercase tracking-wider">
                  Transcription
                </span>
              </div>
              <p className="text-xs text-[#0F0F0F] leading-relaxed">
                {chunk.transcription}
              </p>
            </div>
          </div>
        )}

        {/* Error msg */}
        {chunk.error && isFailed && (
          <div className="px-4 pb-3 pt-0">
            <p className="text-[10px] text-red-500">{chunk.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
