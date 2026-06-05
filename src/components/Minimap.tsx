import { useEffect, useRef } from "react";
import { useMultiplayerStore } from "../multiplayer";
import { useGameStore } from "../store";

const MAP_SIZE = 4000;
const MINIMAP_SIZE = 160;

export const Minimap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const cars = useGameStore((s) => s.cars);
  const myData = myId ? players[myId] : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-res canvas
    const dpr = 2;
    canvas.width = MINIMAP_SIZE * dpr;
    canvas.height = MINIMAP_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const scale = MINIMAP_SIZE / (MAP_SIZE * 2);

    const draw = () => {
      ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      // Background
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      // Road lines
      const cx = MINIMAP_SIZE / 2;
      const cy = MINIMAP_SIZE / 2;
      ctx.strokeStyle = "rgba(100,100,120,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, MINIMAP_SIZE);
      ctx.moveTo(0, cy);
      ctx.lineTo(MINIMAP_SIZE, cy);
      ctx.stroke();

      // Draw buildings as small dots (simplified)
      ctx.fillStyle = "rgba(80,80,100,0.4)";
      for (let x = -3000; x <= 3000; x += 300) {
        for (let z = -3000; z <= 3000; z += 300) {
          if (Math.abs(x) < 200 && Math.abs(z) < 200) continue;
          const bx = cx + x * scale;
          const by = cy + z * scale;
          ctx.fillRect(bx, by, 2, 2);
        }
      }

      // Cars
      ctx.fillStyle = "#fbbf24";
      cars.forEach((car) => {
        const x = cx + car.x * scale;
        const z = cy + car.z * scale;
        if (x < 0 || x > MINIMAP_SIZE || z < 0 || z > MINIMAP_SIZE) return;
        ctx.fillRect(x - 1.5, z - 1.5, 3, 3);
      });

      // Other players
      Object.values(players).forEach((p) => {
        if (p.id === myId) return;
        const x = cx + p.x * scale;
        const z = cy + p.z * scale;
        if (x < 0 || x > MINIMAP_SIZE || z < 0 || z > MINIMAP_SIZE) return;
        ctx.beginPath();
        ctx.arc(x, z, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color || "#fff";
        ctx.fill();
      });

      // Self
      if (myData) {
        const x = cx + myData.x * scale;
        const z = cy + myData.z * scale;
        ctx.beginPath();
        ctx.arc(x, z, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#4f46e5";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    };

    draw();
    const id = setInterval(draw, 300);
    return () => clearInterval(id);
  }, [players, cars, myId, myData]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-4 right-4 z-10 rounded-xl border border-white/10 shadow-2xl"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE, imageRendering: "pixelated" }}
    />
  );
};
