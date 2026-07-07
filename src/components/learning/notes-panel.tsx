'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookmarkPlus, MoreVertical, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  timestamp: string; // e.g. "12:45"
  createdAt: string;
}

interface NotesPanelProps {
  lessonId: string;
}

export function NotesPanel({ lessonId }: NotesPanelProps) {
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Nhớ kỹ phần state management trong React, rất quan trọng cho bài sau.',
      timestamp: '05:23',
      createdAt: '10 phút trước'
    }
  ]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: noteContent,
      timestamp: '12:00', // In a real app, get current player time
      createdAt: 'Vừa xong'
    };

    setNotes([newNote, ...notes]);
    setNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 bg-card rounded-t-xl">
        <h3 className="font-semibold flex items-center gap-2">
          <BookmarkPlus className="w-5 h-5 text-primary" />
          Ghi chú bài học
        </h3>
      </div>

      {/* Note Input */}
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <form onSubmit={handleAddNote}>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            placeholder="Tạo ghi chú mới tại thời điểm hiện tại..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" size="sm" className="rounded-xl gradient-primary border-0 text-white shadow-sm" disabled={!noteContent.trim()}>
              Lưu ghi chú
            </Button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Chưa có ghi chú nào cho bài học này.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm relative group">
              <div className="flex items-start justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {note.timestamp}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-foreground">{note.content}</p>
              <p className="text-xs text-muted-foreground mt-3">{note.createdAt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
