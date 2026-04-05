/**
 * Origin Private File System (OPFS) helper
 * Stores audio chunks locally for reliability & recovery.
 */

async function getSessionDir(sessionId: string): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(sessionId, { create: true });
}

/** Save a chunk blob into OPFS */
export async function saveChunkToOPFS(
  sessionId: string,
  chunkIndex: number,
  blob: Blob
): Promise<void> {
  const dir = await getSessionDir(sessionId);
  const fileHandle = await dir.getFileHandle(`chunk_${chunkIndex}.webm`, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/** Read a chunk blob from OPFS */
export async function readChunkFromOPFS(
  sessionId: string,
  chunkIndex: number
): Promise<Blob | null> {
  try {
    const dir = await getSessionDir(sessionId);
    const fileHandle = await dir.getFileHandle(`chunk_${chunkIndex}.webm`);
    const file = await fileHandle.getFile();
    return file;
  } catch {
    return null;
  }
}

/** Remove a single chunk from OPFS */
export async function removeChunkFromOPFS(
  sessionId: string,
  chunkIndex: number
): Promise<void> {
  try {
    const dir = await getSessionDir(sessionId);
    await dir.removeEntry(`chunk_${chunkIndex}.webm`);
  } catch {
    /* file may not exist */
  }
}

/** List all chunk indexes stored in OPFS for a session */
export async function listOPFSChunks(sessionId: string): Promise<number[]> {
  try {
    const dir = await getSessionDir(sessionId);
    const indexes: number[] = [];
    for await (const entry of (dir as any).values()) {
      const match = entry.name.match(/^chunk_(\d+)\.webm$/);
      if (match) indexes.push(Number(match[1]));
    }
    return indexes.sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/** Clean up all chunks for a session */
export async function clearSessionOPFS(sessionId: string): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(sessionId, { recursive: true });
  } catch {
    /* session dir may not exist */
  }
}
