'use client';

import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { storageService } from '@/services/firebase/storage.service';

interface AvatarUploadProps {
  currentUrl?: string | null;
  userId: string;
  userName: string;
  onUploadSuccess: (url: string) => void;
}

export function AvatarUpload({ currentUrl, userId, userName, onUploadSuccess }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh không được vượt quá 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Firebase Storage
      const path = `avatars/${userId}-${Date.now()}`;
      const url = await storageService.uploadFile(file, path);
      onUploadSuccess(url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          <AvatarImage src={currentUrl || undefined} alt={userName} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="w-4 h-4 mr-2" />
          Thay đổi ảnh đại diện
        </Button>
        <p className="text-xs text-muted-foreground">
          Định dạng JPG, PNG, WEBP. Dung lượng tối đa 5MB.
        </p>
      </div>
    </div>
  );
}
