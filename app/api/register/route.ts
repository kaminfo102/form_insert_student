import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Handle profile image upload
    const profileImage = formData.get('profileImage') as File;
    let profileImagePath = '';
    if (profileImage) {
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `profile-${Date.now()}-${profileImage.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      profileImagePath = `/uploads/${fileName}`;
    }
    
    // Handle receipt uploads
    const receiptFiles = formData.getAll('receipts') as File[];
    const receiptPaths: string[] = [];
    
    for (const receipt of receiptFiles) {
      const bytes = await receipt.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `receipt-${Date.now()}-${receipt.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      receiptPaths.push(`/uploads/${fileName}`);
    }

    // Create registration record
    const registration = await prisma.registration.create({
      data: {
        fullName: formData.get('fullName') as string,
        nationalId: formData.get('nationalId') as string,
        // birthDate: formData.get('birthDate') as string,
        birthDate: new Date(formData.get('birthDate') as string),
        city: formData.get('city') as string,
        level: formData.get('level') as string,
        // level: parseInt(formData.get('level') as string),
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