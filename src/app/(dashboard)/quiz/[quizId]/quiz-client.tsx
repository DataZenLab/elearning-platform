'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuestionCard } from '@/components/quiz/question-card';
import { useAuthStore } from '@/stores/auth-store';
import { enrollmentService } from '@/services/firebase/enrollment.service';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Quiz } from '@/types';
import Link from 'next/link';

interface QuizClientProps {
  quiz: Quiz;
  courseSlug?: string;
}

export function QuizClient({ quiz, courseSlug }: QuizClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: questionId -> optionId
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const question = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === totalQuestions;
  const progress = (currentIdx / Math.max(totalQuestions, 1)) * 100;

  const handleSelectOption = useCallback((optionId: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [question.id]: Number(optionId)
    }));
  }, [question?.id, isSubmitted]);

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) setCurrentIdx(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Grade: count correct
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    questions.forEach(q => {
      const pts = q.points || 100;
      totalPoints += pts;
      const selectedOptionId = answers[q.id];
      const selectedOption = q.options?.find((o: any) => o.id === selectedOptionId);
      if (selectedOption?.isCorrect) {
        correct++;
        earnedPoints += pts;
      }
    });

    const finalScore = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    setScore(finalScore);
    setIsSubmitted(true);

    // Persist to Firebase
    if (user?.uid) {
      try {
        // Save quiz attempt
        const attemptRef = doc(db, 'users', user.uid, 'quiz_attempts', `quiz_${quiz.id}_${Date.now()}`);
        await setDoc(attemptRef, {
          quizId: quiz.id,
          quizTitle: quiz.title,
          courseSlug: courseSlug || '',
          score: finalScore,
          earnedPoints,
          totalPoints,
          correct,
          total: totalQuestions,
          passed: finalScore >= (quiz.passingScore || 80),
          completedAt: serverTimestamp(),
        });

        // Update course progress with quiz score
        if (courseSlug) {
          await enrollmentService.updateProgress(user.uid, courseSlug, {
            score: finalScore,
          });
        }
      } catch (err) {
        console.error('Failed to save quiz attempt:', err);
      }
    }

    setIsSubmitting(false);
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  // === Result Screen ===
  if (isSubmitted) {
    const passed = score >= (quiz.passingScore || 80);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card p-8 rounded-xl border border-border shadow-xl text-center space-y-6">
          {/* Icon */}
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto",
            passed ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            {passed
              ? <Trophy className="w-12 h-12 text-green-500" />
              : <XCircle className="w-12 h-12 text-red-500" />
            }
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {passed ? 'Chúc mừng! Bạn đã vượt qua!' : 'Chưa đạt yêu cầu'}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {quiz.title}
            </p>
          </div>

          {/* Score */}
          <div className="p-6 bg-muted/50 rounded-xl space-y-3">
            <div className="text-6xl font-black text-primary">
              {score}<span className="text-2xl text-muted-foreground font-normal">/100</span>
            </div>
            <p className={cn("font-semibold text-sm", passed ? "text-green-500" : "text-red-500")}>
              {passed
                ? `✓ Đạt yêu cầu (tối thiểu ${quiz.passingScore || 80}/100)`
                : `✗ Chưa đạt (cần ${quiz.passingScore || 80}/100 để qua)`
              }
            </p>
            <p className="text-muted-foreground text-sm">
              Đúng <span className="font-semibold text-foreground">
                {questions.filter(q => {
                  const selectedOption = q.options?.find((o: any) => o.id === answers[q.id]);
                  return selectedOption?.isCorrect;
                }).length}
              </span> / {totalQuestions} câu
            </p>
          </div>

          {/* Passed bonus message */}
          {passed && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Điểm đã được lưu vào hệ thống của bạn!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {courseSlug && (
              <Button
                variant="outline"
                className="rounded-lg font-semibold flex-1"
                onClick={() => router.push(`/learn/${courseSlug}`)}
              >
                Quay lại khóa học
              </Button>
            )}
            <Button
              className="rounded-lg font-semibold flex-1"
              onClick={() => router.push('/my-courses')}
            >
              Khóa học của tôi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === Quiz Screen ===
  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Quiz chưa có câu hỏi nào</h2>
          <p className="text-muted-foreground text-sm">Giảng viên chưa thêm câu hỏi vào quiz này.</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-lg">
            <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={courseSlug ? `/learn/${courseSlug}` : '/my-courses'}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-2 font-medium">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h1 className="text-sm truncate max-w-[300px] lg:max-w-md">{quiz.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-muted-foreground font-medium">
            Đã làm: <span className="text-foreground">{answeredCount}/{totalQuestions}</span>
          </div>
          {quiz.timeLimit && (
            <QuizTimer initialMinutes={quiz.timeLimit} onTimeUp={handleTimeUp} />
          )}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg font-bold bg-success hover:bg-success/90 text-success-foreground ml-2"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </div>
      </header>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none bg-border" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col pb-32">
        <div className="flex-1 flex flex-col justify-center">
          <QuestionCard
            question={question.text}
            options={(question.options || []).map((o: any) => ({
              id: String(o.id),
              text: o.text
            }))}
            selectedOptionId={answers[question.id] ? String(answers[question.id]) : undefined}
            onSelect={handleSelectOption}
            index={currentIdx + 1}
            total={totalQuestions}
          />
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border px-4 sm:px-8 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="rounded-lg w-32 font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Câu trước
        </Button>

        <div className="flex gap-1.5 items-center">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                "h-2.5 rounded-full cursor-pointer transition-all duration-200",
                currentIdx === idx
                  ? "w-6 bg-primary"
                  : answers[q.id]
                    ? "w-2.5 bg-primary/50"
                    : "w-2.5 bg-muted"
              )}
              onClick={() => setCurrentIdx(idx)}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIdx === totalQuestions - 1}
          className="rounded-lg w-32 font-semibold gap-2"
        >
          Câu tiếp <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </footer>
    </div>
  );
}
