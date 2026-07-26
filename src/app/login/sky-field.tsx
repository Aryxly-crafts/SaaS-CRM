"use client";

import { useEffect, useRef } from "react";

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  alpha: number;
  seed: number;
}

const CLOUD_COUNT = 14;

// Slow-drifting cloud layers rendered on a canvas: a calm sky the login card
// floats over. Renders a single static frame under reduced-motion.
export function SkyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let clouds: Cloud[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;

    // Matches the backing store to the device pixel ratio and reseeds clouds.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      clouds = Array.from({ length: CLOUD_COUNT }, (_, i) => {
        const depth = i / CLOUD_COUNT;
        return {
          x: Math.random() * (width + 600) - 300,
          // Bias clouds toward the lower half, like the horizon in the sky.
          y: height * (0.35 + Math.random() * 0.75),
          scale: 0.6 + depth * 1.9 + Math.random() * 0.5,
          speed: 0.06 + depth * 0.22,
          alpha: 0.16 + (1 - depth) * 0.3,
          seed: Math.random() * 1000,
        };
      });
    };

    // Draws one soft cloud as a cluster of blurred circles.
    const drawCloud = (cloud: Cloud) => {
      const r = 46 * cloud.scale;
      ctx.save();
      ctx.globalAlpha = cloud.alpha;
      ctx.filter = `blur(${Math.max(10, 16 * cloud.scale)}px)`;
      ctx.fillStyle = "#ffffff";

      const puffs = [
        [0, 0, r],
        [r * 0.85, r * 0.14, r * 0.78],
        [-r * 0.9, r * 0.18, r * 0.7],
        [r * 0.3, -r * 0.42, r * 0.72],
        [-r * 0.35, -r * 0.3, r * 0.6],
        [r * 1.5, r * 0.3, r * 0.5],
        [-r * 1.55, r * 0.32, r * 0.46],
      ];

      for (const [dx, dy, pr] of puffs) {
        ctx.beginPath();
        ctx.arc(cloud.x + dx, cloud.y + dy, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // Paints the sky gradient then every cloud, far layers first.
    const draw = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#8fb8e8");
      sky.addColorStop(0.42, "#bcd6f0");
      sky.addColorStop(0.72, "#dfe9f4");
      sky.addColorStop(1, "#f2f5f8");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      for (const cloud of clouds) drawCloud(cloud);
    };

    // Drifts clouds sideways, wrapping them around the viewport.
    const step = () => {
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x - 260 * cloud.scale > width) {
          cloud.x = -260 * cloud.scale;
          cloud.y = height * (0.35 + Math.random() * 0.75);
        }
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
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
