import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { available: false, error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { available: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;

    return NextResponse.json({
      available: !existingUser,
      error: existingUser ? 'Email sudah terdaftar' : null
    });

  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { available: false, error: 'Gagal memeriksa email' },
      { status: 500 }
    );
  }
}
