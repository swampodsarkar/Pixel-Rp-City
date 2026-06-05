import { useState } from "react";
import { useMultiplayerStore } from "../multiplayer";
import { Users, X } from "lucide-react";

export const PlayerList = () => {
  const [show, setShow] = useState(false);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const count = Object.keys(players).length;

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setShow(!show)}
        className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-black/60 transition-all shadow-xl"
      >
        <Users size={14} className="text-zinc-400" />
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
          {count}/10
        </span>
      </button>

      {show && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Online Players
            </span>
            <button onClick={() => setShow(false)}>
              <X size={14} className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {Object.values(players).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color || "#666" }}
                />
                <span
                  className={`text-sm font-medium ${
                    p.id === myId ? "text-indigo-400" : "text-zinc-200"
                  }`}
                >
                  {p.name}
                  {p.id === myId && (
                    <span className="text-[10px] text-indigo-500 ml-1.5 font-bold uppercase">
                      (You)
                    </span>
                  )}
                </span>
              </div>
            ))}
            {count === 0 && (
              <p className="text-zinc-600 text-xs text-center py-6 italic">
                No players online
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
