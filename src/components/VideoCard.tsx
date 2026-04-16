import React from 'react';
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
  return (
    <div className="border border-gray-700 rounded-md overflow-hidden bg-[#0d0d0d]">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span>
        <span className="ml-2 text-gray-500 text-xs font-mono">video_info.json</span>
      </div>

      {/* 모바일: 세로 레이아웃 / 데스크탑: 가로 레이아웃 */}
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
  );
};

export default VideoCard;