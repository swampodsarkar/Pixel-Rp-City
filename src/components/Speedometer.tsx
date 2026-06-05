import { useGameStore } from '../store';

export const Speedometer = () => {
  const speed = useGameStore(s => s.speed);
  const drivingVehicle = useGameStore(s => s.drivingVehicle);

  if (!drivingVehicle) return null;

  // Max speed mapping based on car speed (which is ~30 max)
  const maxSpeed = 30;
  const speedRatio = Math.min(speed / maxSpeed, 1);
  const dashArray = 276;
  const dashOffset = dashArray - (speedRatio * dashArray * 0.75); // 0.75 to look like a realistic dial arc

  return (
    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-full w-28 h-28 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] mt-4 pointer-events-none">
      <div className="absolute inset-0 rounded-full border-4 border-zinc-800/50" />
      
      {/* Dynamic speed arc */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-[135deg]">
        <circle 
          cx="56" cy="56" r="48" 
          stroke="url(#speed-gradient)" 
          strokeWidth="6" 
          fill="none" 
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset} 
          strokeLinecap="round"
          className="transition-all duration-75"
        />
        <defs>
          <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <span className="text-3xl font-black italic text-white leading-none tracking-tighter shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {Math.round(speed * 3.5)}
      </span>
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">KM/H</span>
    </div>
  );
};
