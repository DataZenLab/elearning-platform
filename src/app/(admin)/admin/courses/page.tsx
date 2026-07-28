'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { strapi } from '@/lib/strapi';
import type { Course } from '@/types';

type Filter = 'all' | 'published' | 'draft';

/**
 * Trang Quản Lý Khóa Học (Admin): Phê duyệt, xóa hoặc ẩn các khóa học trên toàn hệ thống.
 */
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await strapi.findMany<Course>('courses', {
        sort: ['createdAt:desc'],
        populate: { instructor: { fields: ['name', 'title'] } },
        pagination: { pageSize: 100 },
        publicationState: 'preview',
      }, { 
        cache: 'no-store',
        token: process.env.NEXT_PUBLIC_STRAPI_TOKEN 
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleApprove = async (documentId: string, title: string) => {
    if (!confirm(`Duyệt và xuất bản khóa học "${title}"?`)) return;
    setActionLoading(documentId);
    try {
      // Cập nhật custom flag VÀ built-in field
      await strapi.put(`/courses/${documentId}`, { isPublished: true, publishedAt: new Date().toISOString() });
      // Strapi v5: publish the document
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/courses/${documentId}/actions/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`, 'Content-Type': 'application/json' },
      });
      await fetchCourses();
    } catch {
      // Try simpler approach: just update isPublished flag
      try {
        await strapi.put(`/courses/${documentId}`, { isPublished: true, publishedAt: new Date().toISOString() });
        await fetchCourses();
      } catch {
        alert('Duyệt thất bại. Vui lòng kiểm tra quyền API trong Strapi.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (documentId: string, title: string) => {
    if (!confirm(`Thu hồi (đưa về Nháp) khóa học "${title}"?`)) return;
    setActionLoading(documentId);
    try {
      // Update custom flag AND the built-in Strapi publishedAt field
      await strapi.put(`/courses/${documentId}`, { isPublished: false, publishedAt: null });
      
      // Strapi v5: unpublish the document explicitly just in case
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/courses/${documentId}/actions/unpublish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN || ''}`, 'Content-Type': 'application/json' },
      });
      
      await fetchCourses();
    } catch (err) {
      console.error(err);
      // Fallback
      try {
        await strapi.put(`/courses/${documentId}`, { isPublished: false, publishedAt: null });
        await fetchCourses();
      } catch {
        alert('Thao tác thất bại. Vui lòng kiểm tra quyền API trong Strapi.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (documentId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN khóa học "${title}"?`)) return;
    setActionLoading(documentId);
    try {
      await strapi.delete(`/courses/${documentId}`);
      setCourses(prev => prev.filter(c => (c as any).documentId !== documentId));
    } catch {
      alert('Xóa thất bại. Hãy kiểm tra lại quyền API trong Strapi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const isPublished = !!c.publishedAt;
    const matchFilter = filter === 'all' || (filter === 'published' ? isPublished : !isPublished);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: courses.length,
    published: courses.filter(c => !!c.publishedAt).length,
    draft: courses.filter(c => !c.publishedAt).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Khóa học</h1>
        <p className="text-muted-foreground">Duyệt, chỉnh sửa hoặc gỡ bỏ các khóa học trên hệ thống.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng cộng', value: stats.total, color: 'text-foreground' },
          { label: 'Đã xuất bản', value: stats.published, color: 'text-success' },
          { label: 'Chờ duyệt (Nháp)', value: stats.draft, color: 'text-warning' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center border-border/50">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Tìm tên khóa học..." className="pl-9 h-10 bg-background"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as Filter[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-primary text-white border-0' : ''}
            >
              {f === 'all' ? 'Tất cả' : f === 'published' ? '✅ Đã duyệt' : '🕐 Chờ duyệt'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Khóa học</th>
                <th className="px-6 py-4 font-medium">Giảng viên</th>
                <th className="px-6 py-4 font-medium">Lượt học</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Không có khóa học nào.</td></tr>
              ) : (
                filtered.map((course) => {
                  const isPublished = !!course.publishedAt;
                  const docId = String((course as any).documentId || course.id);
                  const isActing = actionLoading === docId;
                  return (
                    <tr key={course.id} className="bg-card hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{course.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{course.difficulty} • {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{(course.instructor as any)?.name || (course.instructor as any)?.username || '---'}</td>
                      <td className="px-6 py-4">{course.totalStudents || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isPublished ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {isPublished ? '✅ Đã xuất bản' : '🕐 Chờ duyệt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isPublished ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleApprove(docId, course.title)}
                              className="text-success border-success/30 hover:bg-success/10 rounded-lg text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              {isActing ? '...' : 'Duyệt'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleReject(docId, course.title)}
                              className="text-warning border-warning/30 hover:bg-warning/10 rounded-lg text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              {isActing ? '...' : 'Thu hồi'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isActing}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleDelete(docId, course.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
