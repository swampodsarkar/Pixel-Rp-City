import { useGameStore } from "../store";
import { WEAPONS } from "../weapons";

export const WeaponHUD = () => {
  const weapon = useGameStore((s) => s.weapon);

  if (!weapon.equipped) return null;

  const def = WEAPONS[weapon.equipped];
  const ammo = weapon.ammo[weapon.equipped] ?? 0;

  return (
    <div className="absolute bottom-8 right-8 z-10 pointer-events-none flex items-center gap-3">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: def.color }}
          />
          <span className="text-sm font-black text-white italic tracking-wide">
            {def.name}
          </span>
          <span className="text-sm font-mono text-zinc-400">
            {ammo}
            <span className="text-zinc-600">/{def.ammo}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
