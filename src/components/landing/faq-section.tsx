'use client';

import { motion } from 'framer-motion';
import { FAQ_ITEMS } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Khu vực hiển thị Frequently Asked Questions (Accordion) trên trang chủ.
 */
export function FAQSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-sm font-medium text-primary tracking-wide uppercase inline-flex items-center gap-2">
            <span className="w-6 h-px bg-primary" />
            FAQ
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Câu hỏi thường gặp
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Everything you need to know about our courses, certifications, and learning model.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion className="w-full space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card px-5 py-1 rounded-lg border border-border"
              >
                <AccordionTrigger className="text-left font-semibold text-[1.1rem] hover:text-primary hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
