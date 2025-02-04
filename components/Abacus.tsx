'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AbacusProps {
  value: number; // مقدار پیشرفت (بین ۰ تا ۱۰۰)
  max?: number; // حداکثر مقدار (پیشفرض ۱۰۰)
  beadCount?: number; // تعداد مهره‌ها (پیشفرض ۱۰)
  beadColor?: string; // رنگ مهره‌های فعال
  trackColor?: string; // رنگ محفظه مهره‌ها
  className?: string; // کلاس‌های اضافی
}

const Abacus = React.forwardRef<HTMLDivElement, AbacusProps>(
  (
    {
      value,
      max = 100,
      beadCount = 10,
      beadColor = '#4CAF50',
      trackColor = '#f0f0f0',
      className,
    },
    ref
  ) => {
    // محاسبه تعداد مهره‌های فعال
    const activeBeads = Math.floor((value / max) * beadCount);

    return (
      <div
        ref={ref}
        className={cn('flex gap-2 justify-center items-center', className)}
      >
        {Array.from({ length: beadCount }).map((_, index) => (
          <div
            key={index}
            className="relative w-4 h-12 rounded-full"
            style={{ backgroundColor: trackColor }}
          >
            <div
              className={cn(
                'absolute w-4 h-4 rounded-full transition-transform duration-300',
                index < activeBeads ? 'translate-y-0' : 'translate-y-8'
              )}
              style={{ backgroundColor: beadColor }}
            />
          </div>
        ))}
      </div>
    );
  }
);

Abacus.displayName = 'Abacus';

export { Abacus };