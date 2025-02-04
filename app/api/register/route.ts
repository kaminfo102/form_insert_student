import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';

const prisma = new PrismaClient();

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
};

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

    // اعتبارسنجی فیلدهای اجباری
    const requiredFields = ['fullName', 'nationalId', 'birthDate', 'city', 'level', 'mobileNumber'];
    const missingFields = requiredFields.filter(field => !formData.get(field));

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `فیلدهای زیر الزامی هستند: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const nationalId = formData.get('nationalId') as string;

    // بررسی تکراری نبودن کد ملی
    const existingRegistration = await prisma.registration.findUnique({
      where: { nationalId },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'کد ملی تکراری است' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // پردازش عکس پروفایل
    let profileImagePath = '';
    const profileImage = formData.get('profileImage') as File | null;
    if (profileImage && profileImage.size > 0) {
      try {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const sanitizedNationalId = sanitizeFilename(nationalId);
        const timestamp = getFormattedTimestamp();

        const optimizedImage = await sharp(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const fileName = `profile_${sanitizedNationalId}_${timestamp}.webp`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, optimizedImage);
        profileImagePath = `/uploads/${fileName}`;
      } catch (error) {
        console.error('خطا در پردازش عکس پروفایل:', error);
        return NextResponse.json(
          { success: false, error: 'خطا در پردازش عکس پروفایل' },
          { status: 500 }
        );
      }
    }

    // پردازش رسیدها
    const receiptFiles = formData.getAll('receipts') as File[];
    const receiptPaths: string[] = [];

    for (let i = 0; i < receiptFiles.length; i++) {
      const receipt = receiptFiles[i];
      try {
        if (receipt.size === 0) continue;

        const buffer = Buffer.from(await receipt.arrayBuffer());
        const sanitizedNationalId = sanitizeFilename(nationalId);
        const timestamp = getFormattedTimestamp();

        if (receipt.type.startsWith('image/')) {
          const optimizedImage = await sharp(buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

          const fileName = `receipt_${sanitizedNationalId}_${timestamp}_${i}.webp`;
          const filePath = join(uploadDir, fileName);
          await writeFile(filePath, optimizedImage);
          receiptPaths.push(`/uploads/${fileName}`);
        } else {
          const ext = receipt.name.split('.').pop()?.toLowerCase() || 'file';
          const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
          if (!allowedExtensions.includes(ext)) {
            throw new Error('فرمت فایل مجاز نیست');
          }

          const fileName = `receipt_${sanitizedNationalId}_${timestamp}_${i}.${ext}`;
          const filePath = join(uploadDir, fileName);
          await writeFile(filePath, buffer);
          receiptPaths.push(`/uploads/${fileName}`);
        }
      } catch (error) {
        console.error(`خطا در پردازش رسید شماره ${i + 1}:`, error);
        return NextResponse.json(
          { success: false, error: `خطا در پردازش رسید شماره ${i + 1}: ${(error as Error).message}` },
          { status: 400 }
        );
      }
    }

    // ایجاد رکورد در دیتابیس
    const registration = await prisma.registration.create({
      data: {
        fullName: formData.get('fullName') as string,
        nationalId,
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
  } finally {
    await prisma.$disconnect();
  }
}