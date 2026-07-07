'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  question: string;
  options: Option[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  index: number;
  total: number;
}

export function QuestionCard({ 
  question, 
  options, 
  selectedOptionId, 
  onSelect,
  index,
  total
}: QuestionCardProps) {
  return (
    <Card className="border-border/50 shadow-sm w-full max-w-3xl mx-auto bg-card">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 text-sm font-medium text-muted-foreground">
          <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
            {index}
          </span>
          <span>/ {total}</span>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-semibold mb-8 text-foreground leading-relaxed">
          {question}
        </h3>

        <RadioGroup value={selectedOptionId} onValueChange={onSelect} className="space-y-4">
          {options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOptionId === option.id;
            
            return (
              <Label
                key={option.id}
                htmlFor={option.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center mt-0.5">
                  <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
                    isSelected 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : "border-muted-foreground/50 text-muted-foreground"
                  )}>
                    {letter}
                  </div>
                </div>
                <div className="flex-1 text-base font-normal leading-relaxed">
                  {option.text}
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
