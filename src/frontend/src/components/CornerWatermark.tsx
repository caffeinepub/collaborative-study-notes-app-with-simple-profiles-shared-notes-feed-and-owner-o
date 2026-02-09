export default function CornerWatermark() {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs font-medium text-foreground/70">
          Aman SN
        </span>
      </div>
    </div>
  );
}
