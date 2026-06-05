import { ref, set, onValue, onDisconnect, update, remove, push } from "firebase/database";
import { db } from "./firebase";
import { create } from 'zustand';

export interface PlayerData {
  id: string;
  name: string;
  color: string;
  x: number;
  z: number;
  ry: number;
  drivingVehicleId: string | null;
  speed: number;
  weapon: string | null;
  money: number;
  isAdmin: boolean;
  timestamp: number;
}

export interface ShotData {
  id: string;
  shooterId: string;
  x: number;
  z: number;
  ry: number;
  weapon: string;
  timestamp: number;
}

interface MultiplayerStore {
  players: Record<string, PlayerData>;
  setPlayers: (players: Record<string, PlayerData>) => void;
  myId: string | null;
  setMyId: (id: string | null) => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  players: {},
  setPlayers: (players) => set({ players }),
  myId: null,
  setMyId: (myId) => set({ myId }),
}));

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#f97316', '#a855f7', '#ec4899', '#22d3ee', '#ffffff', '#000000'];

const SPAWN_POINTS = [
  { x: 0, z: 0 },
  { x: 120, z: 100 },
  { x: -110, z: -90 },
  { x: 130, z: -110 },
  { x: -120, z: 100 },
  { x: 200, z: 60 },
];

export const joinGame = (name: string, isAdmin: boolean = false) => {
  const playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
  useMultiplayerStore.getState().setMyId(playerId);

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const spawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];

  const playerRef = ref(db, `players/${playerId}`);

  const initialData: PlayerData = {
    id: playerId,
    name,
    color,
    x: spawn.x,
    z: spawn.z,
    ry: 0,
    drivingVehicleId: null,
    speed: 0,
    weapon: null,
    money: 0,
    isAdmin,
    timestamp: Date.now()
  };

  set(playerRef, initialData);
  onDisconnect(playerRef).remove();

  const playersRef = ref(db, 'players');
  onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useMultiplayerStore.getState().setPlayers(data);
    } else {
      useMultiplayerStore.getState().setPlayers({});
    }
  });

  return { id: playerId, spawn };
};

export const updatePlayerState = (playerId: string, data: Partial<PlayerData>) => {
  const playerRef = ref(db, `players/${playerId}`);
  update(playerRef, { ...data, timestamp: Date.now() });
};

export const leaveGame = (playerId: string) => {
  const playerRef = ref(db, `players/${playerId}`);
  remove(playerRef);
};

export const syncCarPosition = (carId: string, x: number, z: number) => {
  const carRef = ref(db, `cars/${carId}`);
  set(carRef, { x, z });
};

export const listenToCars = (cb: (cars: Record<string, { x: number; z: number }>) => void) => {
  const carsRef = ref(db, 'cars');
  return onValue(carsRef, (snapshot) => {
    cb(snapshot.val() || {});
  });
};

export const fireWeapon = (shooterId: string, x: number, z: number, ry: number, weapon: string) => {
  const shotRef = push(ref(db, 'shots'));
  set(shotRef, { shooterId, x, z, ry, weapon, timestamp: Date.now() });
};

export const listenToShots = (cb: (shots: ShotData[]) => void) => {
  const shotsRef = ref(db, 'shots');
  return onValue(shotsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) { cb([]); return; }
    const shots: ShotData[] = Object.entries(data).map(
      ([id, s]: [string, any]) => ({ id, ...s })
    );
    cb(shots.slice(-30));
  });
};

export const clearShots = () => {
  set(ref(db, 'shots'), null);
};

export const kickPlayer = (targetId: string) => {
  remove(ref(db, `players/${targetId}`));
};

export const mutePlayer = (targetId: string, muted: boolean) => {
  update(ref(db, `players/${targetId}`), { isMuted: muted });
};
