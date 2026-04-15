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
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
        <span className="ml-2 text-gray-500 text-xs font-mono">video_info.json</span>
      </div>
      <div className="p-4 flex gap-4">
        <div className="relative w-40 h-24 flex-shrink-0 rounded overflow-hidden border border-gray-700">
          <Image src={thumbnail} alt={title} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <p className="text-xs text-yellow-400 font-mono">// title</p>
          <p className="text-white text-sm font-mono leading-snug line-clamp-2">{title}</p>
          <p className="text-xs font-mono">
            <span className="text-purple-400">uploader</span>
            <span className="text-gray-500"> = </span>
            <span className="text-[#00ff88]">"{uploader}"</span>
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
