import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/lib/models/Patient';
import Doctor from '@/lib/models/Doctor';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const condition = searchParams.get('condition') || '';
    const doctorId = searchParams.get('doctorId') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { phone: regex }, { condition: regex }, { email: regex }];
    }

    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    if (doctorId) {
      if (doctorId === 'unassigned') {
        query.assignedDoctorId = null;
      } else if (mongoose.Types.ObjectId.isValid(doctorId)) {
        query.assignedDoctorId = new mongoose.Types.ObjectId(doctorId);
      }
    }

    if (startDate || endDate) {
      query.registrationDate = {};
      if (startDate) query.registrationDate.$gte = new Date(startDate);
      if (endDate) query.registrationDate.$lte = new Date(endDate);
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('assignedDoctorId', 'name specialization hospital')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(query),
    ]);

    const formattedPatients = patients.map((p: any) => ({
      id: p._id.toString(),
      fullName: p.fullName,
      phone: p.phone,
      email: p.email || '',
      dateOfBirth: p.dateOfBirth || '',
      gender: p.gender || 'Prefer not to say',
      condition: p.condition,
      assignedDoctorId: p.assignedDoctorId ? p.assignedDoctorId._id.toString() : null,
      assignedDoctorName: p.assignedDoctorId ? p.assignedDoctorId.name : 'Unassigned',
      hospital: p.hospital || '',
      address: p.address || '',
      notes: p.notes || '',
      registrationDate: p.registrationDate ? new Date(p.registrationDate).toISOString().split('T')[0] : '',
    }));

    return NextResponse.json({
      success: true,
      data: formattedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('API Error /api/patients:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      condition,
      assignedDoctorId,
      hospital,
      address,
      notes,
    } = body;

    if (!fullName || !phone || !condition) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone, and condition are required.' },
        { status: 400 }
      );
    }

    let validDocId = null;
    if (assignedDoctorId && mongoose.Types.ObjectId.isValid(assignedDoctorId)) {
      validDocId = new mongoose.Types.ObjectId(assignedDoctorId);
    }

    const patient = await Patient.create({
      fullName,
      phone,
      email: email || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || 'Prefer not to say',
      condition,
      assignedDoctorId: validDocId,
      hospital: hospital || '',
      address: address || '',
      notes: notes || '',
      registrationDate: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: patient._id.toString(),
          fullName: patient.fullName,
          phone: patient.phone,
          email: patient.email,
          condition: patient.condition,
          assignedDoctorId: patient.assignedDoctorId ? patient.assignedDoctorId.toString() : null,
          registrationDate: new Date(patient.registrationDate).toISOString().split('T')[0],
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/patients error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

