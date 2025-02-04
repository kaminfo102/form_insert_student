'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

// ایمپورت تنظیمات فرم از فایل خارجی
import { formSchema, steps } from '@/lib/formvalidation/validation';

// کامپوننت نوار پیشرفت (Abacus) که قبلاً ساخته شده است
import { Abacus } from '@/components/Abacus';
// کامپوننت رندر کردن مراحل فرم
import StepRenderer from '@/components/StepRender';

export type FormData = {
  fullName: string;
  nationalId: string;
  birthDate: any;
  city: string;
  level?: string;
  mobileNumber: string;
  emergencyNumber?: string;
  profileImage?: string;
  receipts?: string[];
};

export default function RegistrationForm() {
  // وضعیت‌های مربوط به فرم و فایل‌ها
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [receipts, setReceipts] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // راه‌اندازی فرم با react-hook-form و اعتبارسنجی zod
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // تنظیمات dropzone برای آپلود تصویر پروفایل
  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setValue('profileImage', URL.createObjectURL(acceptedFiles[0]));
    }
  });

  // تنظیمات dropzone برای آپلود رسید
  const { getRootProps: getReceiptRootProps, getInputProps: getReceiptInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      const newReceipts = [...receipts, ...acceptedFiles];
      setReceipts(newReceipts);
      setValue('receipts', newReceipts.map(file => URL.createObjectURL(file)));
    }
  });

  // حذف تصویر پروفایل انتخاب‌شده
  const removeProfileImage = () => {
    setFiles([]);
    setValue('profileImage', '');
  };

  // حذف یک رسید انتخاب‌شده
  const removeReceipt = (index: number) => {
    const newReceipts = [...receipts];
    newReceipts.splice(index, 1);
    setReceipts(newReceipts);
    setValue('receipts', newReceipts.map(file => URL.createObjectURL(file)));
  };

  // تابع ارسال فرم به سرور
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      // تبدیل تاریخ تولد به فرمت ISO
      const isoString = new Date(data.birthDate).toISOString();

      // اضافه کردن فیلدهای متنی به FormData
      formData.append('fullName', data.fullName);
      formData.append('nationalId', data.nationalId);
      formData.append('birthDate', isoString);
      formData.append('city', data.city);
      formData.append('level', data.level?.toString() || '1');
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('emergencyNumber', data.emergencyNumber || '');

      // اضافه کردن تصویر پروفایل در صورت وجود
      if (files[0]) {
        formData.append('profileImage', files[0]);
      }

      // اضافه کردن رسیدها در صورت وجود
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

  // رفتن به مرحله بعدی
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // بازگشت به مرحله قبلی
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // درصد پیشرفت فرم
  const progress = ((currentStep + 1) / steps.length) * 100;

  // تابع ریست کردن فرم پس از ثبت موفق
  const onReset = () => {
    setSubmitSuccess(false);
    reset();
    setFiles([]);
    setReceipts([]);
    setCurrentStep(0);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8">
      {/* نمایش نوار پیشرفت */}
      <Abacus
        value={progress}
        beadCount={steps.length}
        beadColor="#3b82f6"
        trackColor="#e2e8f0"
        // className="mb-4 w-60 h-12 mx-auto"
      />

      <form className="relative min-h-[400px]" onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <StepRenderer
            currentStep={currentStep}
            steps={steps}
            register={register}
            errors={errors}
            setValue={setValue}
            files={files}
            receipts={receipts}
            getProfileRootProps={getProfileRootProps}
            getProfileInputProps={getProfileInputProps}
            getReceiptRootProps={getReceiptRootProps}
            getReceiptInputProps={getReceiptInputProps}
            removeProfileImage={removeProfileImage}
            removeReceipt={removeReceipt}
            submitError={submitError}
            submitSuccess={submitSuccess}
            isSubmitting={isSubmitting}
            onReset={onReset}
          />
        </AnimatePresence>

        {/* دکمه‌های ناوبری فرم */}
        <div className="flex justify-between gap-4 mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm disabled:opacity-50"
            >
              {/* آیکون جهت برای مرحله قبلی */}
              <span className="inline-block ml-2">قبلی</span>
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              <span className="inline-block mr-2">بعدی</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-8 text-xl font-semibold rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block ml-2">در حال ثبت...</span>
                </>
              ) : (
                'ثبت نام'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
