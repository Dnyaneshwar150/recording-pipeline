export type ChunkStatus =
  | "recording"
  | "saving"
  | "uploading"
  | "uploaded"
  | "acknowledging"
  | "acknowledged"
  | "transcribing"
  | "transcribed"
  | "failed"
  | "retrying";

export interface ChunkInfo {
  chunkIndex: number;
  status: ChunkStatus;
  progress: number;        // 0–100
  transcription: string;
  retries: number;
  size: number;            // bytes
  timestamp: number;       // epoch ms
  error?: string;
}

export interface SessionInfo {
  sessionId: string;
  status: "idle" | "recording" | "completed";
  duration: number;        // seconds
  chunks: ChunkInfo[];
}
