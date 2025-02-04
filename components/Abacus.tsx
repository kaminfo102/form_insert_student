'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AbacusProps {
  value: number; // مقدار پیشرفت (بین ۰ تا ۱۰۰)
  max?: number; // حداکثر مقدار (پیشفرض ۱۰۰)
  beadCount?: number; // تعداد مهره‌ها (پیشفرض ۱۰)
  beadColor?: string; // رنگ مهره‌های متحرک
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
    // محاسبه تعداد مهره‌های متحرک (فعال)
    const activeBeads = Math.floor((value / max) * beadCount);

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-6 justify-center items-center p-4 border-4 rounded-md',
          className
        )}
        // حاشیه دور کل کامپوننت با رنگ قهوه‌ای
        style={{ borderColor: '#8B4513' }}
      >
        {Array.from({ length: beadCount }).map((_, index) => (
          <div
            key={index}
            className="relative w-6 h-24 rounded-full"
            style={{ backgroundColor: trackColor }}
          >
            {/* مهره ثابت بالا (تزئینی) */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gray-400" />
            {/* مهره ثابت پایین (تزئینی) */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gray-400" />
            {/* مهره متحرک */}
            <div
              className={
                'absolute w-6 h-6 rounded-full transition-transform duration-300 z-10 ' +
                (index < activeBeads ? 'translate-y-0' : 'translate-y-16')
              }
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
