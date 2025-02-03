'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, Calendar, MapPin, School, Camera, Receipt, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';

const kurdistanCities = [
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

const formSchema = z.object({
  fullName: z.string().min(3, 'نام و نام خانوادگی باید حداقل 3 حرف باشد'),
  nationalId: z.string().length(10, 'کد ملی باید 10 رقم باشد'),
  birthDate: z.any(),
  city: z.string().min(1, 'لطفا شهر را انتخاب کنید'),
  level: z.string().optional(),
  // level: z.number().min(1).max(18),
  mobileNumber: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  emergencyNumber: z.string().regex(/^\d{11}$/, 'شماره تلفن معتبر نیست'),
  profileImage: z.string().optional(),
  receipts: z.array(z.string()).optional(),
 
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { field: 'fullName', icon: User, label: 'نام و نام خانوادگی' },
  { field: 'nationalId', icon: User, label: 'کد ملی' },
  { field: 'birthDate', icon: Calendar, label: 'تاریخ تولد' },
  { field: 'city', icon: MapPin, label: 'شهرستان' },
  { field: 'level', icon: School, label: 'سطح' },
  { field: 'mobileNumber', icon: Phone, label: 'شماره همراه' },
  { field: 'emergencyNumber', icon: Phone, label: 'شماره ثابت یا اضطراری' },
  { field: 'profileImage', icon: Camera, label: 'تصویر فراگیر' },
  { field: 'receipts', icon: Receipt, label: 'رسید پرداخت' },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [receipts, setReceipts] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setValue('profileImage', URL.createObjectURL(acceptedFiles[0]));
    }
  });

  const { getRootProps: getReceiptRootProps, getInputProps: getReceiptInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      setReceipts(prev => [...prev, ...acceptedFiles]);
      setValue('receipts', [...receipts, ...acceptedFiles].map(file => URL.createObjectURL(file)));
    }
  });

  const removeProfileImage = () => {
    setFiles([]);
    setValue('profileImage', '');
  };

  const removeReceipt = (index: number) => {
    const newReceipts = [...receipts];
    newReceipts.splice(index, 1);
    setReceipts(newReceipts);
    setValue('receipts', newReceipts.map(file => URL.createObjectURL(file)));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const formData = new FormData();
      
      // Add text fields
      formData.append('fullName', data.fullName);
      formData.append('nationalId', data.nationalId);
      formData.append('birthDate', data.birthDate);
      formData.append('city', data.city);
      formData.append('level', data.level?.toString() || '1');
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('emergencyNumber', data.emergencyNumber);
      
      // Add profile image
      if (files[0]) {
        formData.append('profileImage', files[0]);
      }
      
      // Add receipts
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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.label}</h2>
        </div>

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
              // calendarClassName="!font-vazirmatn !text-lg"
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
            className="form-input"
            placeholder="شماره همراه خود را وارد کنید"
            type="tel"
            inputMode="numeric"
          />
        )}

        {step.field === 'emergencyNumber' && (
          <input
            {...register('emergencyNumber')}
            className="form-input"
            placeholder="شماره ثابت یا اضطراری را وارد کنید"
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
                <img
                  src={URL.createObjectURL(files[0])}
                  alt="Preview"
                  className="w-full rounded-lg"
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

        {errors[step.field as keyof FormData] && (
          <p className="text-red-500 text-center mt-2 bg-red-50 p-3 rounded-xl">
            {errors[step.field as keyof FormData]?.message}
          </p>
        )}

        {submitError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {submitError}
          </div>
        )}

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
              disabled={isSubmitting}
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

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8">
      <Progress value={progress} className="mb-8" />
      <form className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </form>
    </div>
  );
}