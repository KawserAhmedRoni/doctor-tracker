import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const specialization = searchParams.get('specialization') || '';
    const hospital = searchParams.get('hospital') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { specialization: regex }, { hospital: regex }, { email: regex }];
    }

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (hospital && hospital !== 'All') {
      query.hospital = hospital;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Doctor.countDocuments(query),
    ]);

    const formattedDoctors = doctors.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      phone: doc.phone,
      email: doc.email,
      avatarUrl: doc.avatarUrl || '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
    }));

    return NextResponse.json({
      success: true,
      data: formattedDoctors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('API Error /api/doctors:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, specialization, hospital, phone, email, avatarUrl } = body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'All fields (name, specialization, hospital, phone, email) are required.' },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existing = await Doctor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A doctor with this email already exists.' },
        { status: 409 }
      );
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email: email.toLowerCase(),
      avatarUrl: avatarUrl || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doctor._id.toString(),
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
          avatarUrl: doctor.avatarUrl,
          createdAt: doctor.createdAt ? new Date(doctor.createdAt).toISOString().split('T')[0] : '',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/doctors error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

