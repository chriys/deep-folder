import { motion } from "framer-motion";
import { easeOutExpo } from "../lib/motion";

const shimmer =
  "relative overflow-hidden rounded-md bg-gradient-to-r from-gray-100 via-gray-200/70 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`${shimmer} ${className}`} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/70 p-3 ring-1 ring-gray-50">
      {children}
    </div>
  );
}

export function SkeletonFolderList() {
  return (
    <div className="space-y-2" data-testid="skeleton-folder-list">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05, ease: easeOutExpo }}
        >
          <Card>
            <Bar className="mb-2 h-3 w-3/4" />
            <Bar className="h-2.5 w-1/3" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonConversationList() {
  return (
    <div className="space-y-1.5" data-testid="skeleton-conversation-list">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04, ease: easeOutExpo }}
          className="rounded-lg border border-gray-100 bg-white/70 px-3 py-2 ring-1 ring-gray-50"
        >
          <Bar className="mb-1.5 h-3 w-2/3" />
          <Bar className="h-2 w-1/4" />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonFolderDetail() {
  return (
    <div className="p-6" data-testid="skeleton-folder-detail">
      <Bar className="mb-4 h-3 w-16" />
      <Bar className="mb-2 h-7 w-48" />
      <Bar className="mb-6 h-3 w-full" />
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <Bar className="mb-1.5 h-3 w-3/4" />
            <Bar className="h-2.5 w-1/4" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChatThread() {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6" data-testid="skeleton-chat-thread">
      <div className="flex justify-end">
        <div className="w-3/4 rounded-2xl rounded-br-sm bg-violet-100/80 p-4">
          <Bar className="h-4 w-full" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-3/4 rounded-2xl rounded-bl-sm bg-gray-100 p-4">
          <Bar className="mb-2 h-4 w-full" />
          <Bar className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
