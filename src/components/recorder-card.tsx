"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/waveform";

interface RecorderCardProps {
  isRecording: boolean;
  duration: number;
  analyserData: number[];
  onStart: () => void;
  onStop: () => void;
  sessionId: string;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function RecorderCard({
  isRecording,
  duration,
  analyserData,
  onStart,
  onStop,
  sessionId,
}: RecorderCardProps) {
  return (
    <Card className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F]">
              Audio Recorder
            </h2>
            <p className="text-xs text-[#4B4B4B] mt-0.5">
              {isRecording
                ? "Recording in progress..."
                : "Click to start recording"}
            </p>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-mono text-[#4B4B4B] tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="px-6 py-4">
        <div className="bg-[#F6F7F9] rounded-xl p-4 border border-[#E5E7EB]/60">
          <Waveform data={analyserData} isRecording={isRecording} />
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-6 flex items-center justify-center gap-3">
        {!isRecording ? (
          <Button
            id="start-recording-btn"
            onClick={onStart}
            className="h-11 px-8 rounded-xl bg-[#111827] hover:bg-[#0F0F0F] text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Start Recording
          </Button>
        ) : (
          <Button
            id="stop-recording-btn"
            onClick={onStop}
            className="h-11 px-8 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Recording
          </Button>
        )}
      </div>

      {/* Session ID */}
      {sessionId && (
        <div className="px-6 pb-4 border-t border-[#E5E7EB]">
          <div className="pt-3 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#4B4B4B] font-medium">
              Session
            </span>
            <span className="text-[10px] font-mono text-[#4B4B4B] bg-[#F6F7F9] px-2 py-0.5 rounded-md">
              {sessionId}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
