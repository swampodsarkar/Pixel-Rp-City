import { create } from 'zustand';

export interface VehicleInfo {
  id: string;
  type: string;
  color: string;
}

export interface CarData {
  id: string;
  x: number;
  z: number;
  color: string;
  type: string;
}

const initialCars: CarData[] = [
  { id: 'car1', x: 20, z: 0, color: '#ef4444', type: 'sports' },
  { id: 'car2', x: -50, z: 50, color: '#3b82f6', type: 'sedan' },
  { id: 'car3', x: 100, z: -20, color: '#ffffff', type: 'police' },
  { id: 'car4', x: 10, z: 120, color: '#eab308', type: 'taxi' },
  { id: 'car5', x: -100, z: -100, color: '#ffffff', type: 'ambulance' },
  { id: 'car6', x: 200, z: 0, color: '#a855f7', type: 'sedan' },
  { id: 'car7', x: -200, z: 50, color: '#22d3ee', type: 'sports' },
  { id: 'car8', x: 0, z: 200, color: '#f97316', type: 'truck' },
  { id: 'car9', x: 0, z: -200, color: '#000000', type: 'sedan' },
  { id: 'car10', x: 300, z: 20, color: '#10b981', type: 'sports' },
];

export interface WeaponState {
  equipped: string | null;
  ammo: Record<string, number>;
}

interface GameStore {
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  joystick: { x: number; y: number };
  setJoystick: (joystick: { x: number; y: number }) => void;
  isSprinting: boolean;
  setSprinting: (s: boolean) => void;
  nearbyVehicle: VehicleInfo | null;
  setNearbyVehicle: (vehicle: VehicleInfo | null) => void;
  drivingVehicle: VehicleInfo | null;
  setDrivingVehicle: (vehicle: VehicleInfo | null) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  health: number;
  setHealth: (health: number) => void;
  maxHealth: number;
  money: number;
  setMoney: (money: number) => void;
  weapon: WeaponState;
  setWeapon: (weapon: WeaponState) => void;
  lastShot: number;
  setLastShot: (t: number) => void;
  ownedCars: string[];
  addOwnedCar: (id: string) => void;
  showGarage: boolean;
  setShowGarage: (s: boolean | ((prev: boolean) => boolean)) => void;
  isAdmin: boolean;
  setIsAdmin: (a: boolean) => void;
  cars: CarData[];
  updateCar: (id: string, updates: Partial<CarData>) => void;
  racePhase: 'idle' | 'challenged' | 'countdown' | 'racing' | 'finished';
  setRacePhase: (p: 'idle' | 'challenged' | 'countdown' | 'racing' | 'finished') => void;
  raceStart: { x: number; z: number } | null;
  setRaceStart: (p: { x: number; z: number } | null) => void;
  raceFinish: { x: number; z: number } | null;
  setRaceFinish: (p: { x: number; z: number } | null) => void;
  raceCountdown: number;
  setRaceCountdown: (n: number) => void;
  raceWinner: { id: string; name: string } | null;
  setRaceWinner: (w: { id: string; name: string } | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  zoom: 15,
  setZoom: (z) => set((state) => {
    const newZoom = typeof z === 'function' ? z(state.zoom) : z;
    return { zoom: Math.max(3, Math.min(80, newZoom)) };
  }),
  joystick: { x: 0, y: 0 },
  setJoystick: (joystick) => set({ joystick }),
  isSprinting: false,
  setSprinting: (isSprinting) => set({ isSprinting }),
  nearbyVehicle: null,
  setNearbyVehicle: (nearbyVehicle) => set({ nearbyVehicle }),
  drivingVehicle: null,
  setDrivingVehicle: (drivingVehicle) => set({ drivingVehicle }),
  speed: 0,
  setSpeed: (speed) => set({ speed }),
  health: 100,
  setHealth: (health) => set((state) => ({
    health: Math.max(0, Math.min(state.maxHealth, health))
  })),
  maxHealth: 100,
  money: 0,
  setMoney: (money) => set((state) => ({
    money: Math.max(0, money)
  })),
  weapon: { equipped: null, ammo: {} },
  setWeapon: (weapon) => set({ weapon }),
  lastShot: 0,
  setLastShot: (t) => set({ lastShot: t }),
  ownedCars: [],
  addOwnedCar: (id) => set((state) => ({
    ownedCars: state.ownedCars.includes(id) ? state.ownedCars : [...state.ownedCars, id]
  })),
  showGarage: false,
  setShowGarage: (s) => set((state) => ({
    showGarage: typeof s === 'function' ? (s as (prev: boolean) => boolean)(state.showGarage) : s
  })),
  isAdmin: false,
  setIsAdmin: (a) => set({ isAdmin: a }),
  cars: initialCars,
  updateCar: (id, updates) => set((state) => ({
    cars: state.cars.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  racePhase: 'idle',
  setRacePhase: (racePhase) => set({ racePhase }),
  raceStart: null,
  setRaceStart: (raceStart) => set({ raceStart }),
  raceFinish: null,
  setRaceFinish: (raceFinish) => set({ raceFinish }),
  raceCountdown: 0,
  setRaceCountdown: (raceCountdown) => set({ raceCountdown }),
  raceWinner: null,
  setRaceWinner: (raceWinner) => set({ raceWinner }),
}));
