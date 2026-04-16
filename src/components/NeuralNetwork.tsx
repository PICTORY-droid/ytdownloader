"use client";
import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const NeuralNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const nodes = useRef<Node[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      nodes.current = Array.from({ length: Math.min(count, 60) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const node of nodes.current) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      const MAX_DIST = 160;
      const MOUSE_DIST = 200;

      for (let i = 0; i < nodes.current.length; i++) {
        for (let j = i + 1; j < nodes.current.length; j++) {
          const a = nodes.current[i];
          const b = nodes.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.4;

            const dxA = a.x - mouse.current.x;
            const dyA = a.y - mouse.current.y;
            const dxB = b.x - mouse.current.x;
            const dyB = b.y - mouse.current.y;
            const mouseDistA = Math.sqrt(dxA * dxA + dyA * dyA);
            const mouseDistB = Math.sqrt(dxB * dxB + dyB * dyB);
            const nearMouse = mouseDistA < MOUSE_DIST || mouseDistB < MOUSE_DIST;

            ctx.save();
            ctx.globalAlpha = nearMouse ? Math.min(alpha * 2.5, 1) : alpha;
            if (nearMouse) {
              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, '#7c3aed');
              grad.addColorStop(1, '#00bfff');
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.5;
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#7c3aed';
            } else {
              ctx.strokeStyle = '#00ff8840';
              ctx.lineWidth = 0.8;
              ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      for (const node of nodes.current) {
        const dx = node.x - mouse.current.x;
        const dy = node.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nearMouse = dist < MOUSE_DIST;

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (nearMouse) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';
          ctx.fillStyle = '#a855f7';
        } else {
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#00ff88';
          ctx.fillStyle = '#00ff8880';
        }
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[5]"
    />
  );
};

export default NeuralNetwork;
