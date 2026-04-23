import { type ReactNode } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, children, confirmLabel = "Continue", cancelLabel = "Cancel", onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mb-6 text-sm text-gray-600">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
