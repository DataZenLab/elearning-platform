'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { firestoreService } from '@/services/firebase/firestore.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  photoURL?: string;
}

/**
 * Trang Bảng Xếp Hạng: Hiển thị xếp hạng học viên dựa trên số tín chỉ/khóa học đã hoàn thành.
 */
export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const topUsers = await firestoreService.getLeaderboard(10);
        setLeaders(topUsers as LeaderboardUser[]);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bảng xếp hạng</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Thi đua cùng hàng nghìn học viên khác.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Rank Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Trophy className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Thứ hạng của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-2">
                {leaders.findIndex(l => l.id === user?.uid) !== -1 
                  ? `#${leaders.findIndex(l => l.id === user?.uid) + 1}` 
                  : '#--'}
              </div>
              <p className="text-sm text-muted-foreground">
                Số tín chỉ hoàn thành: <span className="font-semibold text-foreground">{user?.completedCourses || 0}</span>
              </p>
              <div className="mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                Cần hoàn thành thêm 1 khóa học để lên hạng.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Global Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Medal className="w-5 h-5 text-yellow-500" />
                Top học viên tuần này
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Trophy className="w-12 h-12 mb-3 opacity-20 animate-pulse" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : leaders.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {leaders.map((leader, index) => (
                    <div 
                      key={leader.id} 
                      className={`p-4 flex items-center gap-4 transition-colors ${user?.uid === leader.id ? 'bg-primary/5' : 'hover:bg-muted/10'}`}
                    >
                      <div className="w-8 flex justify-center font-bold text-lg text-muted-foreground">
                        {index === 0 ? <Medal className="text-yellow-500 w-6 h-6" /> : index === 1 ? <Medal className="text-slate-400 w-6 h-6" /> : index === 2 ? <Medal className="text-amber-600 w-6 h-6" /> : `#${index + 1}`}
                      </div>
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage 
                          src={user?.uid === leader.id && user?.avatarUrl ? user.avatarUrl : (leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`)} 
                          alt={leader.name} 
                        />
                        <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {leader.name} {user?.uid === leader.id && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Bạn</span>}
                        </div>
                      </div>
                      <div className="font-bold flex items-center gap-1.5 text-primary">
                        {(leader as any).completedCourses || 0} tín chỉ <Star className="w-4 h-4 fill-primary text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Trophy className="w-12 h-12 mb-3 opacity-20" />
                  <p>Chưa có dữ liệu bảng xếp hạng</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
