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
          <OrthographicCamera makeDefault position={[0, 200, 0]} zoom={0.5} near={-10000} far={20000} />
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

      {/* MAIN MENU UI */}
      {!joined && (
        <div className="absolute inset-0 z-20 flex bg-black/50 backdrop-blur-md sm:items-center">
          {/* Main Menu Panel - Left side sliding */}
          <div className="w-full sm:w-[420px] bg-black/90 h-[100dvh] border-r-4 border-indigo-600/50 shadow-[20px_0_40px_rgba(0,0,0,0.8)] p-6 sm:p-12 flex flex-col justify-center overflow-y-auto overflow-x-hidden">
            
            {/* Branding GTA Style */}
            <div className="mb-8 mt-auto sm:mt-0 pt-8 sm:pt-0">
              <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mix-blend-difference drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-none">
                RP
                <br/>
                <span className="text-4xl md:text-5xl text-indigo-500">CITY</span>
              </h1>
              <div className="w-16 h-2 bg-indigo-600 mt-4 rounded-full flex-shrink-0"></div>
            </div>

            {/* Account Setup */}
            <div className="mb-8 space-y-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Character Nickname
              </label>
              <input 
                type="text" 
                placeholder="Enter Nickname" 
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded px-5 py-4 text-white text-lg font-bold focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700 shadow-inner block uppercase"
                value={userName}
                onChange={(e) => setUserName(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && userName && handlePlay()}
                autoFocus
                maxLength={12}
              />
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col gap-2">
              <button 
                disabled={!userName.trim()}
                onClick={handlePlay}
                className="group relative flex items-center gap-4 text-left px-5 py-4 bg-white hover:bg-zinc-200 text-black transition-all overflow-hidden disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="font-extrabold tracking-widest uppercase text-lg relative z-10 italic">Play Online (10 Max)</span>
              </button>

              <button className="group flex items-center gap-4 text-left px-5 py-4 bg-black/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white transition-all">
                <Settings size={20} className="text-zinc-400 group-hover:rotate-90 transition-transform" />
                <span className="font-bold tracking-widest uppercase text-sm italic">Settings</span>
              </button>
            </div>
            
            <div className="mt-auto pt-8 flex items-center justify-between">
              <p className="text-[10px] text-zinc-600 font-mono tracking-widest">BUILD 1.0.6</p>
              <div className="flex gap-2">
                <Shield size={14} className="text-zinc-600" />
                <User size={14} className="text-zinc-600" />
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
