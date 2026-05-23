export function ProgressBar({
  value,
  max,
  label,
  sublabel,
  size = "md",
}: {
  value: number;
  max: number;
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const safeMax = max > 0 ? max : 1;
  const safeValue = Math.max(0, value);
  const pct = Math.min(100, (safeValue / safeMax) * 100);

  const heights = { sm: "h-2", md: "h-4", lg: "h-6" };

  return (
    <div className="w-full">
      {(label || sublabel) && (
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-2 gap-1">
          {label && <span className="font-semibold text-[var(--zice-dark)]">{label}</span>}
          {sublabel && <span className="text-[var(--zice-medium)] font-medium">{sublabel}</span>}
        </div>
      )}
      <div
        className={`w-full ${heights[size]} bg-gray-200 rounded-full overflow-hidden border border-gray-300`}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct < 1 && safeValue > 0 ? 2 : pct}%`,
            minWidth: safeValue > 0 ? "8px" : "0",
            background: "linear-gradient(90deg, #004a80 0%, #00a0e3 60%, #a0e0ff 100%)",
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs font-medium">
        <span className="text-gray-600">0</span>
        <span className="text-[var(--zice-dark)]">{Math.round(pct)}% da meta</span>
        <span className="text-gray-600">{safeMax}</span>
      </div>
    </div>
  );
}
