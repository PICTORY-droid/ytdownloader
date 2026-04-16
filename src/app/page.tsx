"use client";
import React, { useState, useEffect, useRef } from "react";
import VideoForm from "@/components/VideoForm";
import VideoCard from "@/components/VideoCard";
import DownloadButton from "@/components/DownloadButton";
import CursorTrail from "@/components/CursorTrail";
import NeuralNetwork from "@/components/NeuralNetwork";
import { getVideoInfo, downloadVideo } from "@/lib/api";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

/* ── 타이핑 루프 훅 ── */
const useTypingLoop = (
  text: string,
  typingSpeed = 60,
  pauseTime = 5000
) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let typing: ReturnType<typeof setInterval>;
    let pause: ReturnType<typeof setTimeout>;

    const startTyping = () => {
      i = 0;
      setDisplayed("");
      setDone(false);
      typing = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(typing);
          pause = setTimeout(() => startTyping(), pauseTime);
        }
      }, typingSpeed);
    };

    startTyping();
    return () => {
      clearInterval(typing);
      clearTimeout(pause);
    };
  }, [text, typingSpeed, pauseTime]);

  return { displayed, done };
};

/* ── 매트릭스 레인 ── */
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*<>[]{}";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const brightDrops = Array(columns)
      .fill(false)
      .map(() => Math.random() < 0.15);
    const brightTimer: number[] = Array(columns).fill(0);

    const draw = () => {
      ctx.fillStyle = "rgba(13,13,13,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (brightDrops[i]) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ffffff";
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${fontSize}px monospace`;
          brightTimer[i]++;
          if (brightTimer[i] > 10) {
            brightDrops[i] = false;
            brightTimer[i] = 0;
          }
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00ff88";
          ctx.fillStyle = "#00ff88";
          ctx.font = `${fontSize}px monospace`;
          if (Math.random() < 0.02) brightDrops[i] = true;
        }

        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0"
    />
  );
};

/* ── 스크롤 등장 래퍼 ── */
const FadeInUp = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {children}
    </div>
  );
};

/* ── 메인 페이지 ── */
export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingMsg, setWaitingMsg] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  const { displayed: typedDesc, done: descDone } = useTypingLoop(
    "유튜브 링크를 입력하고 다운로드 하세요",
    60,
    5000
  );

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setWaitingMsg(null);
    setCurrentUrl(url);
    try {
      const data = await getVideoInfo(url, (seconds) => {
        setWaitingMsg(`// 서버 시작 중... ${seconds}초 경과 (최대 60초 소요)`);
      });
      setWaitingMsg(null);
      setVideoInfo(data);
    } catch {
      setWaitingMsg(null);
      setError("// Error: 영상 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const downloadUrl = await downloadVideo(currentUrl);
      window.open(downloadUrl, "_blank");
    } catch {
      setError("// Error: 다운로드에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 py-8 sm:p-8 gap-6 relative overflow-hidden">
      {/* 레이어 0 – 매트릭스 레인 */}
      <MatrixRain />

      {/* 레이어 1 – 신경망 연결선 */}
      <NeuralNetwork />

      {/* 레이어 50 – 커서 트레일 */}
      <CursorTrail />

      {/* 콘텐츠 */}
      <div className="w-full max-w-xl relative z-10">

        {/* 타이틀 바 */}
        <FadeInUp delay={0}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
            <span className="ml-2 text-gray-500 text-xs sm:text-sm font-mono truncate">
              {typedDesc}
              {!descDone && <span className="animate-pulse">|</span>}
              {descDone && (
                <span className="animate-pulse text-gray-500">|</span>
              )}
            </span>
          </div>
        </FadeInUp>

        {/* 메인 카드 */}
        <FadeInUp delay={100}>
          <div className="border border-gray-700 rounded-lg p-4 sm:p-6 bg-[#111111]/90 backdrop-blur-sm">
            <p className="text-gray-500 text-xs sm:text-sm mb-4 font-mono">
              // YouTube Video Downloader v1.0.0
            </p>

            {/* 로고 */}
            <FadeInUp delay={200}>
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="relative group w-full max-w-xs sm:max-w-sm">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed] via-[#00ff88] to-[#7c3aed] rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
                  <div className="relative flex items-center justify-center bg-[#0d0d0d] rounded-lg px-4 sm:px-6 py-3 border border-gray-700">
                    <span className="text-[#7c3aed] text-2xl sm:text-3xl font-bold font-mono leading-none">
                      ▌
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold font-mono px-2 text-center">
                      <span className="text-white">YouTube </span>
                      <span className="bg-gradient-to-r from-[#7c3aed] to-[#00ff88] bg-clip-text text-transparent">
                        Downloader
                      </span>
                    </h1>
                    <span className="text-[#00ff88] text-2xl sm:text-3xl font-bold font-mono leading-none">
                      ▐
                    </span>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* 폼 */}
            <FadeInUp delay={300}>
              <VideoForm onUrlSubmit={handleUrlSubmit} loading={loading} />
            </FadeInUp>

            {/* 대기 메시지 */}
            {waitingMsg && (
              <div className="mt-3 flex items-center gap-2">
                <span className="animate-spin text-[#00ff88] flex-shrink-0">
                  ⟳
                </span>
                <p className="text-[#00ff88] text-xs sm:text-sm font-mono">
                  {waitingMsg}
                </p>
              </div>
            )}

            {/* 에러 */}
            {error && (
              <p className="text-red-400 text-xs sm:text-sm mt-3 font-mono break-words">
                {error}
              </p>
            )}

            {/* 비디오 정보 + 다운로드 */}
            {videoInfo && (
              <div className="mt-6 flex flex-col gap-4">
                <FadeInUp delay={0}>
                  <VideoCard {...videoInfo} />
                </FadeInUp>
                <FadeInUp delay={100}>
                  <DownloadButton
                    onDownload={handleDownload}
                    loading={downloading}
                  />
                </FadeInUp>
              </div>
            )}
          </div>
        </FadeInUp>

        {/* 하단 크레딧 */}
        <FadeInUp delay={400}>
          <div className="flex flex-col items-center gap-1 mt-3">
            <p className="text-gray-700 text-xs font-mono whitespace-nowrap">
              // yt-dlp · Next.js + FastAPI
            </p>
            <p className="text-gray-600 text-xs font-mono whitespace-nowrap">
              // developed by{" "}
              <span className="text-[#7c3aed]">@PICTORY-DROID</span>
            </p>
          </div>
        </FadeInUp>

      </div>
    </main>
  );
}
