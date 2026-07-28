'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Users, BookOpen, Loader2, CheckCircle } from 'lucide-react';
import { firestoreService } from '@/services/firebase/firestore.service';
import { strapi } from '@/lib/strapi';

function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) {
    alert('Không có dữ liệu để xuất.');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Trang Báo Cáo (Admin): Xem các báo cáo doanh thu, lượt truy cập chi tiết của nền tảng.
 */
export default function AdminReportsPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = (key: string) => {
    setSuccess(key);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleExportRevenue = async () => {
    setExporting('revenue');
    try {
      // Fetch enrollments using collection group
      const enrollments = await firestoreService.getCollectionGroupDocuments<any>('enrollments');
      
      // Fetch courses from Strapi to map courseId to title and price
      const coursesRes = await strapi.findMany<any>('courses', { 
        pagination: { pageSize: 1000 }, 
        fields: ['slug', 'documentId', 'price', 'title'],
        publicationState: 'preview' 
      }, { token: process.env.NEXT_PUBLIC_STRAPI_TOKEN });
      
      const courseMap = new Map();
      if (coursesRes.data) {
        coursesRes.data.forEach((c: any) => {
          courseMap.set(c.slug, c);
          courseMap.set(c.documentId, c);
        });
      }

      const rows = enrollments.map(e => {
        const course = courseMap.get(e.courseId);
        const timeVal = e.enrolledAt || e.createdAt;
        return {
          'Mã Khóa học': e.courseId || '',
          'Tên Khóa học': course?.title || 'Không rõ',
          'Doanh thu (VNĐ)': course?.price || 0,
          'Ngày đăng ký': timeVal?.toDate?.()?.toLocaleDateString('vi-VN') || timeVal || '',
          'Trạng thái': e.status || 'active',
        };
      });
      downloadCSV('bao-cao-doanh-thu.csv', rows);
      showSuccess('revenue');
    } catch (err) {
      console.error(err);
      alert('Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportUsers = async () => {
    setExporting('users');
    try {
      const users = await firestoreService.getDocuments<any>('users');
      const rows = users
        .filter(u => u.role !== 'admin')
        .map(u => ({
          'Tên': u.name || u.displayName || '',
          'Email': u.email || '',
          'Vai trò': u.role === 'instructor' ? 'Giảng viên' : 'Học viên',
          'Trạng thái': u.status === 'locked' ? 'Bị khóa' : 'Hoạt động',
          'Ngày tham gia': u.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || u.createdAt || '',
        }));
      downloadCSV('danh-sach-nguoi-dung.csv', rows);
      showSuccess('users');
    } catch (err) {
      console.error(err);
      alert('Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCourses = async () => {
    setExporting('courses');
    try {
      const res = await strapi.findMany<any>('courses', {
        pagination: { pageSize: 200 },
        populate: { instructor: { fields: ['name'] }, category: { fields: ['name'] } },
        publicationState: 'preview',
      }, { token: process.env.NEXT_PUBLIC_STRAPI_TOKEN });

      const rows = (res.data || []).map(c => ({
        'Tên khóa học': c.title || '',
        'Giảng viên': c.instructor?.name || '',
        'Danh mục': c.category?.name || '',
        'Độ khó': c.difficulty || '',
        'Giá (VNĐ)': c.price || 0,
        'Học viên': c.totalStudents || 0,
        'Đánh giá TB': c.averageRating || 0,
        'Trạng thái': c.publishedAt ? 'Đã xuất bản' : 'Chờ duyệt',
      }));
      downloadCSV('danh-sach-khoa-hoc.csv', rows);
      showSuccess('courses');
    } catch (err) {
      console.error(err);
      alert('Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(null);
    }
  };

  const reports = [
    {
      key: 'revenue',
      title: 'Báo cáo Doanh thu',
      desc: 'Xuất danh sách tất cả giao dịch đăng ký khóa học, tổng doanh thu và thông tin thanh toán.',
      icon: FileSpreadsheet,
      color: 'text-emerald-500',
      action: handleExportRevenue,
      btnText: 'Xuất Doanh thu (.csv)',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      key: 'users',
      title: 'Báo cáo Người dùng',
      desc: 'Danh sách toàn bộ học viên và giảng viên, thông tin liên hệ và trạng thái tài khoản.',
      icon: Users,
      color: 'text-blue-500',
      action: handleExportUsers,
      btnText: 'Xuất Người dùng (.csv)',
      btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      key: 'courses',
      title: 'Báo cáo Khóa học',
      desc: 'Toàn bộ danh sách khóa học trên hệ thống kèm thông tin giảng viên, doanh thu và số học viên.',
      icon: BookOpen,
      color: 'text-purple-500',
      action: handleExportCourses,
      btnText: 'Xuất Khóa học (.csv)',
      btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo &amp; Thống kê</h1>
          <p className="text-muted-foreground">Xuất dữ liệu hệ thống ra file CSV để phân tích.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {reports.map(r => {
          const Icon = r.icon;
          const isExporting = exporting === r.key;
          const isDone = success === r.key;
          return (
            <Card key={r.key} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${r.color}`} />
                  {r.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{r.desc}</p>
                <Button
                  className={`w-full rounded-xl ${r.btnClass}`}
                  onClick={r.action}
                  disabled={isExporting || !!exporting}
                >
                  {isExporting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xuất...</>
                  ) : isDone ? (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Đã xuất thành công!</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> {r.btnText}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50 shadow-sm p-6">
        <h3 className="font-semibold mb-2">📌 Hướng dẫn sử dụng báo cáo</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>File CSV được mã hóa UTF-8 BOM, mở trực tiếp bằng Excel không bị lỗi tiếng Việt.</li>
          <li>Dữ liệu được lấy trực tiếp từ hệ thống, phản ánh tình trạng thời điểm xuất.</li>
          <li>Doanh thu tính theo giá gốc mỗi khóa học tại thời điểm học viên đăng ký.</li>
          <li>Khóa học bao gồm cả khóa đang chờ duyệt để admin theo dõi toàn diện.</li>
        </ul>
      </Card>
    </div>
  );
}
