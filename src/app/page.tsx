import React, { useState, useEffect } from 'react';
import axios from 'axios';

import VideoForm from '@/components/VideoForm';
import VideoCard from '@/components/VideoCard';
import DownloadButton from '@/components/DownloadButton';

import { getVideoInfo, downloadVideo } from '@/lib/api';

interface VideoData {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  id: string;
}

export default function HomePage() {
  const [videoInfo, setVideoInfo] = useState<VideoData | null>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const handleGetVideoInfo = async (url: string) => {
    setLoadingInfo(true);
    setError(null);
    setVideoInfo(null);
    setCurrentUrl(url);
    try {
      const data = await getVideoInfo(url);
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!videoInfo || !currentUrl) return;

    setLoadingDownload(true);
    setError(null);
    try {
      const blob = await downloadVideo(currentUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Sanitize title for filename, replacing potentially problematic characters
      const safeTitle = videoInfo.title.replace(/[^a-zA-Z0-9_\s-]/g, '').replace(/\s+/g, '_');
      a.download = `${safeTitle}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <h1 className="text-5xl font-bold mb-12 text-center drop-shadow-lg">YouTube Video Downloader</h1>
      
      <VideoForm onUrlSubmit={handleGetVideoInfo} loading={loadingInfo || loadingDownload} />

      {loadingInfo && <p className="mt-8 text-lg">영상 정보를 불러오는 중...</p>}
      {error && (
        <div className="mt-8 p-4 bg-red-500 bg-opacity-80 rounded-lg shadow-lg max-w-md w-full text-center">
          <p className="font-semibold">오류 발생:</p>
          <p>{error}</p>
        </div>
      )}

      {videoInfo && (
        <div className="mt-12 flex flex-col items-center gap-8">
          <VideoCard
            title={videoInfo.title}
            thumbnail={videoInfo.thumbnail}
            duration={videoInfo.duration}
            uploader={videoInfo.uploader}
          />
          <DownloadButton onDownload={handleDownloadVideo} loading={loadingDownload} />
        </div>
      )}
    </main>
  );
}
