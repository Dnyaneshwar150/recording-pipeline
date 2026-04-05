"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { ChunkItem } from "@/components/chunk-item";
import type { ChunkInfo } from "@/lib/types";

interface ChunkListProps {
  chunks: ChunkInfo[];
  onRetry: (chunkIndex: number) => void;
  sessionStatus: "idle" | "recording" | "completed";
}

export function ChunkList({ chunks, onRetry, sessionStatus }: ChunkListProps) {
  const completedCount = chunks.filter(
    (c) => c.status === "transcribed"
  ).length;
  const failedCount = chunks.filter((c) => c.status === "failed").length;
  const processingCount = chunks.length - completedCount - failedCount;

  return (
    <Card className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F]">
              Pipeline Chunks
            </h2>
            <p className="text-xs text-[#4B4B4B] mt-0.5">
              {chunks.length === 0
                ? "Chunks will appear here during recording"
                : `${chunks.length} chunk${chunks.length > 1 ? "s" : ""} processed`}
            </p>
          </div>

          {chunks.length > 0 && (
            <div className="flex items-center gap-3">
              {completedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-[#4B4B4B]">
                    {completedCount}
                  </span>
                </div>
              )}
              {processingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] text-[#4B4B4B]">
                    {processingCount}
                  </span>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-[#4B4B4B]">
                    {failedCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chunk list */}
      <div className="px-6 py-4">
        {chunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-[#4B4B4B]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <path d="M7 2v20" />
                <path d="M17 2v20" />
                <path d="M2 12h20" />
                <path d="M2 7h5" />
                <path d="M2 17h5" />
                <path d="M17 7h5" />
                <path d="M17 17h5" />
              </svg>
            </div>
            <p className="text-xs text-[#4B4B4B]">No chunks yet</p>
            <p className="text-[10px] text-[#4B4B4B]/60 mt-0.5">
              Start recording to see chunks appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chunks.map((chunk) => (
              <ChunkItem
                key={chunk.chunkIndex}
                chunk={chunk}
                onRetry={onRetry}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer status */}
      {chunks.length > 0 && (
        <div className="px-6 pb-4 border-t border-[#E5E7EB]">
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[10px] text-[#4B4B4B]">
              {sessionStatus === "recording"
                ? "Recording — new chunks added every 5s"
                : sessionStatus === "completed"
                  ? "Recording complete"
                  : "Ready"}
            </span>
            <span className="text-[10px] font-mono text-[#4B4B4B]">
              {completedCount}/{chunks.length} done
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
