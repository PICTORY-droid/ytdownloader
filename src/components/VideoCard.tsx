"use client";
import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface VideoCardProps {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ title, thumbnail, duration, uploader }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    const tiltX = (cy - 0.5) * -18;
    const tiltY = (cx - 0.5) * 18;
    setTilt({ x: tiltX, y: tiltY });
    setGlowPos({ x: cx * 100, y: cy * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.03)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        position: 'relative',
      }}
      className="rounded-md overflow-hidden"
    >
      {/* 홀로그램 글로우 오버레이 */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(124,58,237,0.25) 0%, rgba(0,191,255,0.15) 40%, rgba(0,255,136,0.08) 70%, transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 10,
            borderRadius: '6px',
          }}
        />
      )}

      {/* 외곽 홀로그램 테두리 */}
      <div
        className="border rounded-md overflow-hidden bg-[#0d0d0d]"
        style={{
          borderColor: hovered ? '#7c3aed' : '#374151',
          boxShadow: hovered
            ? '0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(0,191,255,0.2), inset 0 0 20px rgba(0,255,136,0.05)'
            : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* 상단 바 */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span>
          <span className="ml-2 text-gray-500 text-xs font-mono">video_info.json</span>
        </div>

        {/* 레이아웃 */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* 썸네일 */}
          <div className="relative w-full sm:w-40 aspect-video sm:h-24 sm:aspect-auto flex-shrink-0 rounded overflow-hidden border border-gray-700">
            <Image src={thumbnail} alt={title} fill className="object-cover" />
          </div>

          {/* 정보 */}
          <div className="flex flex-col gap-1.5 sm:gap-2 justify-center min-w-0">
            <p className="text-xs text-yellow-400 font-mono">// title</p>
            <p className="text-white text-sm font-mono leading-snug line-clamp-2 break-words">{title}</p>
            <p className="text-xs font-mono truncate">
              <span className="text-purple-400">uploader</span>
              <span className="text-gray-500"> = </span>
              <span className="text-[#00ff88] break-all">"{uploader}"</span>
            </p>
            <p className="text-xs font-mono">
              <span className="text-purple-400">duration</span>
              <span className="text-gray-500"> = </span>
              <span className="text-[#00ff88]">"{formatDuration(duration)}"</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
