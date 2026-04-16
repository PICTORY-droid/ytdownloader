"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";

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
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  thumbnail,
  duration,
  uploader,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * 10, y: -dx * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
      }}
      className="relative border border-gray-700 rounded-md overflow-hidden bg-[#0d0d0d] group"
    >
      {/* 홀로그램 빛 오버레이 */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 rounded-md"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(124,58,237,0.18) 0%,
              rgba(0,207,255,0.13) 40%,
              rgba(0,255,136,0.13) 70%,
              rgba(124,58,237,0.10) 100%
            )`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* 테두리 글로우 */}
      {hovered && (
        <div
          className="absolute -inset-[1px] rounded-md pointer-events-none z-0"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed, #00cfff, #00ff88, #7c3aed)",
            opacity: 0.6,
            filter: "blur(2px)",
          }}
        />
      )}

      <div className="relative z-[1] bg-[#0d0d0d] rounded-md overflow-hidden">
        {/* 모바일: 세로 / 데스크탑: 가로 */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* 썸네일 */}
          <div className="relative w-full sm:w-40 aspect-video sm:h-24 sm:aspect-auto flex-shrink-0 rounded overflow-hidden border border-gray-700">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
            />
          </div>

          {/* 정보 */}
          <div className="flex flex-col gap-1.5 sm:gap-2 justify-center min-w-0">
            <p className="text-xs text-yellow-400 font-mono">// title</p>
            <p className="text-white text-sm font-mono leading-snug line-clamp-2 break-words">
              {title}
            </p>
            <p className="text-xs font-mono truncate">
              <span className="text-purple-400">uploader</span>
              <span className="text-gray-500"> = </span>
              <span className="text-[#00cfff] break-all">"{uploader}"</span>
            </p>
            <p className="text-xs font-mono">
              <span className="text-purple-400">duration</span>
              <span className="text-gray-500"> = </span>
              <span className="text-[#00cfff]">"{formatDuration(duration)}"</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
