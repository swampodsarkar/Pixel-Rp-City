import { useGameStore } from "../store";

export const HealthBar = () => {
  const health = useGameStore((s) => s.health);
  const maxHealth = useGameStore((s) => s.maxHealth);
  const percent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  let barColor = "#22c55e";
  if (percent < 30) barColor = "#ef4444";
  else if (percent < 60) barColor = "#eab308";

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 pointer-events-none">
      <div className="w-48 h-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full overflow-hidden shadow-xl">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}66`,
          }}
        />
      </div>
      <span
        className="text-sm font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        style={{ color: percent < 30 ? "#ef4444" : "#fff" }}
      >
        {Math.ceil(health)}
      </span>
    </div>
  );
};
