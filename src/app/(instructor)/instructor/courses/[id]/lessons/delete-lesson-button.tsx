'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteLessonAction } from '@/actions/lesson.actions';

export function DeleteLessonButton({ documentId, courseId, title }: { documentId: string; courseId: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa bài học "${title}"?`)) return;
    
    setIsDeleting(true);
    const result = await deleteLessonAction(documentId, courseId);
    
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
      title="Xóa bài học"
    >
      {isDeleting ? '...' : 'Xóa'}
    </Button>
  );
}
