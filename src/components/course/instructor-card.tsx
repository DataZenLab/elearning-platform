import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Users, PlayCircle, ExternalLink } from "lucide-react";

interface InstructorCardProps {
  instructor: {
    id: number;
    name: string;
    avatar?: string | null;
    title?: string;
    bio?: string;
    stats: {
      rating: number;
      reviews: number;
      students: number;
      courses: number;
    }
  }
}

/**
 * Thẻ hiển thị thông tin sơ lược về giảng viên của khóa học.
 */
export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Giảng viên của bạn</h2>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 bg-muted/20 p-6 md:p-8 rounded-xl border border-border">
        <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
          <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
            {instructor.avatar ? (
              <AvatarImage src={instructor.avatar} alt={instructor.name} className="object-cover" />
            ) : (
              <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                {instructor.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          
          {/* Stats below avatar on desktop */}
          <div className="hidden md:flex flex-col gap-2 w-full mt-2">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="font-semibold">{instructor.stats.rating} Đánh giá</span>
              <span className="text-muted-foreground">({instructor.stats.reviews})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold">{instructor.stats.students.toLocaleString()}</span>
              <span className="text-muted-foreground">Học viên</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <PlayCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold">{instructor.stats.courses}</span>
              <span className="text-muted-foreground">Khóa học</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2">
            {instructor.name}
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50" />
          </h3>
          <p className="text-muted-foreground font-medium mt-1 mb-4">
            {instructor.title || 'Senior Software Engineer'}
          </p>
          
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p>
              {instructor.bio || `Với hơn 10 năm kinh nghiệm trong ngành phần mềm, ${instructor.name} đã làm việc tại nhiều tập đoàn công nghệ lớn. Phương pháp giảng dạy tập trung vào thực hành và giải quyết các bài toán thực tế giúp học viên nhanh chóng áp dụng kiến thức vào công việc.`}
            </p>
            <p className="mt-2">
              Ngoài công việc giảng dạy, tôi còn là một open source contributor và thường xuyên viết blog chia sẻ kiến thức công nghệ.
            </p>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">System Design</Badge>
          </div>
        </div>
        
        {/* Stats on mobile */}
        <div className="flex justify-around md:hidden pt-6 border-t border-border w-full">
          <div className="text-center">
            <div className="font-bold text-lg">{instructor.stats.rating}</div>
            <div className="text-xs text-muted-foreground">Đánh giá</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{(instructor.stats.students / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Học viên</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{instructor.stats.courses}</div>
            <div className="text-xs text-muted-foreground">Khóa học</div>
          </div>
        </div>
      </div>
    </div>
  );
}
