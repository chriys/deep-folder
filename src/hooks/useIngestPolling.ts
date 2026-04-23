import { useEffect, useRef } from "react";
import { useStore } from "../stores";

export function useIngestPolling(folderId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadFolder = useStore((s) => s.loadFolder);
  const folders = useStore((s) => s.folders);

  useEffect(() => {
    if (!folderId) return;

    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    if (folder.ingest_state !== "pending" && folder.ingest_state !== "running") return;

    intervalRef.current = setInterval(async () => {
      const updated = await loadFolder(folderId);
      if (updated.ingest_state === "done" || updated.ingest_state === "failed") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [folderId, loadFolder, folders]);
}
