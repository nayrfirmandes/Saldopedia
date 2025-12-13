import { NextRequest, NextResponse } from 'next/server';
import { checkDuplicatePhone, validatePhoneNumber } from '@/lib/security/transaction-security';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ available: true });
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { available: false, error: phoneValidation.error },
        { status: 400 }
      );
    }

    const phoneExists = await checkDuplicatePhone(phone);

    return NextResponse.json({
      available: !phoneExists,
      error: phoneExists ? 'Nomor telepon sudah terdaftar' : null
    });

  } catch (error) {
    console.error('Check phone error:', error);
    return NextResponse.json(
      { available: false, error: 'Gagal memeriksa nomor telepon' },
      { status: 500 }
    );
  }
}
