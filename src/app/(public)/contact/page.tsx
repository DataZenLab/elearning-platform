import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

/**
 * Trang Liên Hệ: Hiển thị thông tin liên hệ và form gửi tin nhắn hỗ trợ.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
            <span className="w-6 h-px bg-primary" />
            Liên hệ
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Kết nối với chúng tôi
          </h1>
          <p className="text-lg text-muted-foreground">
            Bạn có câu hỏi hoặc cần hỗ trợ? Hãy để lại lời nhắn, đội ngũ {APP_NAME} sẽ phản hồi bạn sớm nhất có thể.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Địa chỉ</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  123 Đường Công Nghệ, Phường Đổi Mới, Quận Sáng Tạo, TP. Hồ Chí Minh
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Điện thoại</h3>
                <p className="text-sm text-muted-foreground">1900 xxxx</p>
                <p className="text-sm text-muted-foreground mt-1">(Miễn phí cước gọi)</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">contact@eduflow.vn</p>
                <p className="text-sm text-muted-foreground mt-1">support@eduflow.vn</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Giờ làm việc</h3>
                <p className="text-sm text-muted-foreground">Thứ 2 - Thứ 6: 08:00 - 18:00</p>
                <p className="text-sm text-muted-foreground mt-1">Thứ 7: 08:00 - 12:00</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-8 md:p-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">Gửi tin nhắn cho chúng tôi</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Họ và tên</label>
                  <input 
                    type="text" 
                    className="w-full h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Nguyễn Văn A" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="nguyenvana@example.com" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Chủ đề</label>
                <input 
                  type="text" 
                  className="w-full h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="Tôi cần hỗ trợ về khóa học..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nội dung tin nhắn</label>
                <textarea 
                  className="w-full min-h-[160px] rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                ></textarea>
              </div>

              <Button type="button" className="w-full h-11 rounded-lg font-semibold text-base gap-2">
                <Send className="w-4 h-4" />
                Gửi tin nhắn
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
