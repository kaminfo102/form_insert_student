// این کامپوننت مسئول آپلود و پیش‌نمایش تصویر پروفایل است.

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';
import { UseFormSetValue } from 'react-hook-form';
import { FormData } from "@/lib/form/formSchema";


interface ProfileImageUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
//   setValue: (name: string, value: any) => void;
      setValue: UseFormSetValue<FormData>;
    }


const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ files, setFiles, setValue }) => {
  // تنظیمات Dropzone برای آپلود تصویر
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      // ذخیره تصویر به صورت آدرس موقت در فرم
      setValue('profileImage', URL.createObjectURL(acceptedFiles[0]));
    }
  });

  // تابع حذف تصویر
  const removeProfileImage = () => {
    setFiles([]);
    setValue('profileImage', '');
  };

  return (
    <div className="space-y-4">
      {/* منطقه آپلود تصویر */}
      <div
        {...getRootProps()}
        className="border-3 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-white/50 backdrop-blur-sm"
      >
        <input {...getInputProps()} />
        <Camera className="mx-auto h-12 w-12 text-primary mb-4" />
        <p className="text-lg">برای آپلود تصویر کلیک کنید یا تصویر را اینجا رها کنید</p>
        <p className="text-sm text-gray-500 mt-2">یا با دوربین موبایل عکس بگیرید</p>
      </div>
      
      {/* نمایش پیش‌نمایش تصویر در صورت آپلود */}
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
            width={50}
            height={50}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
