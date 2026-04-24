import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useRef } from "react";
import { useSearchParams } from "react-router";
import { startGoogleAuth } from "../api/auth";
import { useStore } from "../stores";

// ─── Data ──────────────────────────────────────────────────────────────────

const LOGOS = [
  { name: "Stripe", weight: "font-semibold", opacity: "opacity-40" },
  { name: "Notion", weight: "font-bold", opacity: "opacity-35" },
  { name: "Linear", weight: "font-semibold", opacity: "opacity-40" },
  { name: "Vercel", weight: "font-bold", opacity: "opacity-35" },
  { name: "Figma", weight: "font-semibold", opacity: "opacity-40" },
  { name: "Loom", weight: "font-bold", opacity: "opacity-35" },
  { name: "Retool", weight: "font-semibold", opacity: "opacity-40" },
];

const MCP_INTEGRATIONS = [
  { name: "Claude Desktop", icon: "✦", color: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  { name: "Cursor", icon: "⬡", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { name: "VS Code", icon: "◈", color: "bg-cyan-100 text-cyan-700", border: "border-cyan-200" },
  { name: "Zed", icon: "◎", color: "bg-violet-100 text-violet-700", border: "border-violet-200" },
  { name: "Windsurf", icon: "✧", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  { name: "Continue.dev", icon: "⬤", color: "bg-pink-100 text-pink-700", border: "border-pink-200" },
];

const COMPARISON = [
  { feature: "Full-text keyword search", drive: true, deep: true },
  { feature: "Natural language Q&A", drive: false, deep: true },
  { feature: "Streaming AI responses", drive: false, deep: true },
  { feature: "Exact citation tracking", drive: false, deep: true },
  { feature: "Multi-document reasoning", drive: false, deep: true },
  { feature: "MCP server integration", drive: false, deep: true },
  { feature: "Zero data storage", drive: false, deep: true },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Product Manager @ Stripe",
    initials: "SC",
    gradient: "from-violet-500 to-purple-600",
    quote:
      "I used to spend 30 minutes hunting through spec docs for context. With DeepFolder I just ask and it pulls the exact paragraph I need. Absolute game changer.",
  },
  {
    name: "Marcus Rivera",
    role: "Research Lead @ OpenAI",
    initials: "MR",
    gradient: "from-cyan-500 to-blue-600",
    quote:
      "We have thousands of research notes in Drive. DeepFolder makes them feel like a conversation with a brilliant colleague who has read and remembered everything.",
  },
  {
    name: "Aisha Okonkwo",
    role: "Founder @ Compound",
    initials: "AO",
    gradient: "from-pink-500 to-rose-600",
    quote:
      "The citation panel alone sold me. I can actually trust the AI because it always shows me exactly where it got the answer. That's rare.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Check({ ok }: { ok: boolean }) {
  if (!ok)
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs mx-auto">
        ✕
      </span>
    );
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs mx-auto">
      ✓
    </span>
  );
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function FolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FolderOpenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 3h9a2 2 0 0 1 2 2v1" />
      <path d="M3 15l4-4 4 4 4-5 4 4" />
      <path d="M21 19H3" />
    </svg>
  );
}

function FileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

// ─── Pill label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, color = "text-violet-700 bg-violet-100" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color}`}>
      {children}
    </span>
  );
}

// ─── Cookie Modal ──────────────────────────────────────────────────────────

function CookieModal({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <motion.div className="absolute inset-0 bg-black/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-100"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">🍪</span>
          <h3 className="text-base font-semibold text-gray-900">We use cookies</h3>
        </div>
        <p className="mb-5 text-sm text-gray-500 leading-relaxed">
          We use essential cookies to keep you logged in and analytics cookies to understand how people use DeepFolder. No cross-site tracking, ever.
        </p>
        <div className="flex gap-3">
          <button onClick={onReject} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-95">
            Reject
          </button>
          <button onClick={onAccept} className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95">
            Accept all
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 sm:px-10 backdrop-blur-md bg-white/80 border-b border-gray-100/60"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
          <span className="text-white text-xs font-bold">DF</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 tracking-tight">DeepFolder</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => startGoogleAuth()} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 active:scale-95">
          Log in
        </button>
        <button onClick={() => startGoogleAuth()} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95">
          Sign up
        </button>
      </div>
    </motion.nav>
  );
}

// ─── Hero UI mockup ────────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/70 overflow-hidden ring-1 ring-gray-100">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-gray-400 font-medium">Q3 Strategy — DeepFolder</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-400">3 files indexed</span>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 420 }}>
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 border-r border-gray-100 bg-gray-50/60 p-3">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Folders</p>
          {[
            { name: "Q3 Strategy Docs", active: true, files: 12 },
            { name: "Legal & Compliance", active: false, files: 8 },
            { name: "Engineering Specs", active: false, files: 24 },
            { name: "Product Roadmap", active: false, files: 6 },
          ].map((f) => (
            <div
              key={f.name}
              className={`mb-1 flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer ${
                f.active ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {f.active
                  ? <FolderOpenIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  : <FolderIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                <span className="text-xs font-medium leading-tight">{f.name}</span>
              </div>
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${f.active ? "bg-violet-200 text-violet-700" : "bg-gray-200 text-gray-500"}`}>
                {f.files}
              </span>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden p-5 space-y-5">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3">
                <p className="text-xs font-medium text-white">What's our refund policy for enterprise customers?</p>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">DF</div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  Based on{" "}
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 cursor-pointer">
                    policies/enterprise-refunds.doc ↗
                  </span>
                  {" "}and{" "}
                  <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 cursor-pointer">
                    Q3-contracts/template-v2.pdf ↗
                  </span>
                  {" "}— enterprise customers on annual contracts receive a pro-rata refund for unused months, processed within 5–7 business days.
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">2 sources cited</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">High confidence</span>
                </div>
              </div>
            </div>

            {/* User message 2 */}
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3">
                <p className="text-xs font-medium text-white">How does this compare to what we agreed in the Q2 board deck?</p>
              </div>
            </div>

            {/* AI streaming response */}
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">DF</div>
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-xs text-gray-700 leading-relaxed"
                >
                  Cross-referencing with{" "}
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 cursor-pointer">
                    board-decks/Q2-2024.pdf ↗
                  </span>
                  {" "}— the Q2 board deck proposed a 30-day full refund window for enterprise, which was later revised to the pro-rata model in Q3...{" "}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    className="inline-block h-3 w-0.5 rounded-full bg-violet-500 align-middle"
                  />
                </motion.p>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5">
              <span className="text-xs text-gray-400 flex-1">Ask anything about Q3 Strategy Docs…</span>
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-[9px]">↑</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero({ authError }: { authError: string | null }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-20 text-center">
      {/* Blobs */}
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-400/25 blur-3xl" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="pointer-events-none absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="pointer-events-none absolute bottom-1/3 left-1/3 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />

      {/* Badge */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
        Now in early access
      </motion.div>

      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
        Talk to your{" "}
        <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Google Drive
        </span>{" "}
        like a teammate
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mt-6 max-w-xl text-lg text-gray-500 leading-relaxed">
        Ask questions across any folder. Get streamed answers with exact citations — across multiple documents at once.
      </motion.p>

      {authError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="auth-error" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {authError}
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-200/60 transition hover:opacity-95 active:scale-95">
          Start for free
        </button>
        <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md active:scale-95">
          <GoogleIcon />
          Start with AI
        </button>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 text-xs text-gray-400">
        Free forever for personal use · No credit card required
      </motion.p>

      {/* Big hero mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 w-full max-w-4xl"
      >
        <HeroMockup />
      </motion.div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center">
          <div className="h-6 w-3.5 rounded-full border-2 border-gray-200 flex items-start justify-center pt-1">
            <div className="h-1 w-0.5 rounded-full bg-gray-300" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Logos ─────────────────────────────────────────────────────────────────

function Logos() {
  return (
    <section className="py-16 px-4 border-y border-gray-100 bg-gray-50/50">
      <FadeUp className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trusted by teams at
        </p>
      </FadeUp>
      <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {LOGOS.map((logo, i) => (
          <motion.span
            key={logo.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`text-xl tracking-tight text-gray-900 ${logo.weight} ${logo.opacity} select-none`}
          >
            {logo.name}
          </motion.span>
        ))}
      </div>
    </section>
  );
}

// ─── Feature Section (alternating) ─────────────────────────────────────────

function FeatureSection({
  label,
  labelColor,
  title,
  titleAccent,
  body,
  bullets,
  visual,
  reverse = false,
  bg = "bg-white",
}: {
  label: string;
  labelColor?: string;
  title: string;
  titleAccent?: string;
  body: string;
  bullets: { icon: React.ReactNode; text: string }[];
  visual: React.ReactNode;
  reverse?: boolean;
  bg?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className={`py-24 px-4 ${bg}`}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className={`flex flex-col gap-12 lg:flex-row lg:items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 24 : -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 space-y-6"
          >
            <SectionLabel color={labelColor}>{label}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
              {title}{" "}
              {titleAccent && (
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {titleAccent}
                </span>
              )}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">{body}</p>
            <ul className="space-y-4">
              {bullets.map((b) => (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm">{b.icon}</span>
                  <span className="text-sm text-gray-600 leading-relaxed">{b.text}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition hover:opacity-90 active:scale-95">
              Try it free →
            </button>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -24 : 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Visuals ───────────────────────────────────────────────────────

function ChatVisual() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-amber-400" /><div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-gray-400">Engineering Specs — Chat</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3 max-w-xs">
            <p className="text-xs text-white font-medium">When was the auth system last updated?</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">DF</div>
          <div className="rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100 px-4 py-3 flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">
              According to <span className="rounded bg-violet-100 px-1 py-0.5 text-[10px] font-semibold text-violet-700">auth/CHANGELOG.md ↗</span>, the auth system was last updated on <strong>March 14, 2024</strong> — JWT rotation and refresh token expiry were overhauled.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3 max-w-xs">
            <p className="text-xs text-white font-medium">Does it support OAuth 2.0 PKCE?</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">DF</div>
          <div className="rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100 px-4 py-3 flex-1">
            <p className="text-xs text-gray-700 leading-relaxed">Yes — per <span className="rounded bg-cyan-100 px-1 py-0.5 text-[10px] font-semibold text-cyan-700">auth/oauth-spec.md ↗</span>, PKCE was added in v2.3. Code verifier is required for all public clients...{" "}<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} className="inline-block h-3 w-0.5 rounded-full bg-violet-500 align-middle" /></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamingVisual() {
  const words = ["Enterprise", "customers", "on", "annual", "contracts", "receive", "a", "pro-rata", "refund", "for", "unused", "months,", "processed", "within", "5–7", "business", "days.", "The", "original", "30-day", "full-refund"];
  const [count] = useState(16);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-amber-400" /><div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-gray-400">Live streaming response</span>
        <div className="ml-auto flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[10px] text-gray-400">Generating…</span></div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-3"><p className="text-xs text-white font-medium">Summarise our refund policy changes across Q1–Q3</p></div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">DF</div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">policies/q1-refunds.doc</span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-medium text-cyan-700">policies/q2-refunds.doc</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">policies/q3-refunds.doc</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              {words.slice(0, count).join(" ")}{" "}
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="inline-block h-3 w-0.5 rounded-full bg-violet-500 align-middle" />
            </p>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <motion.div animate={{ width: ["0%", "70%"] }} transition={{ duration: 3, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationVisual() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-amber-400" /><div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-gray-400">Citation Panel</span>
      </div>
      <div className="flex divide-x divide-gray-100" style={{ minHeight: 280 }}>
        <div className="flex-1 p-4">
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Per company policy, enterprise refunds are processed on a{" "}
            <motion.span
              animate={{ backgroundColor: ["rgba(139,92,246,0)", "rgba(139,92,246,0.15)", "rgba(139,92,246,0.15)"] }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="rounded px-0.5 font-semibold text-violet-700"
            >
              pro-rata basis
            </motion.span>{" "}
            for unused months of service, not exceeding the original contract value.
          </p>
          <div className="space-y-2">
            {[
              { file: "enterprise-refunds.doc", page: "p. 4", color: "bg-violet-100 text-violet-700" },
              { file: "Q3-contracts/template.pdf", page: "§ 8.2", color: "bg-cyan-100 text-cyan-700" },
            ].map((c) => (
              <motion.div key={c.file} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`flex items-center gap-2 rounded-lg ${c.color} px-3 py-2 cursor-pointer`}>
                <FileIcon className="h-3 w-3 flex-shrink-0" />
                <span className="text-[10px] font-semibold flex-1">{c.file}</span>
                <span className="text-[10px] opacity-70">{c.page}</span>
                <span className="text-[10px]">↗</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="w-48 flex-shrink-0 bg-gray-50/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Sources</p>
          <div className="space-y-3">
            {[
              { name: "enterprise-refunds.doc", lines: [60, 80, 45] },
              { name: "Q3-contracts/template.pdf", lines: [70, 55, 65] },
              { name: "board-deck-Q3.pdf", lines: [50, 75, 40] },
            ].map((s) => (
              <div key={s.name} className="rounded-lg bg-white border border-gray-100 p-2">
                <p className="text-[9px] font-semibold text-gray-600 mb-1.5 truncate">{s.name}</p>
                {s.lines.map((w, i) => <div key={i} className="mb-1 h-1.5 rounded-full bg-gray-100" style={{ width: `${w}%` }} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiDocVisual() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-amber-400" /><div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-gray-400">Multi-Document Reasoning</span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs font-medium text-gray-700 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          "How has our pricing strategy evolved from Q1 to Q3, and what drove the changes?"
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Q1 Pricing Deck", color: "bg-violet-50 border-violet-200 text-violet-600" },
            { label: "Q2 Board Update", color: "bg-cyan-50 border-cyan-200 text-cyan-600" },
            { label: "Q3 Strategy Doc", color: "bg-amber-50 border-amber-200 text-amber-600" },
          ].map((doc, i) => (
            <motion.div
              key={doc.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-3 text-center ${doc.color}`}
            >
              <div className="flex justify-center mb-1"><FileIcon className="h-5 w-5" /></div>
              <p className="text-[9px] font-semibold leading-tight">{doc.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ scaleY: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} className="h-4 w-0.5 rounded-full bg-violet-400" />
          ))}
          <span className="text-[10px] text-gray-400 mx-2">synthesizing across 3 files</span>
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ scaleY: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 + 0.6 }} className="h-4 w-0.5 rounded-full bg-violet-400" />
          ))}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold">DF</div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Pricing rose <strong>+34%</strong> from Q1 to Q3. Q1 started at $49/seat (<span className="text-violet-600 text-[10px]">Q1 deck ↗</span>), Q2 introduced volume tiers after churn analysis (<span className="text-cyan-600 text-[10px]">board update ↗</span>), and Q3 anchored enterprise at $89/seat driven by new compliance features (<span className="text-amber-600 text-[10px]">Q3 strategy ↗</span>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-amber-400" /><div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-gray-400">Data flow</span>
      </div>
      <div className="p-6 space-y-4">
        {[
          { from: "Your Google Drive", to: "DeepFolder reads (OAuth)", icon: <FolderOpenIcon className="h-5 w-5 flex-shrink-0" />, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { from: "DeepFolder processes", to: "AI answers your query", icon: <span className="text-lg leading-none">✦</span>, color: "text-violet-600 bg-violet-50 border-violet-100" },
          { from: "Answer + citations", to: "Delivered to you", icon: <span className="text-lg leading-none">✓</span>, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        ].map((step, i) => (
          <motion.div key={step.from} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`flex items-center gap-3 rounded-xl border p-3 ${step.color}`}>
            {step.icon}
            <div>
              <p className="text-xs font-semibold">{step.from}</p>
              <p className="text-[10px] opacity-70">{step.to}</p>
            </div>
          </motion.div>
        ))}
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-start gap-2">
          <span className="text-base">🚫</span>
          <div>
            <p className="text-xs font-semibold text-red-700">Never stored on our servers</p>
            <p className="text-[10px] text-red-500">File contents are processed in memory and discarded after each response.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MCP Integrations ──────────────────────────────────────────────────────

function MCPIntegrations() {
  return (
    <section className="py-28 px-4 bg-gray-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }} className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start">
          {/* Text */}
          <FadeUp className="flex-1 space-y-6">
            <SectionLabel color="text-violet-300 bg-violet-900/60">Integrations</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Your Drive knowledge,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                everywhere you code
              </span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              DeepFolder ships an <strong className="text-white">MCP server</strong> — the Model Context Protocol standard championed by Anthropic. Connect once, and your indexed Drive folders become a live knowledge source inside every AI tool you already use.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "⚡", text: "Ask Claude Desktop to search your Drive folders mid-conversation — it queries DeepFolder in real time." },
                { icon: "◈", text: "Use Cursor or Windsurf to pull docs and specs directly into your coding context without leaving your editor." },
                { icon: "✦", text: "One MCP connection exposes all your indexed folders to any compatible tool, now and in the future." },
              ].map((b) => (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-violet-900/60 text-violet-400 text-sm border border-violet-800/60">{b.icon}</span>
                  <span className="text-sm text-gray-400 leading-relaxed">{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/50 transition hover:opacity-90 active:scale-95">
                Get started →
              </button>
              <span className="text-xs text-gray-500">MCP setup takes under 2 minutes</span>
            </div>
          </FadeUp>

          {/* Integration grid */}
          <FadeUp delay={0.15} className="flex-1">
            {/* Code snippet */}
            <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-5 font-mono text-xs overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500/70" /><div className="h-2 w-2 rounded-full bg-amber-500/70" /><div className="h-2 w-2 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-gray-500 text-[10px]">~/.claude/claude_desktop_config.json</span>
              </div>
              <pre className="text-gray-300 leading-relaxed overflow-x-auto">{`{
  "mcpServers": {
    "deepfolder": {
      "command": "npx",
      "args": [
        "-y",
        "@deepfolder/mcp-server"
      ]
    }
  }
}`}</pre>
            </div>

            {/* Integration chips */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MCP_INTEGRATIONS.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className={`flex items-center gap-2.5 rounded-xl border ${app.border} bg-gray-900 px-3 py-3 cursor-default`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${app.color} text-sm border ${app.border} flex-shrink-0`}>
                    {app.icon}
                  </span>
                  <span className="text-xs font-semibold text-gray-200">{app.name}</span>
                </motion.div>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] text-gray-600">
              Works with any MCP-compatible client · More integrations coming soon
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ────────────────────────────────────────────────────────────

function Comparison() {
  return (
    <section className="py-28 px-4 bg-gray-50/70">
      <div className="mx-auto max-w-3xl">
        <FadeUp className="text-center mb-14">
          <SectionLabel>Why DeepFolder</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Not just search.{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Understanding.
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50 px-6 py-4">
              <span className="text-sm font-medium text-gray-400">Feature</span>
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6.19 2L.34 12l3.09 5.35L9.28 7.35z" fill="#4285F4" />
                  <path d="M17.81 2H6.19l3.09 5.35h11.43z" fill="#FBBC05" />
                  <path d="M20.91 17.35L15.07 7.35H3.64L9.48 17.35z" fill="#34A853" />
                  <path d="M6.54 22.44h10.92l-3.09-5.09H3.45z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Google Drive</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold">DF</div>
                <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">DeepFolder</span>
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-3 items-center px-6 py-4 ${i < COMPARISON.length - 1 ? "border-b border-gray-50" : ""} ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                <span className="text-sm text-gray-700 font-medium">{row.feature}</span>
                <div className="flex justify-center"><Check ok={row.drive} /></div>
                <div className="flex justify-center"><Check ok={row.deep} /></div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="py-28 px-4">
      <div className="mx-auto max-w-6xl">
        <FadeUp className="text-center mb-16">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Loved by people who{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">live in Drive</span>
          </h2>
        </FadeUp>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ duration: 0.25 }} className="flex h-full flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-base">★</span>)}
                </div>
                <p className="flex-1 text-sm text-gray-600 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}>{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-28 px-4">
      <FadeUp>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-12 text-center shadow-2xl shadow-violet-200">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity }} className="pointer-events-none absolute -top-8 -left-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} className="pointer-events-none absolute -bottom-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">Start in 30 seconds</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Your Drive, finally{" "}
              <span className="text-violet-200">intelligent</span>
            </h2>
            <p className="mt-4 text-lg text-violet-100/90 max-w-md mx-auto">
              Connect your Google account and ask your first question in under a minute.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-violet-700 shadow-xl transition hover:scale-[1.02] active:scale-95">
                Start for free
              </button>
              <button onClick={() => startGoogleAuth()} className="inline-flex items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95">
                <GoogleIcon />
                Start with AI
              </button>
            </div>
            <p className="mt-4 text-xs text-violet-200/60">No credit card · Free forever for personal use</p>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10 px-4">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">DF</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">DeepFolder</span>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} DeepFolder. All rights reserved.</p>
        <div className="flex gap-5 text-xs text-gray-400">
          <button className="hover:text-gray-600 transition">Privacy</button>
          <button className="hover:text-gray-600 transition">Terms</button>
          <button className="hover:text-gray-600 transition">Contact</button>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────

export function Landing() {
  const status = useStore((s) => s.status);
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("error");
  const [cookieState, setCookieState] = useState<"pending" | "decided">("pending");

  if (status === "authenticated") {
    window.location.href = "/folders";
    return null;
  }

  return (
    <div className="min-h-screen bg-white antialiased">
      <AnimatePresence>
        {cookieState === "pending" && (
          <CookieModal
            onAccept={() => setCookieState("decided")}
            onReject={() => setCookieState("decided")}
          />
        )}
      </AnimatePresence>

      <Navbar />
      <Hero authError={authError} />
      <Logos />

      <FeatureSection
        label="Chat"
        labelColor="text-violet-700 bg-violet-100"
        title="Ask anything."
        titleAccent="Get answers, not links."
        body="Stop ctrl+F-ing through 40 tabs. Type a question in plain English and DeepFolder reads every file in the folder to give you a direct, accurate answer — with the source linked so you can verify in one click."
        bullets={[
          { icon: "💬", text: "Ask in natural language — no search operators, no boolean syntax required." },
          { icon: <FolderIcon className="h-4 w-4" />, text: "Works on any Google Drive folder, shared drives, and team folders." },
          { icon: "⚡", text: "Answers appear in seconds, not after you've read through 12 documents." },
        ]}
        visual={<ChatVisual />}
      />

      <FeatureSection
        label="Speed"
        labelColor="text-amber-700 bg-amber-100"
        title="Watch the answer"
        titleAccent="write itself."
        body="DeepFolder streams its response token by token as it reasons across your files — the same way ChatGPT types in real time. You see progress immediately, even for complex queries spanning dozens of documents."
        bullets={[
          { icon: "▶", text: "Response starts within milliseconds of your question — no spinner, no waiting." },
          { icon: "📊", text: "A live progress bar shows how many files have been scanned so far." },
          { icon: "🔄", text: "Interrupt and refine mid-stream without waiting for the full answer to finish." },
        ]}
        visual={<StreamingVisual />}
        reverse
        bg="bg-gray-50/60"
      />

      <FeatureSection
        label="Trust"
        labelColor="text-cyan-700 bg-cyan-100"
        title="Every answer"
        titleAccent="shows its work."
        body="AI hallucinations are a real risk. DeepFolder eliminates the guessing game: every claim is pinned to the exact file, page, and paragraph it came from. Click any citation to open that spot in Google Drive instantly."
        bullets={[
          { icon: "◈", text: "Citations are first-class UI elements — not footnotes buried at the bottom." },
          { icon: <FileIcon className="h-4 w-4" />, text: "Multiple sources per answer, ranked by relevance and confidence." },
          { icon: "🔗", text: "One click opens the exact page in Google Drive, no manual searching." },
        ]}
        visual={<CitationVisual />}
      />

      <FeatureSection
        label="Intelligence"
        labelColor="text-emerald-700 bg-emerald-100"
        title="Synthesize across"
        titleAccent="dozens of files at once."
        body="Regular search finds the document. DeepFolder reads, compares, and synthesizes across your entire folder simultaneously — spotting contradictions, tracking changes over time, and building a coherent picture from scattered fragments."
        bullets={[
          { icon: "◎", text: "Compare how a policy or metric evolved across multiple quarterly documents." },
          { icon: "🧩", text: "Identify contradictions between two files — without reading both yourself." },
          { icon: "📈", text: "Summarise trends across dozens of reports in a single, cited response." },
        ]}
        visual={<MultiDocVisual />}
        reverse
        bg="bg-gray-50/60"
      />

      <FeatureSection
        label="Privacy"
        labelColor="text-pink-700 bg-pink-100"
        title="Your data never"
        titleAccent="leaves your control."
        body="DeepFolder reads your Drive via OAuth — the same secure protocol your bank uses. File contents are processed in memory per request and immediately discarded. We store nothing. Your documents are yours, always."
        bullets={[
          { icon: "🔒", text: "OAuth 2.0 with PKCE — your credentials never touch our servers." },
          { icon: "🚫", text: "Zero file storage. Contents are read, processed, and discarded per query." },
          { icon: "✓", text: "Revoke access at any time from your Google Account settings." },
        ]}
        visual={<PrivacyVisual />}
      />

      <MCPIntegrations />
      <Comparison />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
