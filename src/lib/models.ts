import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  status: "recording" | "completed" | "failed";
  totalChunks: number;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["recording", "completed", "failed"],
      default: "recording",
    },
    totalChunks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

/* ─── Chunk ─── */

export interface IChunk extends Document {
  sessionId: string;
  chunkIndex: number;
  status: "pending" | "uploaded" | "acknowledged" | "transcribed" | "failed";
  filePath: string;
  transcription: string;
  retries: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChunkSchema = new Schema<IChunk>(
  {
    sessionId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "uploaded", "acknowledged", "transcribed", "failed"],
      default: "pending",
    },
    filePath: { type: String, default: "" },
    transcription: { type: String, default: "" },
    retries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChunkSchema.index({ sessionId: 1, chunkIndex: 1 }, { unique: true });

export const Chunk: Model<IChunk> =
  mongoose.models.Chunk || mongoose.model<IChunk>("Chunk", ChunkSchema);
