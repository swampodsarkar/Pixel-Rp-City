import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { DayNightCycle } from './components/Lights';
import { World } from './components/World';
import { Player } from './components/Player';
import { OtherPlayers } from './components/OtherPlayers';
import { useGameStore } from './store';
import { Play, Settings, Shield, User } from 'lucide-react';
import { MobileControls } from './components/MobileControls';
import { Speedometer } from './components/Speedometer';
import { Chat } from './components/Chat';
import { Minimap } from './components/Minimap';
import { PlayerList } from './components/PlayerList';
import { HealthBar } from './components/HealthBar';
import { HelpPanel } from './components/HelpPanel';
import { WeaponHUD } from './components/WeaponHUD';
import { MissionHUD } from './components/MissionHUD';
import { GarageUI } from './components/GarageUI';
import { AdminPanel } from './components/AdminPanel';
import { joinGame, leaveGame, listenToCars } from './multiplayer';
import { initVoice, leaveVoice } from './voice';

export default function App() {
  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [spawnPos, setSpawnPos] = useState({ x: 0, z: 0 });
  const drivingVehicle = useGameStore(s => s.drivingVehicle);
  const updateCar = useGameStore(s => s.updateCar);
  const setShowGarage = useGameStore(s => s.setShowGarage);

  const handlePlay = async () => {
    if (!userName.trim()) return;
    const { id, spawn } = joinGame(userName);
    setMyId(id);
    setSpawnPos(spawn);
    try {
      await initVoice(id);
    } catch (e) {
      console.error("Agora voice start failed", e);
    }
    setJoined(true);
  };

  useEffect(() => {
    if (!joined) return;
    const unsub = listenToCars((cars) => {
      Object.entries(cars).forEach(([carId, pos]) => updateCar(carId, pos));
    });
    return () => unsub();
  }, [joined, updateCar]);

  useEffect(() => {
    if (!joined) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') setShowGarage((p: boolean) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [joined, setShowGarage]);

  useEffect(() => {
    return () => {
      if (myId) {
        leaveVoice();
        leaveGame(myId);
      }
    }
  }, [myId]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none relative font-sans text-zinc-100">
      
      {/* Always Render the 3D World over Full Screen */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <OrthographicCamera makeDefault position={[25, 45, 25]} zoom={5} near={-10000} far={20000} />
          <DayNightCycle />
          {joined && <Player isActive={joined} myId={myId} initialPosition={[spawnPos.x, 0, spawnPos.z]} />}
          <OtherPlayers myId={myId} />
          <World />
        </Canvas>
      </div>

      {/* MOBILE CONTROLS */}
      {joined && <MobileControls />}

      {/* CHAT */}
      {joined && <Chat />}

      {/* MINIMAP */}
      {joined && <Minimap />}

      {/* PLAYER LIST */}
      {joined && <PlayerList />}

      {/* HEALTH BAR */}
      {joined && <HealthBar />}

      {/* HELP PANEL */}
      {joined && <HelpPanel />}

      {/* WEAPON HUD */}
      {joined && <WeaponHUD />}

      {/* MISSION HUD */}
      {joined && <MissionHUD />}

      {/* GARAGE UI */}
      {joined && <GarageUI />}

      {/* ADMIN PANEL */}
      {joined && <AdminPanel />}

      {/* MAIN MENU UI — GTA 5 Online Style */}
      {!joined && (
        <div className="absolute inset-0 z-20 flex items-center justify-center sm:justify-start">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Main Panel */}
          <div className="relative w-full sm:w-[460px] h-[100dvh] bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-900/95 sm:border-r border-indigo-500/20 px-8 sm:px-14 flex flex-col justify-center overflow-y-auto animate-slide-in shadow-[4px_0_60px_rgba(0,0,0,0.9)]">

            {/* Top bar: Online count + Version */}
            <div className="absolute top-6 left-8 sm:left-14 right-8 sm:right-14 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono tracking-widest">BUILD 1.0.6</p>
            </div>

            {/* Main Content - centered */}
            <div className="flex flex-col gap-1 sm:gap-2 -mt-12">
              
              {/* Branding — GTA 5 Style Gradient Logo */}
              <div className="mb-2">
                <h1 className="text-6xl sm:text-8xl font-black italic leading-none tracking-tighter">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(129,140,248,0.3)]">
                    NEO
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-300 via-white to-zinc-300 bg-clip-text text-transparent text-5xl sm:text-6xl tracking-[0.15em]">
                    PIXEL
                  </span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/60 to-transparent" />
                  <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-[0.3em]">City</span>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/60" />
                </div>
              </div>

              {/* Character Setup — GTA 5 Mugshot Style */}
              <div className="mt-6 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-5">
                  {/* Mugshot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border-2 border-white/10 overflow-hidden">
                      {userName.trim() ? (
                        <span className="text-3xl font-black text-white italic drop-shadow-lg">
                          {userName.trim()[0]}
                        </span>
                      ) : (
                        <User size={30} className="text-white/40" />
                      )}
                    </div>
                    {/* Rank badge */}
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-yellow-500/40 rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                      <span className="text-[10px] font-black text-yellow-400">1</span>
                    </div>
                  </div>

                  {/* Name & Stats */}
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1.5 block">
                      Character Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="ENTER NAME"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-white text-lg font-bold tracking-wider focus:outline-none focus:border-indigo-500 focus:bg-zinc-800/80 transition-all placeholder:text-zinc-700 uppercase"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && userName && handlePlay()}
                      autoFocus
                      maxLength={12}
                    />
                    {/* Money row */}
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <span className="text-[10px]">$</span>
                        <span className="font-bold">0</span>
                      </div>
                      <div className="w-px h-3 bg-zinc-700" />
                      <span className="text-zinc-500 font-mono">LVL 1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions — GTA 5 Style */}
              <div className="flex flex-col gap-2.5">
                <button 
                  disabled={!userName.trim()}
                  onClick={handlePlay}
                  className="group relative flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-widest text-lg rounded-xl transition-all duration-300 disabled:opacity-30 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.5)] overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] group-hover:translate-x-full transition-transform duration-700" />
                  <Play size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10 tracking-wider italic">Play Online</span>
                  <span className="relative z-10 ml-auto text-[10px] bg-white/10 rounded-full px-3 py-1 font-mono tracking-wider italic">
                    10 MAX
                  </span>
                </button>

                <button className="group flex items-center gap-4 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-all duration-300">
                  <Settings size={18} className="text-zinc-500 group-hover:rotate-90 transition-transform duration-500" />
                  <span className="font-bold tracking-widest uppercase text-sm italic">Settings</span>
                  <span className="ml-auto text-[10px] text-zinc-600 font-mono">SOON</span>
                </button>
              </div>
            </div>

            {/* Bottom footer */}
            <div className="absolute bottom-6 left-8 sm:left-14 right-8 sm:right-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={12} className="text-zinc-700" />
                <User size={12} className="text-zinc-700" />
                <span className="text-[9px] text-zinc-700 font-mono">SOCIAL CLUB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500/50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP RIGHT HUD - ONLY SHOW WHEN DRIVING OR JOINED */}
      {joined && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none drop-shadow-md flex flex-col items-end">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <h1 className="font-bold tracking-widest text-[10px] text-zinc-400 uppercase italic">Online</h1>
            <p className="text-sm font-black text-white tracking-widest italic">{userName}</p>
            {drivingVehicle && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-[10px] rounded font-bold uppercase italic shadow-[0_0_10px_rgba(79,70,229,0.8)]">
                {drivingVehicle.type}
              </span>
            )}
          </div>
          <Speedometer />
        </div>
      )}
    </div>
  );
}
