import React, { useState } from 'react';

interface VideoFormProps {
  onUrlSubmit: (url: string) => void;
  loading: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({ onUrlSubmit, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL을 입력하세요"
        className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        disabled={loading}
      />
      <button
        type="submit"
        className={`px-4 py-2 rounded-md font-semibold ${loading ? 'bg-blue-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
        disabled={loading}
      >
        {loading ? '로딩 중...' : '정보 확인'}
      </button>
    </form>
  );
};

export default VideoForm;
