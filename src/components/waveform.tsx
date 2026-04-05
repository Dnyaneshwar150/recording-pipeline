"use client";

import React from "react";

interface WaveformProps {
  data: number[];
  isRecording: boolean;
}

export function Waveform({ data, isRecording }: WaveformProps) {
  const bars = data.length > 0 ? data : Array(64).fill(0);

  return (
    <div className="flex items-center justify-center gap-[2px] h-20 w-full px-4">
      {bars.map((val, i) => {
        const height = isRecording ? Math.max(val * 100, 4) : 4;
        const delay = `${(i * 0.02).toFixed(2)}s`;

        return (
          <div
            key={i}
            className="rounded-full transition-all duration-150 ease-out"
            style={{
              width: "3px",
              height: `${height}%`,
              backgroundColor: isRecording
                ? `rgba(15, 15, 15, ${0.3 + val * 0.7})`
                : "#E5E7EB",
              transitionDelay: delay,
              minHeight: "3px",
            }}
          />
        );
      })}
    </div>
  );
}
