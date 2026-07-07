'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  youtubeVideoId: string;
  onEnded?: () => void;
}

export function VideoPlayer({ youtubeVideoId, onEnded }: VideoPlayerProps) {
  // In a real app, you might want to use the YouTube IFrame Player API
  // to track progress (e.g. via an npm package like react-youtube)
  // For now, we use a standard embed iframe as requested.
  
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm bg-black w-full aspect-video rounded-xl">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </Card>
  );
}
