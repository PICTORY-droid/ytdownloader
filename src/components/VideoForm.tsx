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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center bg-[#1a1a1a] border border-gray-700 rounded-md focus-within:border-[#00ff88] transition-colors duration-200">
        <span className="text-[#00ff88] px-3 text-lg">🔗</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube URL을 입력하세요"
          className="flex-1 p-3 bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none font-mono text-sm"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-md font-mono font-bold text-sm transition-all duration-200
          ${loading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#7c3aed] to-[#00ff88] text-black hover:opacity-90 hover:scale-[1.02]'
          }`}
      >
        {loading ? '로딩 중...' : '▶ 링크 확인'}
      </button>
    </form>
  );
};

export default VideoForm;
