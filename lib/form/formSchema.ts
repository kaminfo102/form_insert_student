// این فایل شامل اسکیما و تایپ فرم با استفاده از zod است.

import * as z from 'zod';

// تعریف اسکیما برای اعتبارسنجی فرم
export const formSchema = z.object({
  fullName: z.string().min(3, 'نام و نام خانوادگی باید حداقل 3 حرف باشد'),
  nationalId: z.string().length(10, 'کد ملی باید 10 رقم باشد'),
  birthDate: z.any(), // در صورت نیاز می‌توانید اعتبارسنجی دقیق‌تری اضافه کنید
  city: z.string().min(1, 'لطفا شهر را انتخاب کنید'),
  level: z.string().optional(),
  mobileNumber: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  emergencyNumber: z.string().regex(/^\d{11}$/, 'شماره تلفن معتبر نیست').optional(),
  profileImage: z.string().optional(),
  receipts: z.array(z.string()).optional(),
});

// تعریف تایپ داده فرم بر اساس اسکیما
export type FormData = z.infer<typeof formSchema>;
