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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center bg-[#1a1a1a] border border-gray-700 rounded-md focus-within:border-[#7c3aed] transition-colors duration-300">
        <span className="text-[#7c3aed] px-3 text-lg">🔗</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube URL을 입력하세요"
          className="flex-1 p-3 sm:p-4 bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none font-mono text-sm"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 sm:py-4 rounded-md font-mono font-bold text-sm transition-all duration-300 relative overflow-hidden
          ${loading
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            : 'border border-[#7c3aed] text-[#a78bfa] hover:bg-[#7c3aed]/20 hover:text-white hover:border-[#a78bfa] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
          }`}
      >
        {loading ? '// 로딩 중...' : '▶ 링크 확인'}
      </button>
    </form>
  );
};

export default VideoForm;
