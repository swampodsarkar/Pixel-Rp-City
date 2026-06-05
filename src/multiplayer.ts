import { ref, set, update, remove, onValue, onDisconnect, get, push } from "firebase/database";
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

export interface ServerInfo {
  id: string;
  name: string;
  maxPlayers: number;
  playerCount: number;
}

interface MultiplayerStore {
  players: Record<string, PlayerData>;
  setPlayers: (players: Record<string, PlayerData>) => void;
  myId: string | null;
  setMyId: (id: string | null) => void;
  serverId: string | null;
  setServerId: (id: string | null) => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  players: {},
  setPlayers: (players) => set({ players }),
  myId: null,
  setMyId: (myId) => set({ myId }),
  serverId: null,
  setServerId: (serverId) => set({ serverId }),
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

const SERVERS_CONFIG = [
  { id: 'server1', name: 'Los Santos', maxPlayers: 10 },
  { id: 'server2', name: 'Vice City', maxPlayers: 10 },
  { id: 'server3', name: 'Liberty City', maxPlayers: 10 },
  { id: 'server4', name: 'San Fierro', maxPlayers: 10 },
  { id: 'server5', name: 'Las Venturas', maxPlayers: 10 },
];

export const initServers = async () => {
  for (const s of SERVERS_CONFIG) {
    const infoRef = ref(db, `servers/${s.id}/info`);
    const snap = await get(infoRef);
    if (!snap.exists()) {
      set(infoRef, { name: s.name, maxPlayers: s.maxPlayers });
    }
  }
};

export const listenToServers = (cb: (servers: ServerInfo[]) => void) => {
  const serversRef = ref(db, 'servers');
  return onValue(serversRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list: ServerInfo[] = Object.entries(data).map(([id, s]: [string, any]) => ({
      id,
      name: s.info?.name || id,
      maxPlayers: s.info?.maxPlayers || 10,
      playerCount: Object.keys(s.players || {}).length
    }));
    cb(list);
  });
};

export const joinGame = async (name: string, serverId: string, isAdmin: boolean = false) => {
  const serverRef = ref(db, `servers/${serverId}`);
  const snap = await get(serverRef);
  const data = snap.val();
  if (!data) throw new Error('Server not found');
  const playerCount = Object.keys(data.players || {}).length;
  const maxPlayers = data.info?.maxPlayers || 10;
  if (playerCount >= maxPlayers) throw new Error('Server is full');

  const playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
  useMultiplayerStore.getState().setMyId(playerId);
  useMultiplayerStore.getState().setServerId(serverId);

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const spawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];

  const playerRef = ref(db, `servers/${serverId}/players/${playerId}`);

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

  await set(playerRef, initialData);
  onDisconnect(playerRef).remove();

  const playersRef = ref(db, `servers/${serverId}/players`);
  onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    useMultiplayerStore.getState().setPlayers(data || {});
  });

  return { id: playerId, spawn };
};

export const updatePlayerState = (playerId: string, data: Partial<PlayerData>) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const playerRef = ref(db, `servers/${serverId}/players/${playerId}`);
  update(playerRef, { ...data, timestamp: Date.now() });
};

export const leaveGame = (playerId: string) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const playerRef = ref(db, `servers/${serverId}/players/${playerId}`);
  remove(playerRef);
};

export const syncCarPosition = (carId: string, x: number, z: number) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const carRef = ref(db, `servers/${serverId}/cars/${carId}`);
  set(carRef, { x, z });
};

export const listenToCars = (cb: (cars: Record<string, { x: number; z: number }>) => void) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return () => {};
  const carsRef = ref(db, `servers/${serverId}/cars`);
  return onValue(carsRef, (snapshot) => {
    cb(snapshot.val() || {});
  });
};

export const fireWeapon = (shooterId: string, x: number, z: number, ry: number, weapon: string) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const shotRef = push(ref(db, `servers/${serverId}/shots`));
  set(shotRef, { shooterId, x, z, ry, weapon, timestamp: Date.now() });
};

export const listenToShots = (cb: (shots: ShotData[]) => void) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return () => {};
  const shotsRef = ref(db, `servers/${serverId}/shots`);
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
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  set(ref(db, `servers/${serverId}/shots`), null);
};

export const kickPlayer = (targetId: string) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  remove(ref(db, `servers/${serverId}/players/${targetId}`));
};

export const mutePlayer = (targetId: string, muted: boolean) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  update(ref(db, `servers/${serverId}/players/${targetId}`), { isMuted: muted });
};
