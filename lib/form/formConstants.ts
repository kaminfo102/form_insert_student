// این فایل شامل ثابت‌های مربوط به فرم مانند مراحل و لیست شهرها است.

import { User, Phone, Calendar, MapPin, School, Camera, Receipt } from 'lucide-react';

// لیست شهرهای کردستان
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

// آرایه مراحل فرم به همراه آیکون‌ها و برچسب مربوط
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
