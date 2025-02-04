import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';


const prisma = new PrismaClient();

// تابع برای سانیتایز نام فایل
const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
};

// تابع برای تولید تاریخ فرمت شده
const getFormattedTimestamp = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
    '-',
    Math.random().toString(36).substring(2, 8)
  ].join('');
};



export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // دریافت کد ملی
  const nationalId = formData.get('nationalId') as string;
  if (!nationalId) {
    return new Response('کد ملی الزامی است', { status: 400 });
  }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Handle profile image upload
    const profileImage = formData.get('profileImage') as File;
    let profileImagePath = '';
    if (profileImage) {
      try {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const sanitizedNationalId = sanitizeFilename(nationalId);
        const timestamp = getFormattedTimestamp();
        
        // بهینهسازی تصویر
        const optimizedImage = await sharp(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
  
        // تولید نام فایل
        const fileName = `profile_${sanitizedNationalId}_${timestamp}.webp`;
        const filePath = join(uploadDir, fileName);
        
        await writeFile(filePath, optimizedImage);
        profileImagePath = `/uploads/${fileName}`;
      } catch (error) {
        console.error('خطا در پردازش عکس پروفایل:', error);
      }
    }
    
   // پردازش رسیدها
  const receiptFiles = formData.getAll('receipts') as File[];
  const receiptPaths: string[] = [];

  for (const [index, receipt] of receiptFiles.entries()) {
    try {
      const buffer = Buffer.from(await receipt.arrayBuffer());
      const sanitizedNationalId = sanitizeFilename(nationalId);
      const timestamp = getFormattedTimestamp();

      // بررسی نوع فایل
      if (receipt.type.startsWith('image/')) {
        // بهینهسازی تصاویر
        const optimizedImage = await sharp(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();

        // تولید نام فایل
        const fileName = `receipt_${sanitizedNationalId}_${timestamp}_${index}.webp`;
        const filePath = join(uploadDir, fileName);
        
        await writeFile(filePath, optimizedImage);
        receiptPaths.push(`/uploads/${fileName}`);
      } else {
        // پردازش فایلهای غیر تصویری
        const ext = receipt.name.split('.').pop() || 'file';
        const fileName = `receipt_${sanitizedNationalId}_${timestamp}_${index}.${ext}`;
        const filePath = join(uploadDir, fileName);
        
        await writeFile(filePath, buffer);
        receiptPaths.push(`/uploads/${fileName}`);
      }
    } catch (error) {
      console.error(`خطا در پردازش رسید شماره ${index + 1}:`, error);
    }
  }

    // Create registration record
    const registration = await prisma.registration.create({
      data: {
        fullName: formData.get('fullName') as string,
        nationalId: formData.get('nationalId') as string,
        birthDate: new Date(formData.get('birthDate') as string),
        city: formData.get('city') as string,
        level: formData.get('level') as string,
        mobileNumber: formData.get('mobileNumber') as string,
        emergencyNumber: formData.get('emergencyNumber') as string,
        profileImage: profileImagePath,
        receipts: receiptPaths,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: registration 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید.' 
      },
      { status: 500 }
    );
  }
}