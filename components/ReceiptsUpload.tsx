// این کامپوننت مسئول آپلود و مدیریت فایل‌های رسید پرداخت است.

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Receipt, X } from 'lucide-react';
import { UseFormSetValue } from 'react-hook-form';
import { FormData } from "@/lib/form/formSchema";


interface ReceiptsUploadProps {
  receipts: File[];
  setReceipts: (files: File[]) => void;
//   setValue: (name: string, value: any) => void;
  setValue: UseFormSetValue<FormData>;
}

const ReceiptsUpload: React.FC<ReceiptsUploadProps> = ({ receipts, setReceipts, setValue }) => {
  // تنظیمات Dropzone برای آپلود رسید
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      const updatedReceipts = [...receipts, ...acceptedFiles];
      setReceipts(updatedReceipts);
      setValue('receipts', updatedReceipts.map(file => URL.createObjectURL(file)));
    }
  });

  // تابع حذف فایل رسید بر اساس ایندکس
  const removeReceipt = (index: number) => {
    const updatedReceipts = [...receipts];
    updatedReceipts.splice(index, 1);
    setReceipts(updatedReceipts);
    setValue('receipts', updatedReceipts.map(file => URL.createObjectURL(file)));
  };

  return (
    <div className="space-y-4">
      {/* منطقه آپلود فایل‌های رسید */}
      <div
        {...getRootProps()}
        className="border-3 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-white/50 backdrop-blur-sm"
      >
        <input {...getInputProps()} />
        <Receipt className="mx-auto h-12 w-12 text-primary mb-4" />
        <p className="text-lg">برای آپلود رسید کلیک کنید یا فایل‌ها را اینجا رها کنید</p>
        <p className="text-sm text-gray-500 mt-2">می‌توانید چند فایل را همزمان انتخاب کنید</p>
      </div>
      
      {/* نمایش لیست فایل‌های آپلود شده */}
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
  );
};

export default ReceiptsUpload;
