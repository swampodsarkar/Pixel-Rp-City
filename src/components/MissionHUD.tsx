import { useState, useEffect } from "react";
import { useGameStore } from "../store";
import { useMultiplayerStore } from "../multiplayer";
import { WEAPON_PICKUPS } from "../weapons";
import { Crosshair, ChevronRight, DollarSign } from "lucide-react";

const MISSIONS = [
  {
    type: 'delivery' as const,
    title: 'Package Delivery',
    description: 'Deliver the package to the marked location',
    targetX: 200, targetZ: -150, reward: 500,
  },
  {
    type: 'race' as const,
    title: 'Street Race',
    description: 'Reach the checkpoint first!',
    targetX: -180, targetZ: 200, reward: 800,
  },
  {
    type: 'cargo' as const,
    title: 'Cargo Heist',
    description: 'Steal the cargo and bring it back',
    targetX: 250, targetZ: 180, reward: 1200,
  },
];

export const MissionHUD = () => {
  const [showList, setShowList] = useState(false);
  const mission = useGameStore((s) => s.mission);
  const setMission = useGameStore((s) => s.setMission);
  const setMoney = useGameStore((s) => s.setMoney);
  const money = useGameStore((s) => s.money);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const myData = myId ? players[myId] : null;

  const startMission = (m: typeof MISSIONS[0]) => {
    setMission({
      active: true, type: m.type, title: m.title,
      description: m.description, targetX: m.targetX,
      targetZ: m.targetZ, reward: m.reward, progress: 0,
    });
    setShowList(false);
  };

  // Check mission completion
  useEffect(() => {
    if (!mission.active || !myData) return;
    const dist = Math.hypot(myData.x - mission.targetX, myData.z - mission.targetZ);
    if (dist < 10) {
      setMoney(money + mission.reward);
      setMission({
        active: false, type: null, title: '',
        description: '', targetX: 0, targetZ: 0,
        reward: 0, progress: 0,
      });
    }
  }, [myData?.x, myData?.z]);

  return (
    <div className="absolute top-24 left-4 z-20 pointer-events-none">
      {/* Active Mission */}
      {mission.active ? (
        <div className="bg-black/70 backdrop-blur-md border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl pointer-events-auto w-64">
          <div className="flex items-center gap-2 mb-1">
            <Crosshair size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              {mission.type}
            </span>
          </div>
          <p className="text-sm font-bold text-white">{mission.title}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{mission.description}</p>
          <div className="flex items-center gap-1 mt-2 text-yellow-400">
            <DollarSign size={12} />
            <span className="text-xs font-bold">{mission.reward}</span>
          </div>
          {myData && (
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              {Math.round(Math.hypot(myData.x - mission.targetX, myData.z - mission.targetZ))}m remaining
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowList(!showList)}
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 hover:bg-black/70 transition-all shadow-xl flex items-center gap-2"
        >
          <Crosshair size={14} className="text-zinc-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Missions</span>
        </button>
      )}

      {/* Mission List */}
      {showList && !mission.active && (
        <div className="mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl pointer-events-auto w-72">
          <div className="px-4 py-3 border-b border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Missions</span>
          </div>
          {MISSIONS.map((m) => (
            <button
              key={m.type}
              onClick={() => startMission(m)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-bold text-white">{m.title}</p>
                <p className="text-[11px] text-zinc-500">{m.description}</p>
                <div className="flex items-center gap-1 mt-1 text-yellow-400">
                  <DollarSign size={10} />
                  <span className="text-[11px] font-bold">{m.reward}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
