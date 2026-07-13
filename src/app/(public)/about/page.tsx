import { GraduationCap, Users, Target, Award } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const stats = [
  { value: '500+', label: 'Khóa học' },
  { value: '50K+', label: 'Học viên' },
  { value: '100+', label: 'Giảng viên' },
  { value: '4.8', label: 'Đánh giá' },
];

const values = [
  {
    icon: Target,
    title: 'Chất lượng hàng đầu',
    description: 'Nội dung bài giảng được thiết kế tỉ mỉ, cập nhật liên tục theo xu hướng công nghệ mới nhất.',
  },
  {
    icon: Users,
    title: 'Cộng đồng sôi động',
    description: 'Học hỏi không chỉ từ giảng viên mà còn từ hàng ngàn học viên khác trong cộng đồng.',
  },
  {
    icon: Award,
    title: 'Thực tiễn & Áp dụng',
    description: 'Mọi khóa học đều đi kèm dự án thực tế giúp bạn có thể tự tin áp dụng vào công việc ngay.',
  },
];

/**
 * Trang Giới Thiệu: Thông tin chi tiết về nền tảng E-Learning và đội ngũ.
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
            <span className="w-6 h-px bg-primary" />
            Về chúng tôi
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Sứ mệnh của {APP_NAME}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Chúng tôi tin rằng giáo dục là chìa khóa để mở khóa tiềm năng của mỗi người.
            {APP_NAME} được tạo ra với sứ mệnh mang lại nền giáo dục chất lượng cao,
            dễ tiếp cận cho tất cả mọi người tại Việt Nam.
          </p>
        </div>

        {/* Stats — no cards, just clean numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-20 pb-20 border-b border-border">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-foreground tabular-nums">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-10">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
