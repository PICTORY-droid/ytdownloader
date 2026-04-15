import React from 'react';

interface DownloadButtonProps {
  onDownload: () => void;
  loading: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload, loading }) => {
  return (
    <button
      onClick={onDownload}
      disabled={loading}
      className={`w-full py-3 rounded-md font-mono font-bold text-sm transition-all duration-200
        ${loading
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#00ff88] to-[#7c3aed] text-black hover:opacity-90 hover:scale-[1.02]'
        }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⟳</span>
          <span>// 다운로드 중...</span>
        </span>
      ) : (
        '▶ MP4 다운로드'
      )}
    </button>
  );
};

export default DownloadButton;
