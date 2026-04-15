import React from 'react';
import Image from 'next/image';

interface VideoCardProps {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ title, thumbnail, duration, uploader }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
      <Image src={thumbnail} alt={title} width={480} height={270} className="rounded-md" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400">업로더: {uploader}</p>
      <p className="text-gray-400">재생 시간: {formatDuration(duration)}</p>
    </div>
  );
};

export default VideoCard;
