// فایل تنظیمات فرم به همراه اعتبارسنجی (zod)، لیست مراحل فرم و لیست شهرها
import * as z from 'zod';
import { User, Phone, Calendar, MapPin, School, Camera, Receipt } from 'lucide-react';

// لیست شهرهای استان کردستان
export const kurdistanCities = [
  'سنندج',
  'سقز',
  'مریوان',
  'بانه',
  'قروه',
  'کامیاران',
  'بیجار',
  'دیواندره',
  'دهگلان',
  'سروآباد',
];

// اعتبارسنجی فرم با استفاده از zod
export const formSchema = z.object({
  fullName: z.string().min(3, 'نام و نام خانوادگی باید حداقل 3 حرف باشد'),
  nationalId: z.string().length(10, 'کد ملی باید 10 رقم باشد'),
  birthDate: z.any(),
  city: z.string().min(1, 'لطفا شهر را انتخاب کنید'),
  level: z.string().optional(),
  mobileNumber: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  emergencyNumber: z.string().regex(/^\d{11}$/, 'شماره تلفن معتبر نیست').optional(),
  profileImage: z.string().optional(),
  receipts: z.array(z.string()).optional(),
});

// مراحل فرم (هر مرحله شامل فیلد، آیکون و برچسب می‌باشد)
export const steps = [
  { field: 'fullName', icon: User, label: 'نام و نام خانوادگی' },
  { field: 'nationalId', icon: User, label: 'کد ملی' },
  { field: 'birthDate', icon: Calendar, label: 'تاریخ تولد' },
  { field: 'city', icon: MapPin, label: 'شهرستان' },
  { field: 'level', icon: School, label: 'سطح' },
  { field: 'mobileNumber', icon: Phone, label: 'شماره همراه' },
  { field: 'profileImage', icon: Camera, label: 'تصویر فراگیر' },
  { field: 'receipts', icon: Receipt, label: 'رسید پرداخت' },
];
