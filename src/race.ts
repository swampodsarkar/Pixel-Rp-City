import { ref, set, update, onValue, off } from "firebase/database";
import { db } from "./firebase";
import { useMultiplayerStore } from "./multiplayer";

export interface RaceChallenge {
  fromId: string;
  fromName: string;
}

export interface RaceState {
  state: 'waiting' | 'challenged' | 'countdown' | 'racing' | 'finished';
  challenger: { id: string; name: string } | null;
  challenged: { id: string; name: string } | null;
  startX: number;
  startZ: number;
  finishX: number;
  finishZ: number;
  countdown: number;
  winner: { id: string; name: string } | null;
}

const RACE_START_POSITIONS = [
  { x: 300, z: 300, fx: 500, fz: 300 },
  { x: -300, z: -300, fx: -500, fz: -300 },
  { x: -300, z: 300, fx: -500, fz: 300 },
  { x: 300, z: -300, fx: 500, fz: -300 },
];

export const sendChallenge = (fromId: string, fromName: string) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  set(ref(db, `servers/${serverId}/race/challenge`), { fromId, fromName });
};

export const acceptChallenge = () => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  const pos = RACE_START_POSITIONS[Math.floor(Math.random() * RACE_START_POSITIONS.length)];
  set(ref(db, `servers/${serverId}/race/state`), {
    state: 'countdown',
    challenger: null,
    challenged: null,
    startX: pos.x,
    startZ: pos.z,
    finishX: pos.fx,
    finishZ: pos.fz,
    countdown: 3,
    winner: null,
  });
};

export const listenToChallenge = (cb: (challenge: RaceChallenge | null) => void) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return () => {};
  const challengeRef = ref(db, `servers/${serverId}/race/challenge`);
  onValue(challengeRef, (snap) => {
    cb(snap.val() || null);
  });
  return () => off(challengeRef);
};

export const listenToRaceState = (cb: (state: RaceState | null) => void) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return () => {};
  const stateRef = ref(db, `servers/${serverId}/race/state`);
  onValue(stateRef, (snap) => {
    cb(snap.val() || null);
  });
  return () => off(stateRef);
};

export const finishRace = (winnerId: string, winnerName: string) => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  update(ref(db, `servers/${serverId}/race/state`), {
    state: 'finished',
    winner: { id: winnerId, name: winnerName },
  });
};

export const resetRace = () => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  set(ref(db, `servers/${serverId}/race`), {});
};

export const declineChallenge = () => {
  const serverId = useMultiplayerStore.getState().serverId;
  if (!serverId) return;
  set(ref(db, `servers/${serverId}/race/challenge`), null);
};
