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
}

export type IngestState = "pending" | "running" | "done" | "failed";

export interface FolderFile {
  id: string;
  name: string;
  mime_type: string;
  drive_file_id: string;
}

export interface Folder {
  id: string;
  drive_url: string;
  ingest_state: IngestState;
  created_at: string;
  files?: FolderFile[];
  skipped_files?: (FolderFile & { skip_reason: string })[];
}

export interface Conversation {
  id: string;
  folder_id: string;
  title: string;
  created_at: string;
}
