export interface Citation {
  file_id: string;
  file_name: string;
  primary_unit: { type: string; value: string };
  quote: string;
  deep_link: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  tool_calls: [];
  status?: "pending" | "streaming" | "done" | "error";
  error?: string;
}

export type IngestState = "pending" | "running" | "done" | "failed";

export interface IngestFile {
  id: string;
  name: string;
  mime_type: string;
  drive_file_id: string;
}

export interface SkippedFile extends IngestFile {
  skip_reason: string;
}

export interface Folder {
  id: string;
  drive_url: string;
  ingest_state: IngestState;
  created_at: string;
  file_count: number;
  skipped_file_count: number;
  error_message: string | null;
}

export interface FolderDetail extends Folder {
  files: IngestFile[];
  skipped_files: SkippedFile[];
}

export interface Conversation {
  id: string;
  folder_id: string;
  title: string;
  created_at: string;
}
