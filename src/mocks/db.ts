import type { Folder, Conversation, IngestState, IngestFile } from "../types";

export { fakeId } from "./helpers";

export interface MockFile extends IngestFile {
  /* same shape */
}

export interface MockSkippedFile extends MockFile {
  skip_reason: string;
}

export interface MockFolder extends Folder {
  files: MockFile[];
  skipped_files: MockSkippedFile[];
}

export interface MockConversation extends Conversation {
  messageCount: number;
}

interface MockDB {
  auth: { connected: boolean; email: string };
  folders: MockFolder[];
  conversations: MockConversation[];
  sseErrorMode: boolean;
  authAllowlistError: boolean;
}

const seedFiles: MockFile[] = [
  { id: "f1", name: "report-2024-q4.pdf", mime_type: "application/pdf", drive_file_id: "drive_f1" },
  { id: "f2", name: "meeting-notes.docx", mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", drive_file_id: "drive_f2" },
  { id: "f3", name: "architecture-overview.pdf", mime_type: "application/pdf", drive_file_id: "drive_f3" },
  { id: "f4", name: "budget.xlsx", mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", drive_file_id: "drive_f4" },
];

const seedSkipped: MockSkippedFile[] = [
  { id: "s1", name: "image.png", mime_type: "image/png", drive_file_id: "drive_s1", skip_reason: "unsupported file type" },
  { id: "s2", name: "video.mp4", mime_type: "video/mp4", drive_file_id: "drive_s2", skip_reason: "file too large" },
];

const db: MockDB = {
  auth: { connected: false, email: "" },
  folders: [
    {
      id: "folder_1",
      drive_url: "https://drive.google.com/drive/folders/abc123",
      ingest_state: "done",
      created_at: "2026-04-20T10:00:00Z",
      file_count: 4,
      skipped_file_count: 2,
      error_message: null,
      files: seedFiles,
      skipped_files: seedSkipped,
    },
    {
      id: "folder_failed",
      drive_url: "https://drive.google.com/drive/folders/failed123",
      ingest_state: "failed",
      created_at: "2026-04-21T10:00:00Z",
      file_count: 0,
      skipped_file_count: 0,
      error_message: "Indexing failed due to a transient error",
      files: [],
      skipped_files: [],
    },
  ],
  conversations: [
    { id: "conv_1", folder_id: "folder_1", title: "Q4 Report Questions", created_at: "2026-04-21T14:00:00Z", messageCount: 3 },
  ],
  sseErrorMode: false,
  authAllowlistError: false,
};

export function getDb(): MockDB {
  return db;
}

export function resetDb(): void {
  db.auth = { connected: false, email: "" };
  db.folders = [
    {
      id: "folder_1",
      drive_url: "https://drive.google.com/drive/folders/abc123",
      ingest_state: "done",
      created_at: "2026-04-20T10:00:00Z",
      file_count: 4,
      skipped_file_count: 2,
      error_message: null,
      files: seedFiles,
      skipped_files: seedSkipped,
    },
    {
      id: "folder_failed",
      drive_url: "https://drive.google.com/drive/folders/failed123",
      ingest_state: "failed",
      created_at: "2026-04-21T10:00:00Z",
      file_count: 0,
      skipped_file_count: 0,
      error_message: "Indexing failed due to a transient error",
      files: [],
      skipped_files: [],
    },
  ];
  db.conversations = [
    { id: "conv_1", folder_id: "folder_1", title: "Q4 Report Questions", created_at: "2026-04-21T14:00:00Z", messageCount: 3 },
  ];
  db.sseErrorMode = false;
  db.authAllowlistError = false;
}

const folderCallCount: Record<string, number> = {};

export function getFolderCallCount(id: string): number {
  return folderCallCount[id] ?? 0;
}

export function incrementFolderCallCount(id: string): void {
  folderCallCount[id] = (folderCallCount[id] ?? 0) + 1;
}

export function resetFolderCallCounts(): void {
  Object.keys(folderCallCount).forEach((k) => delete folderCallCount[k]);
}

export function nextIngestState(current: IngestState): IngestState {
  if (current === "pending") return "running";
  if (current === "running") return "done";
  return current;
}
