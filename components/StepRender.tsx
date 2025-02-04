// کامپوننت رندر کردن هر مرحله از فرم
import React from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import Image from 'next/image';
import { Camera, Receipt, X } from 'lucide-react';
import { kurdistanCities } from '@/lib/formvalidation/validation';

interface StepRenderProps {
  currentStep: number;
  steps: Array<{ field: string; icon: any; label: string }>;
  register: any;
  errors: any;
  setValue: any;
  files: File[];
  receipts: File[];
  getProfileRootProps: any;
  getProfileInputProps: any;
  getReceiptRootProps: any;
  getReceiptInputProps: any;
  removeProfileImage: () => void;
  removeReceipt: (index: number) => void;
  submitError: string | null;
  submitSuccess: boolean;
  isSubmitting: boolean;
  onReset: () => void;
}

const StepRender: React.FC<StepRenderProps> = ({
  currentStep,
  steps,
  register,
  errors,
  setValue,
  files,
  receipts,
  getProfileRootProps,
  getProfileInputProps,
  getReceiptRootProps,
  getReceiptInputProps,
  removeProfileImage,
  removeReceipt,
  submitError,
  submitSuccess,
  isSubmitting,
  onReset,
}) => {
  // در صورت موفقیت‌آمیز بودن ثبت اطلاعات، پیام موفقیت نمایش داده می‌شود
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
          onClick={onReset}
          className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          ثبت نام جدید
        </button>
      </motion.div>
    );
  }

  // دریافت اطلاعات مرحله جاری
  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      key={currentStep}
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      className="space-y-6"
    >
      {/* هدر هر مرحله */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.label}</h2>
      </div>

      {/* رندر فیلدهای فرم بر اساس نوع فیلد */}
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
            onChange={(date) => setValue('birthDate', date)}
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
          {kurdistanCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      )}

      {step.field === 'level' && (
        <select {...register('level')} className="form-input">
          <option value="">انتخاب سطح</option>
          {Array.from({ length: 18 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              سطح {i + 1}
            </option>
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
        <div className="space-y-4">
          <div
            {...getProfileRootProps()}
            className="border-3 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-white/50 backdrop-blur-sm"
          >
            <input {...getProfileInputProps()} />
            <Camera className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg">برای آپلود تصویر کلیک کنید یا تصویر را اینجا رها کنید</p>
            <p className="text-sm text-gray-500 mt-2">یا با دوربین موبایل عکس بگیرید</p>
          </div>
          {files.length > 0 && (
            <div className="relative mt-4 p-4 bg-white rounded-xl shadow-sm">
              <button
                type="button"
                onClick={removeProfileImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <Image
                src={URL.createObjectURL(files[0])}
                alt="Preview"
                className="w-full rounded-lg"
                layout="responsive"
                width={20}
                height={20}
              />
            </div>
          )}
        </div>
      )}

      {step.field === 'receipts' && (
        <div className="space-y-4">
          <div
            {...getReceiptRootProps()}
            className="border-3 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-white/50 backdrop-blur-sm"
          >
            <input {...getReceiptInputProps()} />
            <Receipt className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg">برای آپلود رسید کلیک کنید یا فایل‌ها را اینجا رها کنید</p>
            <p className="text-sm text-gray-500 mt-2">می‌توانید چند فایل را همزمان انتخاب کنید</p>
          </div>
          {receipts.length > 0 && (
            <div className="space-y-3">
              {receipts.map((file, index) => (
                <div key={index} className="relative bg-white p-4 rounded-xl shadow-sm flex items-center">
                  <Receipt className="w-6 h-6 text-primary ml-3" />
                  <span className="text-sm text-gray-600 flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeReceipt(index)}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* نمایش خطاهای ورودی مربوط به فیلد */}
      {errors[step.field] && (
        <p className="text-red-500 text-center mt-2 bg-red-50 p-3 rounded-xl">
          {errors[step.field]?.message?.toString()}
        </p>
      )}

      {/* نمایش خطای کلی ثبت اطلاعات */}
      {submitError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
          {submitError}
        </div>
      )}
    </motion.div>
  );
};

export default StepRender;
