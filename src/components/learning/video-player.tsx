'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  /** Vị trí (giây) cần resume — đọc từ localStorage bởi component cha */
  savedTime?: number;
  /** Callback để cha lưu vị trí vào localStorage */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

const ANTI_SKIP_BUFFER = 1.5;
const COMPLETION_THRESHOLD = 0.95;
const SAVE_INTERVAL_MS = 1_000;

/**
 * Seek video đến vị trí target nếu hợp lệ.
 * Trả về true nếu đã seek, false nếu không cần.
 */
function seekTo(video: HTMLVideoElement, targetTime: number): boolean {
  if (targetTime <= 0) return false;
  if (video.readyState < 1) return false; // metadata chưa load
  const clampedTime = Math.min(targetTime, video.duration - 0.5);
  if (clampedTime <= 0) return false;
  video.currentTime = clampedTime;
  return true;
}

export function VideoPlayer({ videoUrl, savedTime = 0, onTimeUpdate, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [hasError, setHasError] = useState(false);
  const hasTriggeredComplete = useRef(false);
  const lastSaveAt = useRef(0);
  // Lưu savedTime mới nhất để handleLoadedMetadata luôn dùng giá trị hiện hành
  const savedTimeRef = useRef(savedTime);

  // Đồng bộ ref với prop mỗi khi savedTime thay đổi
  useEffect(() => {
    savedTimeRef.current = savedTime;
  }, [savedTime]);

  // Reset khi video URL đổi
  useEffect(() => {
    setMaxTimeWatched(0);
    setHasError(false);
    hasTriggeredComplete.current = false;
    lastSaveAt.current = 0;
    savedTimeRef.current = savedTime;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl]);

  /**
   * FIX RACE CONDITION:
   * Nếu savedTime thay đổi từ 0 → có giá trị (user load xong sau metadata),
   * và video đã sẵn sàng (readyState >= 1), thì seek ngay lập tức.
   */
  useEffect(() => {
    if (savedTime <= 0) return;
    const video = videoRef.current;
    if (!video) return;
    // Chỉ seek nếu video đang ở gần đầu (tức là chưa resume trước đó)
    if (video.currentTime < savedTime * 0.5) {
      const didSeek = seekTo(video, savedTime);
      if (didSeek) {
        setMaxTimeWatched(savedTime);
      }
    }
  }, [savedTime]);

  /**
   * Khi metadata load xong → thử seek đến savedTimeRef.current.
   * Dùng ref để luôn đọc giá trị mới nhất của savedTime dù closure cũ.
   */
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const resumeTo = savedTimeRef.current;
    const didSeek = seekTo(video, resumeTo);
    if (didSeek) {
      setMaxTimeWatched(resumeTo);
    }
  }, []);

  /** Lưu ngay lập tức, không throttle */
  const saveNow = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate || video.currentTime <= 0) return;
    onTimeUpdate(video.currentTime, video.duration || 0);
  }, [onTimeUpdate]);

  /** Lắng nghe sự kiện rời trang để lưu progress kịp thời */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveNow();
    };
    const handleUnload = () => saveNow();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      // Lưu lần cuối khi unmount (navigate sang bài khác)
      saveNow();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [saveNow]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    const currentTime = video.currentTime;
    const duration = video.duration;

    // Anti-skip
    if (currentTime > maxTimeWatched + ANTI_SKIP_BUFFER) {
      video.currentTime = maxTimeWatched;
      return;
    }

    setMaxTimeWatched(prev => Math.max(prev, currentTime));

    // Throttled save
    const now = Date.now();
    if (onTimeUpdate && now - lastSaveAt.current >= SAVE_INTERVAL_MS) {
      lastSaveAt.current = now;
      onTimeUpdate(currentTime, duration);
    }

    // Kiểm tra hoàn thành
    if (duration > 0 && !hasTriggeredComplete.current) {
      if (currentTime / duration >= COMPLETION_THRESHOLD) {
        hasTriggeredComplete.current = true;
        onComplete?.();
      }
    }
  }, [hasError, maxTimeWatched, onTimeUpdate, onComplete]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasError) return;
    if (video.currentTime > maxTimeWatched + ANTI_SKIP_BUFFER) {
      video.currentTime = maxTimeWatched;
    }
  }, [hasError, maxTimeWatched]);

  /** Lưu ngay khi người dùng tạm dừng */
  const handlePause = useCallback(() => {
    saveNow();
  }, [saveNow]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (onTimeUpdate && video) {
      onTimeUpdate(video.currentTime, video.duration);
    }
    if (!hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      onComplete?.();
    }
  }, [onTimeUpdate, onComplete]);

  const handleError = useCallback(() => setHasError(true), []);

  if (!videoUrl) return null;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm bg-black w-full aspect-video rounded-xl relative group flex items-center justify-center">
      {hasError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-destructive">
          <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
          <p className="font-medium text-lg">Không thể tải video</p>
          <p className="text-sm mt-2 max-w-md opacity-80">
            Vui lòng kiểm tra lại đường dẫn video trong hệ thống. <br />
            (Lưu ý: Bạn phải dùng link file gốc .mp4 từ Firebase/Cloudinary, không dùng link YouTube)
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          playsInline
        >
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      )}
    </Card>
  );
}
