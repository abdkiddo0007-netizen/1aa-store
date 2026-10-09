import { useState, useEffect, useRef } from "react";
import { haptics } from "../utils/haptics";
import { 
  Rotate3d, 
  Scan, 
  Truck, 
  ShieldCheck, 
  Percent, 
  Boxes
} from "lucide-react";

interface SplineInteractiveHeroProps {
  onOpenArStudio: () => void;
  onOpenPriceRadar: () => void;
}

export default function SplineInteractiveHero({
  onOpenArStudio,
  onOpenPriceRadar,
}: SplineInteractiveHeroProps) {
  const [activeHotspot, setActiveHotspot] = useState<number>(0);
  const [rotation, setRotation] = useState({ x: -10, y: 25 });
  const [isHovered, setIsHovered] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hotspots describing 1AA's core direct-sourcing formula
  const hotspots = [
    {
      id: 0,
      title: "Direct Factory Primary Cost",
      subtitle: "₹45 – ₹1,200 Floor Price",
      desc: "Direct manufacturing contracts in bulk. No middlemen, no broker cuts.",
      icon: Boxes,
      color: "from-blue-500 to-indigo-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/40",
    },
    {
      id: 1,
      title: "Built-In Door Courier Freight",
      subtitle: "Surface Express / Air Cargo Included",
      desc: "Every single price includes insured courier transport right to your doorstep.",
      icon: Truck,
      color: "from-amber-500 to-brand-orange",
      textColor: "text-brand-orange",
      borderColor: "border-brand-orange/40",
    },
    {
      id: 2,
      title: "Flat 20% 1AA Operating Margin",
      subtitle: "👑 No-Bargain Customer Guarantee",
      desc: "Completely transparent 20% margin. Why bargain when you pay factory direct?",
      icon: Percent,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/40",
    },
    {
      id: 3,
      title: "Mysore Central Bench Testing",
      subtitle: "100% Pre-Dispatch Quality Control",
      desc: "Every electrical and mechanical item is bench-tested in Mysore before shipment.",
      icon: ShieldCheck,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/40",
    },
  ];

  // Dynamically inject Spline Viewer script if available
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("spline-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js";
      script.onload = () => setSplineLoaded(true);
      script.onerror = () => setSplineLoaded(false);
      document.head.appendChild(script);
    } else if (customElements.get("spline-viewer")) {
      setSplineLoaded(true);
    }
  }, []);

  // WebGL / Canvas interactive 3D particle & wireframe cube animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleX = 0.2;
    let angleY = 0.3;

    // Generate 3D floating constellation particles
    const particles = Array.from({ length: 48 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      z: (Math.random() - 0.5) * 320,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? "rgba(249, 115, 22, 0.8)" : "rgba(6, 182, 212, 0.8)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const focalLength = 340;

      // Auto slow rotation if not hovering
      if (!isHovered) {
        angleY += 0.008;
        angleX = Math.sin(Date.now() / 2500) * 0.25;
      } else {
        angleY = (rotation.y * Math.PI) / 180;
        angleX = (rotation.x * Math.PI) / 180;
      }

      // Render 3D particles
      particles.forEach((p) => {
        // 3D rotation Y
        let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let z1 = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);

        // 3D rotation X
        let y2 = p.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + p.y * Math.sin(angleX);

        const scale = focalLength / (focalLength + z2 + 250);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        if (z2 > -200) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, Math.max(0.5, p.radius * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });

      // Render 3D isometric cube wireframe (1AA Master Carton Hologram)
      const size = 65;
      const vertices = [
        [-size, -size, -size],
        [size, -size, -size],
        [size, size, -size],
        [-size, size, -size],
        [-size, -size, size],
        [size, -size, size],
        [size, size, size],
        [-size, size, size],
      ];

      const projected = vertices.map(([vx, vy, vz]) => {
        let x1 = vx * Math.cos(angleY) - vz * Math.sin(angleY);
        let z1 = vz * Math.cos(angleY) + vx * Math.sin(angleY);

        let y2 = vy * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + vy * Math.sin(angleX);

        const scale = focalLength / (focalLength + z2 + 200);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          z: z2,
        };
      });

      // Edges connecting cube vertices
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back face
        [4, 5], [5, 6], [6, 7], [7, 4], // front face
        [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
      ];

      ctx.lineWidth = 1.5;
      edges.forEach(([start, end]) => {
        const p1 = projected[start];
        const p2 = projected[end];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "rgba(249, 115, 22, 0.45)";
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isHovered, rotation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({
      x: -y * 0.12,
      y: x * 0.18,
    });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.04] via-obsidian-900/80 to-obsidian-950 border border-white/10 shadow-2xl backdrop-blur-2xl p-6 sm:p-8 space-y-6">
      
      {/* Radiant Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Pill & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-[10px] font-mono font-bold text-brand-orange uppercase tracking-wider mb-2">
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Interactive 3D Spline Experience</span>
            <span className="text-white/20">•</span>
            <span className={splineLoaded ? "text-emerald-400" : "text-white"}>
              {splineLoaded ? "● Spline WebGL Active" : "Mysore Sourcing Node"}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Anatomy of Factory Direct Sourcing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover & rotate the 3D model below to explore how 1AA delivers 40%–70% savings with zero retail markup.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onOpenArStudio();
            }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-glow-blue flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Scan className="w-4 h-4 text-obsidian-950" />
            <span>Open AR Studio (Camera)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.light();
              onOpenPriceRadar();
            }}
            className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-brand-orange" />
            <span className="hidden sm:inline">Arbitrage Radar</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage & Interactive Hotspots Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Interactive 3D Viewport with Parallax */}
        <div 
          className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Canvas for 3D Holographic Rendering */}
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Center 3D Floating Brand Emblem */}
          <div 
            className="absolute z-10 transition-transform duration-100 pointer-events-none flex flex-col items-center justify-center space-y-2"
            style={{
              transform: `perspective(600px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-orange/30 via-white/10 to-cyan-500/30 border-2 border-white/30 backdrop-blur-xl flex flex-col items-center justify-center p-3 shadow-2xl">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter">
                1AA
              </span>
              <span className="text-[8px] font-black text-brand-orange uppercase tracking-widest text-center leading-none mt-0.5">
                MYSORE HUB
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-obsidian-950/90 border border-white/15 text-[10px] font-mono text-cyan-300 font-bold shadow-lg">
              {hotspots[activeHotspot].subtitle}
            </div>
          </div>

          {/* Interactive 3D Hotspot Dots on the Stage */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-mono text-slate-300 backdrop-blur-md">
            <Rotate3d className="w-3.5 h-3.5 text-brand-orange animate-spin duration-3000" />
            <span>Move cursor to tilt 3D space</span>
          </div>

          <div className="absolute bottom-4 inset-x-4 z-20 flex justify-center gap-2">
            {hotspots.map((h, idx) => (
              <button
                key={h.id}
                onClick={() => {
                  haptics.selection();
                  setActiveHotspot(idx);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  activeHotspot === idx
                    ? "bg-brand-orange text-obsidian-950 border-brand-orange shadow-glow-orange scale-105"
                    : "bg-black/60 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Hotspot Detail Cards */}
        <div className="lg:col-span-5 space-y-3">
          {hotspots.map((h, idx) => {
            const Icon = h.icon;
            const isActive = activeHotspot === idx;
            return (
              <div
                key={h.id}
                onClick={() => {
                  haptics.light();
                  setActiveHotspot(idx);
                }}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                  isActive
                    ? "bg-white/[0.08] border-brand-orange shadow-glow-orange translate-x-1"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive 
                      ? "bg-gradient-to-r from-brand-orange to-amber-400 text-obsidian-950 shadow-glow-orange font-bold" 
                      : "bg-white/10 text-slate-300"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">
                        {h.title}
                      </h4>
                      <span className={`text-[10px] font-mono font-bold ${h.textColor}`}>
                        {h.subtitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
