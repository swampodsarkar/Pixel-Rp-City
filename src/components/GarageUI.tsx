import { useGameStore } from "../store";
import { syncCarPosition } from "../multiplayer";
import { Car, X } from "lucide-react";

const SPAWNABLE_CARS = [
  { id: 'spawn1', color: '#ef4444', name: 'Red Bullet' },
  { id: 'spawn2', color: '#3b82f6', name: 'Blue Streak' },
  { id: 'spawn3', color: '#10b981', name: 'Green Phantom' },
  { id: 'spawn4', color: '#eab308', name: 'Gold Cruiser' },
];

export const GarageUI = () => {
  const showGarage = useGameStore((s) => s.showGarage);
  const setShowGarage = useGameStore((s) => s.setShowGarage);
  const money = useGameStore((s) => s.money);
  const setMoney = useGameStore((s) => s.setMoney);
  const ownedCars = useGameStore((s) => s.ownedCars);
  const addOwnedCar = useGameStore((s) => s.addOwnedCar);
  const cars = useGameStore((s) => s.cars);
  const updateCar = useGameStore((s) => s.updateCar);

  const buyCar = (car: typeof SPAWNABLE_CARS[0]) => {
    const cost = 500;
    if (money < cost) return;
    setMoney(money - cost);
    addOwnedCar(car.id);
    // Spawn near player
    const spawnX = 50 + Math.random() * 100;
    const spawnZ = 50 + Math.random() * 100;
    updateCar(car.id, { x: spawnX, z: spawnZ, color: car.color });
    syncCarPosition(car.id, spawnX, spawnZ);
  };

  const spawnCar = (carId: string) => {
    const spawnX = 30 + Math.random() * 60;
    const spawnZ = 30 + Math.random() * 60;
    updateCar(carId, { x: spawnX, z: spawnZ });
    syncCarPosition(carId, spawnX, spawnZ);
  };

  if (!showGarage) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900/95 border border-white/10 rounded-2xl w-[420px] max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-indigo-400" />
            <h2 className="text-lg font-black italic text-white tracking-tight">Garage</h2>
          </div>
          <button onClick={() => setShowGarage(false)}>
            <X size={18} className="text-zinc-500 hover:text-white transition-colors" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-zinc-500 mb-2">
            Balance: <span className="text-yellow-400 font-bold">${money}</span>
          </p>

          {SPAWNABLE_CARS.map((car) => {
            const owned = ownedCars.includes(car.id);
            return (
              <div key={car.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: car.color }} />
                  <div>
                    <p className="text-sm font-bold text-white">{car.name}</p>
                    <p className="text-[11px] text-zinc-500">{owned ? 'Owned' : '$500'}</p>
                  </div>
                </div>
                {owned ? (
                  <button
                    onClick={() => spawnCar(car.id)}
                    className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-lg hover:bg-indigo-400/20 transition-colors"
                  >
                    Spawn
                  </button>
                ) : (
                  <button
                    onClick={() => buyCar(car)}
                    disabled={money < 500}
                    className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg hover:bg-yellow-400/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Buy $500
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-[10px] text-zinc-600">
            Press <kbd className="text-indigo-400 font-mono">G</kbd> to open Garage
          </p>
        </div>
      </div>
    </div>
  );
};
