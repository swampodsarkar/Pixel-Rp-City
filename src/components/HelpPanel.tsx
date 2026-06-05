import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

const CONTROLS = [
  { key: "W / Arrow Up", action: "Move Forward" },
  { key: "S / Arrow Down", action: "Move Backward" },
  { key: "A / Arrow Left", action: "Move Left" },
  { key: "D / Arrow Right", action: "Move Right" },
  { key: "Shift", action: "Sprint" },
  { key: "E", action: "Enter / Exit Vehicle" },
  { key: "Space / Click", action: "Fire Weapon" },
  { key: "1 / 2 / 3", action: "Equip Weapon (Pistol / Shotgun / Rifle)" },
  { key: "G", action: "Open Garage" },
  { key: "Enter", action: "Open Chat" },
  { key: "H", action: "Toggle Help" },
  { key: "M", action: "Toggle Missions" },
  { key: "Joystick (Mobile)", action: "Movement" },
  { key: "Zap Button (Mobile)", action: "Sprint" },
  { key: "ENTER Button (Mobile)", action: "Enter / Exit Vehicle" },
];

export const HelpPanel = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) {
        setShow((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 mb-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-2 hover:bg-black/60 transition-all shadow-xl pointer-events-auto"
      >
        <HelpCircle size={18} className="text-zinc-400" />
      </button>

      {show && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900/95 border border-white/10 rounded-2xl w-[400px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-black italic text-white tracking-tight">
                Controls
              </h2>
              <button onClick={() => setShow(false)}>
                <X size={18} className="text-zinc-500 hover:text-white transition-colors" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {CONTROLS.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                    {c.key}
                  </span>
                  <span className="text-sm text-zinc-300">{c.action}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/5">
              <p className="text-[11px] text-zinc-500 italic">
                Press <kbd className="text-indigo-400 font-mono">H</kbd> to toggle this panel
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
