'use client';

import { useCallback } from 'react';

const STORAGE_PREFIX = 'video_progress';

/**
 * Chỉ xóa checkpoint khi đã xem >= 95% video.
 * Dùng tỉ lệ thay vì giây cố định để tránh bug với video ngắn.
 */
const NEAR_END_RATIO = 0.95;

function buildKey(userId: string, lessonId: string): string {
  return `${STORAGE_PREFIX}_${userId}_${lessonId}`;
}

export function useVideoProgress(userId: string | undefined, lessonId: string) {
  /**
   * Lấy vị trí đã xem (giây). Trả về 0 nếu chưa có hoặc không hợp lệ.
   */
  const getSavedTime = useCallback((): number => {
    if (!userId || typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(buildKey(userId, lessonId));
      const time = raw ? parseFloat(raw) : 0;
      return isFinite(time) && time > 0 ? time : 0;
    } catch {
      return 0;
    }
  }, [userId, lessonId]);

  /**
   * Lưu vị trí hiện tại vào localStorage.
   * Xóa checkpoint chỉ khi đã xem >= 95% — tránh xóa sớm với video ngắn.
   * Nếu duration = 0 (chưa biết) thì vẫn lưu bình thường.
   */
  const saveTime = useCallback(
    (currentTime: number, duration: number) => {
      if (!userId || typeof window === 'undefined') return;
      if (currentTime <= 0) return; // chưa xem gì, không lưu
      try {
        const key = buildKey(userId, lessonId);
        const isNearEnd = duration > 0 && currentTime / duration >= NEAR_END_RATIO;
        if (isNearEnd) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, String(currentTime));
        }
      } catch {
        // ignore (e.g. private browsing quota)
      }
    },
    [userId, lessonId]
  );

  /**
   * Xóa checkpoint khi bài học được đánh dấu hoàn thành.
   */
  const clearSavedTime = useCallback(() => {
    if (!userId || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(buildKey(userId, lessonId));
    } catch {}
  }, [userId, lessonId]);

  return { getSavedTime, saveTime, clearSavedTime };
}
