import { useEffect, useState } from "react";
import { useGameStore } from "../store";
import { useMultiplayerStore } from "../multiplayer";
import { sendChallenge, acceptChallenge, listenToChallenge, listenToRaceState, resetRace, declineChallenge, finishRace, RaceChallenge } from "../race";
import { Flag, Trophy, Sword } from "lucide-react";

export const RaceUI = () => {
  const racePhase = useGameStore((s) => s.racePhase);
  const setRacePhase = useGameStore((s) => s.setRacePhase);
  const setRaceStart = useGameStore((s) => s.setRaceStart);
  const setRaceFinish = useGameStore((s) => s.setRaceFinish);
  const setRaceCountdown = useGameStore((s) => s.setRaceCountdown);
  const setRaceWinner = useGameStore((s) => s.setRaceWinner);
  const raceCountdown = useGameStore((s) => s.raceCountdown);
  const raceWinner = useGameStore((s) => s.raceWinner);
  const raceFinish = useGameStore((s) => s.raceFinish);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const myData = myId ? players[myId] : null;
  const drivingVehicle = useGameStore((s) => s.drivingVehicle);
  const setMoney = useGameStore((s) => s.setMoney);

  const [incomingChallenge, setIncomingChallenge] = useState<RaceChallenge | null>(null);

  // Listen for incoming challenges
  useEffect(() => {
    const unsub = listenToChallenge((challenge) => {
      setIncomingChallenge(challenge);
    });
    return unsub;
  }, []);

  // Listen for race state changes
  useEffect(() => {
    const unsub = listenToRaceState((state) => {
      if (!state) {
        setRacePhase('idle');
        setRaceStart(null);
        setRaceFinish(null);
        setRaceCountdown(0);
        return;
      }
      if (state.state === 'countdown') {
        setRacePhase('countdown');
        setRaceStart({ x: state.startX, z: state.startZ });
        setRaceFinish({ x: state.finishX, z: state.finishZ });
        setRaceCountdown(state.countdown);
        setIncomingChallenge(null);
        let count = state.countdown;
        const interval = setInterval(() => {
          count--;
          setRaceCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            setRacePhase('racing');
          }
        }, 1000);
      }
      if (state.state === 'finished') {
        setRacePhase('finished');
        setRaceWinner(state.winner);
        if (state.winner?.id === myId) {
          setMoney(useGameStore.getState().money + 2000);
        }
        setTimeout(() => {
          resetRace();
          setRacePhase('idle');
          setRaceWinner(null);
        }, 5000);
      }
    });
    return unsub;
  }, [myId]);

  // R key to challenge, Y/N to accept/decline
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && drivingVehicle && myId && myData && racePhase === 'idle') {
        const nearby = Object.values(players).find(p =>
          p.id !== myId && Math.hypot(p.x - myData.x, p.z - myData.z) < 15
        );
        if (nearby) {
          sendChallenge(myId, myData.name);
        }
      }
      if (e.key.toLowerCase() === 'y' && incomingChallenge) {
        acceptChallenge();
      }
      if (e.key.toLowerCase() === 'n' && incomingChallenge) {
        declineChallenge();
        setIncomingChallenge(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drivingVehicle, myId, myData, players, racePhase, incomingChallenge]);

  // Check finish line crossing
  useEffect(() => {
    if (racePhase !== 'racing' || !myData || !raceFinish || !myId) return;
    const dist = Math.hypot(myData.x - raceFinish.x, myData.z - raceFinish.z);
    if (dist < 15) {
      finishRace(myId, myData.name);
    }
  }, [myData?.x, myData?.z, racePhase]);

  if (racePhase === 'idle') {
    const nearbyPlayer = drivingVehicle && myData
      ? Object.values(players).find(p =>
          p.id !== myId && Math.hypot(p.x - myData.x, p.z - myData.z) < 15
        )
      : null;

    return (
      <>
        {/* Incoming challenge */}
        {incomingChallenge && incomingChallenge.fromId !== myId && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-xl px-5 py-3 shadow-2xl flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <Sword size={18} className="text-red-400" />
                <span className="text-sm font-bold text-white">
                  <span style={{ color: Object.values(players).find(p => p.id === incomingChallenge.fromId)?.color || '#fff' }}>
                    {incomingChallenge.fromName}
                  </span>
                  {' '}challenges you to a race!
                </span>
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-xs font-bold text-green-400">Y — Accept</span>
                <span className="text-xs font-bold text-red-400">N — Decline</span>
              </div>
            </div>
          </div>
        )}

        {/* Challenge nearby player */}
        {nearbyPlayer && !incomingChallenge && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl">
              <Flag size={18} className="text-yellow-400" />
              <span className="text-sm font-bold text-white">Press <span className="text-yellow-400">R</span> to race {nearbyPlayer.name}!</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
      {racePhase === 'countdown' && raceCountdown > 0 && (
        <div className="animate-fade-in">
          <span className="text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]" style={{
            animation: 'pulse 0.5s ease-in-out'
          }}>
            {raceCountdown}
          </span>
        </div>
      )}
      {racePhase === 'racing' && raceCountdown === 0 && (
        <div className="absolute top-1/3">
          <span className="text-6xl font-black text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse">GO!</span>
        </div>
      )}
      {racePhase === 'finished' && raceWinner && (
        <div className="bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl px-10 py-8 shadow-2xl flex flex-col items-center animate-fade-in">
          <Trophy size={48} className="text-yellow-400 mb-3" />
          <span className="text-lg font-bold text-white">
            {raceWinner.id === myId ? 'You Win!' : `${raceWinner.name} Wins!`}
          </span>
          <span className="text-yellow-400 font-bold text-sm mt-1">+$2,000</span>
        </div>
      )}
    </div>
  );
};
