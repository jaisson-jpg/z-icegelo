export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-[var(--zice-light)] border-t-[var(--zice-medium)] rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--zice-dark)] font-bold animate-pulse uppercase tracking-widest text-sm">
        Carregando Z-ice...
      </p>
    </div>
  );
}
