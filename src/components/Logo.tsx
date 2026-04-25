interface LogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-[10px]", word: "text-sm" },
  md: { box: "h-8 w-8", text: "text-xs", word: "text-sm" },
  lg: { box: "h-10 w-10", text: "text-sm", word: "text-base" },
};

export function Logo({ size = "md", withWordmark = true, className = "" }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${s.box} flex flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-200`}
      >
        <span className={`${s.text} font-bold text-white`}>DF</span>
      </div>
      {withWordmark && (
        <span className={`${s.word} font-semibold tracking-tight text-gray-900`}>
          DeepFolder
        </span>
      )}
    </div>
  );
}
