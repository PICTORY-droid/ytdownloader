"use client";
import React, { useState } from "react";

interface DownloadButtonProps {
  onDownload: () => void;
  loading: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  onDownload,
  loading,
}) => {
  const [toast, setToast] = useState(false);

  const handleClick = async () => {
    await onDownload();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="relative w-full">
      {/* 토스트 알림 */}
      {toast && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
            bg-[#1a1a1a] border border-[#00ff88] text-[#00ff88]
            text-xs font-mono px-4 py-1.5 rounded-full shadow-lg
            animate-fade-in-up z-50"
          style={{
            boxShadow: "0 0 16px rgba(0,255,136,0.4)",
          }}
        >
          ✓ // 다운로드 완료!
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 rounded-md font-mono font-bold text-sm transition-all duration-200 relative overflow-hidden
          ${
            loading
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#00ff88] to-[#7c3aed] text-black hover:opacity-90 hover:scale-[1.02]"
          }`}
      >
        {/* 버튼 내부 홀로그램 shimmer */}
        {!loading && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              animation: "shimmer 2.5s infinite",
            }}
          />
        )}
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⟳</span>
            <span>// 다운로드 중...</span>
          </span>
        ) : (
          "▶ MP4 다운로드"
        )}
      </button>
    </div>
  );
};

export default DownloadButton;
