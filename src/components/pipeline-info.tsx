"use client";

import React from "react";
import { Card } from "@/components/ui/card";

const STEPS = [
  {
    num: "1",
    title: "Record & Chunk",
    desc: "Audio is captured and split into 5s chunks on the client",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Store in OPFS",
    desc: "Chunks are persisted locally for reliability",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Upload & Ack",
    desc: "Uploaded to backend, acknowledged in database",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
    ),
  },
  {
    num: "4",
    title: "Transcribe",
    desc: "Whisper transcribes acknowledged chunks",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function PipelineInfo() {
  return (
    <Card className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-sm font-medium text-[#0F0F0F]">Pipeline Flow</h2>
        <p className="text-xs text-[#4B4B4B] mt-0.5">
          How your audio is processed reliably
        </p>
      </div>
      <div className="px-6 pb-5">
        <div className="grid grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+18px)] w-[calc(100%-36px)] h-px bg-[#E5E7EB] z-0" />
              )}
              <div className="relative z-10 w-10 h-10 rounded-xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center text-[#4B4B4B] group-hover:bg-[#111827] group-hover:text-white group-hover:border-[#111827] transition-all duration-200">
                {step.icon}
              </div>
              <span className="text-[11px] font-medium text-[#0F0F0F] mt-2">
                {step.title}
              </span>
              <span className="text-[9px] text-[#4B4B4B] mt-0.5 leading-tight">
                {step.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
