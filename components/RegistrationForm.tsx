"use client";
import React, { useState, ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Abacus } from '@/components/Abacus';

// وارد کردن اسکیما و تایپ فرم
import { formSchema, type FormData } from '@/lib/form/formSchema';
// وارد کردن ثابت‌های فرم (مراحل، لیست شهرها)
import { steps, kurdistanCities } from '@/lib/form/formConstants';
// وارد کردن کامپوننت‌های آپلود تصویر و رسید پرداخت
import ProfileImageUpload from './ProfileImageUpload';
import ReceiptsUpload from './ReceiptsUpload';

const RegistrationForm = () => {
  // -------------------------------
  // تعریف state های مورد نیاز
  // -------------------------------
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [receipts, setReceipts] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // -------------------------------
  // راه‌اندازی useForm با zod resolver و حالت onChange
  // -------------------------------
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  // -------------------------------
  // تابع ارسال فرم به سرور
  // -------------------------------
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // آماده‌سازی اطلاعات فرم برای ارسال
      const formData = new FormData();
      const birthDate = new Date(data.birthDate);
      const isoString = birthDate.toISOString();

      formData.append('fullName', data.fullName);
      formData.append('nationalId', data.nationalId);
      formData.append('birthDate', isoString);
      formData.append('city', data.city);
      formData.append('level', data.level?.toString() || '1');
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('emergencyNumber', data.emergencyNumber || '');
      
      if (files[0]) {
        formData.append('profileImage', files[0]);
      }
      
      receipts.forEach(file => {
        formData.append('receipts', file);
      });

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'خطا در ثبت اطلاعات');
      }
      
      // در صورت موفقیت ثبت، فرم ریست و پیام موفقیت نمایش داده می‌شود.
      setSubmitSuccess(true);
      reset();
      setFiles([]);
      setReceipts([]);
      setCurrentStep(0);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'خطا در ثبت اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------
  // توابع تغییر مرحله فرم
  // -------------------------------
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // پاکسازی پیام خطا هنگام بازگشت به مرحله قبلی
      setSubmitError(null);
      setCurrentStep(current => current - 1);
    }
  };

  // محاسبه درصد پیشرفت فرم
  const progress = ((currentStep + 1) / steps.length) * 100;

  // -------------------------------
  // رندر کردن مرحله فعلی فرم
  // -------------------------------
  const renderStep = () => {
    // در صورت ثبت موفق، پیام موفقیت نمایش داده می‌شود
    if (submitSuccess) {
      return (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ثبت نام با موفقیت انجام شد</h2>
          <p className="text-gray-600 mb-8">اطلاعات شما با موفقیت در سیستم ثبت شد.</p>
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              reset();
            }}
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            ثبت نام جدید
          </button>
        </motion.div>
      );
    }

    // دریافت اطلاعات مرحله فعلی
    const step = steps[currentStep];
    // دریافت مقدار فعلی فیلد مربوط به مرحله
    const currentValue = watch(step.field as keyof FormData);
    // فیلدهای اجباری فرم
    const requiredFields = ['fullName', 'nationalId', 'birthDate', 'city', 'mobileNumber'];
    // در صورتی که فیلد اجباری و مقدار آن خالی یا نامعتبر باشد، دکمه بعدی غیرفعال می‌شود.
    const disableNext = requiredFields.includes(step.field) && (!currentValue || (step.field in errors && errors[step.field as keyof FormData]));

    return (
      <motion.div
        key={currentStep}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="space-y-6"
      >
        {/* بخش هدر مرحله */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <step.icon className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.label}</h2>
        </div>

        {/* رندر کردن فیلدهای مربوط به هر مرحله */}
        {step.field === 'fullName' && (
          <input
            {...register('fullName')}
            className="form-input"
            placeholder="نام و نام خانوادگی خود را وارد کنید"
          />
        )}
        {step.field === 'nationalId' && (
          <input
            {...register('nationalId')}
            className="form-input"
            placeholder="کد ملی خود را وارد کنید"
          />
        )}
        {step.field === 'birthDate' && (
          <div className="relative">
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              onChange={date => setValue('birthDate', date as any)}
              containerClassName="w-full"
              inputClass="form-input text-center"
              format="YYYY/MM/DD"
              placeholder="انتخاب تاریخ تولد"
            />
          </div>
        )}
        {step.field === 'city' && (
          <select {...register('city')} className="form-input">
            <option value="">انتخاب شهرستان</option>
            {kurdistanCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
        {step.field === 'level' && (
          <select {...register('level')} className="form-input">
            <option value="">انتخاب سطح</option>
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i + 1} value={i + 1}>سطح {i + 1}</option>
            ))}
          </select>
        )}
        {step.field === 'mobileNumber' && (
          <input
            {...register('mobileNumber')}
            className="form-input text-right"
            placeholder="شماره همراه خود را وارد کنید"
            type="tel"
            inputMode="numeric"
          />
        )}
        {step.field === 'profileImage' && (
          // استفاده از کامپوننت آپلود تصویر پروفایل
          <ProfileImageUpload files={files} setFiles={setFiles} setValue={setValue} />
        )}
        {step.field === 'receipts' && (
          // استفاده از کامپوننت آپلود رسیدهای پرداخت
          <ReceiptsUpload receipts={receipts} setReceipts={setReceipts} setValue={setValue} />
        )}

        {/* نمایش پیام خطا در صورت بروز مشکل در فیلد */}
        {errors[step.field as keyof FormData] && (
          <p className="text-red-500 text-center mt-2 bg-red-50 p-3 rounded-xl">
            {errors[step.field as keyof FormData]?.message?.toString()}
          </p>
        )}

        {/* نمایش پیام خطای کلی ارسال فرم */}
        {submitError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {submitError}
          </div>
        )}

        {/* دکمه‌های ناوبری فرم */}
        <div className="flex justify-between gap-4 mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm disabled:opacity-50"
            >
              <ChevronRight className="inline-block ml-2" />
              قبلی
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting || (disableNext ? true : false)}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              بعدی
              <ChevronLeft className="inline-block mr-2" />
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin inline-block ml-2" />
                  در حال ثبت...
                </>
              ) : (
                'ثبت نام'
              )}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // -------------------------------
  // رندر نهایی فرم
  // -------------------------------
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8">
      {/* نمایش پیشرفت فرم */}
      <Abacus
        value={progress}
        beadCount={steps.length}
        beadColor="#3b82f6"
        trackColor="#e2e8f0"
      />
      <form className="relative min-h-[400px]">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </form>
    </div>
  );
};

export default RegistrationForm;
