import { useEffect, useRef } from "react";
import { useMultiplayerStore } from "../multiplayer";
import { useGameStore } from "../store";

const MAP_SIZE = 4000;
const MINIMAP_SIZE = 240;

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

    const dpr = 3;
    canvas.width = MINIMAP_SIZE * dpr;
    canvas.height = MINIMAP_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const scale = MINIMAP_SIZE / (MAP_SIZE * 2);
    const cx = MINIMAP_SIZE / 2;
    const cy = MINIMAP_SIZE / 2;

    const worldToMap = (x: number, z: number) => ({
      mx: cx + x * scale,
      my: cy + z * scale,
    });

    const draw = () => {
      ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      // Gradient bg
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
      grad.addColorStop(0, "rgba(15,15,25,0.95)");
      grad.addColorStop(0.7, "rgba(8,8,18,0.95)");
      grad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

      // Grid dots (subtle)
      ctx.fillStyle = "rgba(50,50,70,0.15)";
      for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 200) {
        for (let z = -MAP_SIZE; z <= MAP_SIZE; z += 200) {
          const { mx, my } = worldToMap(x, z);
          ctx.fillRect(mx, my, 1, 1);
        }
      }

      // Main roads (cross)
      ctx.strokeStyle = "rgba(100,110,140,0.6)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(100,110,140,0.2)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, MINIMAP_SIZE);
      ctx.moveTo(0, cy);
      ctx.lineTo(MINIMAP_SIZE, cy);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Secondary roads (horizontal, every 10 blocks = 300 units)
      ctx.strokeStyle = "rgba(80,90,120,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      for (let i = -MAP_SIZE; i <= MAP_SIZE; i += 300) {
        const { mx, my } = worldToMap(i, 0);
        if (Math.abs(i) < 200) continue;
        ctx.beginPath();
        ctx.moveTo(0, my);
        ctx.lineTo(MINIMAP_SIZE, my);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.lineTo(mx, MINIMAP_SIZE);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Building footprint clusters
      ctx.fillStyle = "rgba(60,60,85,0.15)";
      for (let x = -MAP_SIZE; x <= MAP_SIZE; x += 300) {
        for (let z = -MAP_SIZE; z <= MAP_SIZE; z += 300) {
          if (Math.abs(x) < 150 && Math.abs(z) < 150) continue;
          const { mx, my } = worldToMap(x, z);
          const bw = 4 + Math.random() * 6;
          const bh = 4 + Math.random() * 6;
          ctx.fillRect(mx - bw/2, my - bh/2, bw, bh);
        }
      }

      // Cars
      cars.forEach((car) => {
        const { mx, my } = worldToMap(car.x, car.z);
        if (mx < -5 || mx > MINIMAP_SIZE+5 || my < -5 || my > MINIMAP_SIZE+5) return;
        ctx.fillStyle = "#eab308";
        ctx.shadowColor = "rgba(234,179,8,0.3)";
        ctx.shadowBlur = 3;
        ctx.fillRect(mx - 2, my - 1, 4, 2);
        ctx.shadowBlur = 0;
      });

      // Other players as direction triangles
      Object.values(players).forEach((p) => {
        if (p.id === myId) return;
        const { mx, my } = worldToMap(p.x, p.z);
        if (mx < -5 || mx > MINIMAP_SIZE+5 || my < -5 || my > MINIMAP_SIZE+5) return;
        const angle = p.ry || 0;
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.shadowColor = "rgba(255,255,255,0.2)";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(-3, 3);
        ctx.lineTo(3, 3);
        ctx.closePath();
        ctx.fillStyle = p.color || "#fff";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Self — bright triangle with ring
      if (myData) {
        const { mx, my } = worldToMap(myData.x, myData.z);
        const angle = myData.ry || 0;

        // Outer ring
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(79,70,229,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Direction triangle
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.shadowColor = "rgba(79,70,229,0.6)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(-4, 4);
        ctx.lineTo(4, 4);
        ctx.closePath();
        ctx.fillStyle = "#4f46e5";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Border glow
      const bgrad = ctx.createLinearGradient(0, 0, 0, MINIMAP_SIZE);
      bgrad.addColorStop(0, "rgba(79,70,229,0.3)");
      bgrad.addColorStop(0.5, "rgba(79,70,229,0.1)");
      bgrad.addColorStop(1, "rgba(79,70,229,0.3)");
      ctx.strokeStyle = bgrad;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, MINIMAP_SIZE-2, MINIMAP_SIZE-2);

      // Corner accents
      const cornerSize = 8;
      ctx.strokeStyle = "rgba(79,70,229,0.5)";
      ctx.lineWidth = 2;
      [[0,0],[1,0],[0,1],[1,1]].forEach(([sx, sy]) => {
        const bx = sx === 1 ? MINIMAP_SIZE : 0;
        const by = sy === 1 ? MINIMAP_SIZE : 0;
        const dx = sx === 0 ? 1 : -1;
        const dy = sy === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize * dy);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize * dx, by);
        ctx.stroke();
      });

      // Coordinate labels
      ctx.fillStyle = "rgba(120,120,160,0.4)";
      ctx.font = "7px monospace";
      ctx.fillText(`${Math.round(myData?.x || 0)}, ${Math.round(myData?.z || 0)}`, 4, MINIMAP_SIZE - 4);
    };

    draw();
    const id = setInterval(draw, 200);
    return () => clearInterval(id);
  }, [players, cars, myId, myData]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-4 right-4 z-10 rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE, imageRendering: "auto" }}
    />
  );
};
