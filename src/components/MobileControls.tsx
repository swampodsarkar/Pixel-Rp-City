import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store';
import { Power, Zap } from 'lucide-react';

export const MobileControls = () => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const setJoystick = useGameStore(s => s.setJoystick);
  const setSprinting = useGameStore(s => s.setSprinting);
  const isSprinting = useGameStore(s => s.isSprinting);
  const nearbyVehicle = useGameStore(s => s.nearbyVehicle);
  const drivingVehicle = useGameStore(s => s.drivingVehicle);
  const setDrivingVehicle = useGameStore(s => s.setDrivingVehicle);

  const [active, setActive] = useState(false);

  useEffect(() => {
    const js = joystickRef.current;
    const handle = handleRef.current;
    if (!js || !handle) return;

    let touchId: number | null = null;
    let centerX = 0;
    let centerY = 0;
    const maxDist = 40;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (touchId !== null) return;
      const t = e.changedTouches[0];
      touchId = t.identifier;
      const rect = js.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      setActive(true);
      updatePos(t.clientX, t.clientY);
    };

    const updatePos = (clientX: number, clientY: number) => {
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }

      handle.style.transform = `translate(${dx}px, ${dy}px)`;
      setJoystick({ x: dx / maxDist, y: dy / maxDist });
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          updatePos(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          handle.style.transform = `translate(0px, 0px)`;
          setJoystick({ x: 0, y: 0 });
          setActive(false);
          break;
        }
      }
    };

    js.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      js.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    }
  }, [setJoystick]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex justify-between p-8 items-end landscape-mobile-controls">
      {/* Visual Joystick */}
      <div 
        ref={joystickRef} 
        className="w-32 h-32 rounded-full border-2 border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-auto select-none touch-none shadow-2xl relative"
      >
        <div 
          ref={handleRef}
          className={`w-14 h-14 rounded-full bg-white/50 backdrop-blur-md shadow-xl transition-colors ${active ? 'bg-indigo-400/80 scale-110' : ''}`}
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 pointer-events-auto select-none touch-none">
        {/* Enter/Exit Vehicle Button */}
        {(nearbyVehicle || drivingVehicle) && (
          <button
            onPointerDown={() => {
              if (drivingVehicle) {
                setDrivingVehicle(null);
              } else if (nearbyVehicle) {
                setDrivingVehicle(nearbyVehicle);
              }
            }}
            className="w-16 h-16 rounded-full bg-orange-600/80 border-2 border-orange-400 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            {drivingVehicle ? <Power size={24} /> : 'ENTER'}
          </button>
        )}

        {/* Sprint Button */}
        <button
          onPointerDown={(e) => { e.preventDefault(); setSprinting(true); }}
          onPointerUp={(e) => { e.preventDefault(); setSprinting(false); }}
          onPointerCancel={(e) => { e.preventDefault(); setSprinting(false); }}
          onPointerLeave={(e) => { e.preventDefault(); setSprinting(false); }}
          className={`w-20 h-20 rounded-full border-2 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all ${
            isSprinting ? 'bg-indigo-600 border-indigo-400' : 'bg-black/40 border-white/20 backdrop-blur-sm'
          }`}
        >
          <Zap size={32} />
        </button>
      </div>
    </div>
  );
};
