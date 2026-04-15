import React from 'react';

interface DownloadButtonProps {
  onDownload: () => void;
  loading: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload, loading }) => {
  return (
    <button
      onClick={onDownload}
      className={`px-4 py-2 rounded-md font-semibold ${loading ? 'bg-green-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors duration-200`}
      disabled={loading}
    >
      {loading ? '다운로드 중...' : 'MP4 다운로드'}
    </button>
  );
};

export default DownloadButton;
