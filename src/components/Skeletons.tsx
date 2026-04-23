export function SkeletonFolderList() {
  return (
    <div className="space-y-2 p-4" data-testid="skeleton-folder-list">
      <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-200" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 p-4"
        >
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonConversationList() {
  return (
    <div className="space-y-2 p-4" data-testid="skeleton-conversation-list">
      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 p-3"
        >
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFolderDetail() {
  return (
    <div className="p-6" data-testid="skeleton-folder-detail">
      <div className="mb-4 h-4 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mb-2 h-7 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mb-2 animate-pulse rounded-lg border border-gray-200 p-3"
        >
          <div className="mb-1 h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-200" />
        </div>
      ))}
      <div className="mb-4 mt-6 h-5 w-28 animate-pulse rounded bg-gray-200" />
      {[1, 2].map((i) => (
        <div
          key={i}
          className="mb-2 animate-pulse rounded-lg border border-gray-200 p-3"
        >
          <div className="mb-1 h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChatThread() {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6" data-testid="skeleton-chat-thread">
      <div className="flex justify-end">
        <div className="w-3/4 animate-pulse rounded-2xl rounded-br-sm bg-blue-100 p-4">
          <div className="h-4 w-full rounded bg-blue-200" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-3/4 animate-pulse rounded-2xl rounded-bl-sm bg-gray-100 p-4">
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-4/5 rounded bg-gray-200" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="w-2/3 animate-pulse rounded-2xl rounded-br-sm bg-blue-100 p-4">
          <div className="h-4 w-full rounded bg-blue-200" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-4/5 animate-pulse rounded-2xl rounded-bl-sm bg-gray-100 p-4">
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
