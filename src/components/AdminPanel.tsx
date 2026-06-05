import { useState } from "react";
import { useMultiplayerStore, kickPlayer, clearShots } from "../multiplayer";
import { Shield, X, Skull, Trash2 } from "lucide-react";

export const AdminPanel = () => {
  const [show, setShow] = useState(false);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const myData = myId ? players[myId] : null;

  if (!myData?.isAdmin) return null;

  return (
    <div className="absolute top-4 left-4 z-30">
      <button
        onClick={() => setShow(!show)}
        className="bg-black/50 backdrop-blur-md border border-red-500/30 rounded-xl px-3 py-2 hover:bg-black/70 transition-all shadow-xl flex items-center gap-2"
      >
        <Shield size={14} className="text-red-400" />
        <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Admin</span>
      </button>

      {show && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Admin Panel</span>
            <button onClick={() => setShow(false)}>
              <X size={14} className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          </div>

          <div className="py-2 max-h-60 overflow-y-auto">
            <div className="px-4 py-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Players</p>
            </div>
            {Object.values(players).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-xs text-zinc-300">
                    {p.name}
                    {p.id === myId && <span className="text-indigo-400 ml-1">(you)</span>}
                  </span>
                </div>
                {p.id !== myId && (
                  <button
                    onClick={() => kickPlayer(p.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Kick"
                  >
                    <Skull size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 px-4 py-3">
            <button
              onClick={() => clearShots()}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <Trash2 size={12} />
              Clear all shots
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
