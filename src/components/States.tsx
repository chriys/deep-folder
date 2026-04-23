interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center text-center"
      data-testid="error-state"
    >
      <p className="mb-2 text-sm text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
        data-testid="retry-button"
      >
        Retry
      </button>
    </div>
  );
}
