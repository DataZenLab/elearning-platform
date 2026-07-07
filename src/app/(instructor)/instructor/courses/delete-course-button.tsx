'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCourseAction } from '@/actions/course.actions';

export function DeleteCourseButton({ documentId, title }: { documentId: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${title}"?`)) return;
    
    setIsDeleting(true);
    const result = await deleteCourseAction(documentId);
    
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
      title="Xóa khóa học"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
