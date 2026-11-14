import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Both email and password are required.' },
        { status: 400 }
      );
    }

    await connectDB();
    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'No user registered with this email address.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication service error.' },
      { status: 500 }
    );
  }
}
