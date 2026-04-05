import { Hono } from "hono";
import { handle } from "hono/vercel";
import { connectDB } from "@/lib/db";
import { Session, Chunk } from "@/lib/models";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const app = new Hono().basePath("/api");

/* ─── Health ─── */
app.get("/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

/* ─── Session: Create ─── */
app.post("/session", async (c) => {
  await connectDB();
  const { sessionId } = await c.req.json();
  const session = await Session.findOneAndUpdate(
    { sessionId },
    { sessionId, status: "recording" },
    { upsert: true, new: true }
  );
  return c.json({ success: true, session });
});

/* ─── Session: Complete ─── */
app.patch("/session/:sessionId", async (c) => {
  await connectDB();
  const sessionId = c.req.param("sessionId");
  const session = await Session.findOneAndUpdate(
    { sessionId },
    { status: "completed" },
    { new: true }
  );
  return c.json({ success: true, session });
});

/* ─── Chunk: Upload ─── */
app.post("/chunk", async (c) => {
  await connectDB();

  const formData = await c.req.formData();
  const sessionId = formData.get("sessionId") as string;
  const chunkIndex = Number(formData.get("chunkIndex"));
  const audioFile = formData.get("audio") as File;

  if (!sessionId || isNaN(chunkIndex) || !audioFile) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }

  /* Save audio file to disk */
  const uploadsDir = path.join(process.cwd(), "uploads", sessionId);
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `chunk_${chunkIndex}.webm`);
  const buffer = Buffer.from(await audioFile.arrayBuffer());
  await writeFile(filePath, buffer);

  /* Upsert chunk in DB */
  const chunk = await Chunk.findOneAndUpdate(
    { sessionId, chunkIndex },
    {
      sessionId,
      chunkIndex,
      status: "uploaded",
      filePath,
    },
    { upsert: true, new: true }
  );

  /* Update session chunk count */
  await Session.findOneAndUpdate(
    { sessionId },
    { $max: { totalChunks: chunkIndex + 1 } }
  );

  return c.json({ success: true, chunk });
});

/* ─── Chunk: Acknowledge ─── */
app.post("/chunk/ack", async (c) => {
  await connectDB();
  const { sessionId, chunkIndex } = await c.req.json();

  const chunk = await Chunk.findOneAndUpdate(
    { sessionId, chunkIndex },
    { status: "acknowledged" },
    { new: true }
  );

  if (!chunk) {
    return c.json({ success: false, error: "Chunk not found" }, 404);
  }

  return c.json({ success: true, chunk });
});

/* ─── Chunk: Transcribe (simulated Whisper) ─── */
app.post("/chunk/transcribe", async (c) => {
  await connectDB();
  const { sessionId, chunkIndex } = await c.req.json();

  const chunk = await Chunk.findOne({ sessionId, chunkIndex });
  if (!chunk) {
    return c.json({ success: false, error: "Chunk not found" }, 404);
  }

  /* 
   * In production, call OpenAI Whisper API here:
   * const transcription = await openai.audio.transcriptions.create({
   *   file: fs.createReadStream(chunk.filePath),
   *   model: "whisper-1",
   * });
   * 
   * For demo purposes, we simulate transcription:
   */
  const sampleTexts = [
    "This is a transcription of the recorded audio segment. The speaker discusses the importance of reliable audio processing pipelines.",
    "The recording continues with detailed analysis of chunked upload patterns and their benefits for data integrity.",
    "Additional context is provided about error recovery mechanisms and how OPFS enables offline-first architectures.",
    "The speaker emphasizes the value of acknowledgment-based systems for ensuring no data loss in distributed uploads.",
    "Final segment covers the integration of speech-to-text services with chunked audio processing workflows.",
  ];

  const transcription = sampleTexts[chunkIndex % sampleTexts.length];

  /* Simulate ~1s processing delay */
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  const updated = await Chunk.findOneAndUpdate(
    { sessionId, chunkIndex },
    { status: "transcribed", transcription },
    { new: true }
  );

  return c.json({ success: true, chunk: updated });
});

/* ─── Session: Get all chunks ─── */
app.get("/session/:sessionId/chunks", async (c) => {
  await connectDB();
  const sessionId = c.req.param("sessionId");
  const chunks = await Chunk.find({ sessionId }).sort({ chunkIndex: 1 });
  return c.json({ success: true, chunks });
});

/* ─── Recovery: Check for un-acked chunks ─── */
app.get("/session/:sessionId/recover", async (c) => {
  await connectDB();
  const sessionId = c.req.param("sessionId");

  /* Find chunks that are acked in DB but might need re-upload */
  const pendingChunks = await Chunk.find({
    sessionId,
    status: { $in: ["pending", "failed"] },
  }).sort({ chunkIndex: 1 });

  return c.json({
    success: true,
    needsRecovery: pendingChunks.length > 0,
    chunks: pendingChunks,
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
