"use client";

import { useEffect, useRef } from "react";

const NODE_DENSITY = 22000; // one node per this many square pixels
const MAX_NODES = 70;
const LINK_DISTANCE = 175;
const SPEED = 0.12;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Drifting node network drawn on a canvas — the connected-data look, in
// monochrome. Static single frame when the visitor prefers reduced motion.
export function NetworkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let nodes: Node[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;

    // Sizes the backing store to the device pixel ratio and reseeds nodes.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        MAX_NODES,
        Math.round((width * height) / NODE_DENSITY)
      );
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    };

    // Draws one frame: links first, then nodes on top.
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;

          ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.34;
          ctx.strokeStyle = "#9fa0b5";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#555663";
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Advances node positions, bouncing them off the edges.
    const step = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    resize();
    if (reduceMotion) draw();
    else frame = requestAnimationFrame(step);

    const onResize = () => {
      resize();
      if (reduceMotion) draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Vignette keeps the card readable against the network. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at center, rgba(237,239,243,0.96) 0%, rgba(237,239,243,0.78) 40%, rgba(237,239,243,0) 100%)",
        }}
      />
    </div>
  );
}
