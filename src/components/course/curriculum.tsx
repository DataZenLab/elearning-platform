import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LessonItem {
  id: number;
  title: string;
  slug: string;
  duration: number;
  order: number;
  isFree: boolean;
  chapter?: string;
}

interface CurriculumProps {
  lessons?: LessonItem[];
}

// Group lessons by chapter
function groupByChapter(lessons: LessonItem[]) {
  const groups: Record<string, LessonItem[]> = {};
  lessons.forEach((lesson) => {
    const chapter = lesson.chapter || 'Nội dung khóa học';
    if (!groups[chapter]) groups[chapter] = [];
    groups[chapter].push(lesson);
  });
  return Object.entries(groups).map(([title, lessons]) => ({ title, lessons }));
}

/**
 * Danh sách nội dung chương trình học (các chương và bài giảng).
 */
export function Curriculum({ lessons = [] }: CurriculumProps) {
  const chapters = groupByChapter(lessons);

  if (!lessons || lessons.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Nội dung khóa học</h2>
        <div className="text-muted-foreground p-6 border rounded-xl bg-muted/20 text-center">
          Nội dung khóa học đang được cập nhật.
        </div>
      </div>
    );
  }

  const totalLessons = chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
  const totalDuration = chapters.reduce(
    (acc, chap) => acc + chap.lessons.reduce((sum, l) => sum + (l.duration || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Nội dung khóa học</h2>
        <div className="text-sm text-muted-foreground flex gap-3">
          <span>{chapters.length} chương</span>
          <span>•</span>
          <span>{totalLessons} bài học</span>
          <span>•</span>
          <span>{formatDuration(totalDuration)} tổng thời lượng</span>
        </div>
      </div>

      <Accordion multiple className="w-full space-y-4">
        {chapters.map((chapter, idx) => {
          const chapterDuration = chapter.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
          return (
            <AccordionItem
              key={idx}
              value={`chapter-${idx}`}
              className="bg-card border rounded-xl overflow-hidden shadow-sm px-2"
            >
              <AccordionTrigger className="hover:no-underline py-4 px-4">
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 text-left mr-4">
                  <span className="font-semibold text-lg">{chapter.title}</span>
                  <span className="text-sm text-muted-foreground font-normal whitespace-nowrap">
                    {chapter.lessons.length} bài học • {formatDuration(chapterDuration)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-2 px-4">
                <ul className="space-y-1">
                  {chapter.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isFree ? (
                          <PlayCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`text-sm ${lesson.isFree ? 'text-primary font-medium cursor-pointer hover:underline underline-offset-2' : 'text-foreground'}`}>
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {lesson.isFree && (
                          <Badge className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0">
                            Học thử
                          </Badge>
                        )}
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {Math.floor(lesson.duration)}p
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
