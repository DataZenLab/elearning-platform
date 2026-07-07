'use client';

import { motion } from 'framer-motion';
import { FEATURES } from '@/lib/constants';
import {
  Globe,
  GraduationCap,
  Award,
  Users,
  Code2,
  TrendingUp,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Globe,
  GraduationCap,
  Award,
  Users,
  Code2,
  TrendingUp,
};

export function WhyChooseUs() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — left-aligned, more editorial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
            <span className="w-6 h-px bg-primary" />
            Tại sao chọn chúng tôi
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Được xây dựng cho kết quả thực tế
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Không chỉ là video bài giảng — đây là môi trường học tập được thiết kế để bạn có thể áp dụng ngay vào công việc.
          </p>
        </motion.div>

        {/* Features — asymmetric grid for visual interest */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Globe;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
