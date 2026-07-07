'use client';

import { motion } from 'framer-motion';
import { LANDING_CATEGORIES } from '@/lib/constants';
import Link from 'next/link';
import {
  Code2,
  Palette,
  Megaphone,
  Database,
  Smartphone,
  Cloud,
  Brain,
  Briefcase,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Palette,
  Megaphone,
  Database,
  Smartphone,
  Cloud,
  Brain,
  Briefcase,
};

export function CategoriesSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
              <span className="w-6 h-px bg-primary" />
              Danh mục
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Khám phá theo lĩnh vực
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link
              href="/courses"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              Xem tất cả &rarr;
            </Link>
          </motion.div>
        </div>

        {/* Grid — clean, no card hover shadow AI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {LANDING_CATEGORIES.map((category, index) => {
            const Icon = iconMap[category.icon] || Code2;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/courses?category=${category.name.toLowerCase()}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}18`, color: category.color }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {category.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {category.count} khóa
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
