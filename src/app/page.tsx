"use client";
import React, { useState } from 'react';
import axios from 'axios';
import VideoForm from '@/components/VideoForm';
import VideoCard from '@/components/VideoCard';
import DownloadButton from '@/components/DownloadButton';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setCurrentUrl(url);
    try {
      const res = await axios.post('/api/info', { url });
      setVideoInfo(res.data);
    } catch {
      setError('영상 정보를 불러올 수 없습니다. URL을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await axios.post('/api/download', { url: currentUrl }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${videoInfo?.title || 'video'}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-3xl font-bold">YouTube 다운로더</h1>
      <VideoForm onUrlSubmit={handleUrlSubmit} loading={loading} />
      {error && <p className="text-red-400">{error}</p>}
      {videoInfo && (
        <>
          <VideoCard {...videoInfo} />
          <DownloadButton onDownload={handleDownload} loading={downloading} />
        </>
      )}
    </main>
  );
}
