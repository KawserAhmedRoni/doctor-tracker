import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/lib/models/Patient';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Patient ID' }, { status: 400 });
    }

    const patient = await Patient.findById(id).populate('assignedDoctorId', 'name specialization hospital phone email avatarUrl').lean();
    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: (patient as any)._id.toString(),
        fullName: (patient as any).fullName,
        phone: (patient as any).phone,
        email: (patient as any).email || '',
        dateOfBirth: (patient as any).dateOfBirth || '',
        gender: (patient as any).gender || 'Prefer not to say',
        condition: (patient as any).condition,
        assignedDoctorId: (patient as any).assignedDoctorId ? (patient as any).assignedDoctorId._id.toString() : null,
        assignedDoctor: (patient as any).assignedDoctorId
          ? {
              id: (patient as any).assignedDoctorId._id.toString(),
              name: (patient as any).assignedDoctorId.name,
              specialization: (patient as any).assignedDoctorId.specialization,
              hospital: (patient as any).assignedDoctorId.hospital,
              phone: (patient as any).assignedDoctorId.phone,
              email: (patient as any).assignedDoctorId.email,
              avatarUrl: (patient as any).assignedDoctorId.avatarUrl,
            }
          : null,
        hospital: (patient as any).hospital || '',
        address: (patient as any).address || '',
        notes: (patient as any).notes || '',
        registrationDate: (patient as any).registrationDate ? new Date((patient as any).registrationDate).toISOString().split('T')[0] : '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Patient ID' }, { status: 400 });
    }

    let validDocId = body.assignedDoctorId;
    if (validDocId && mongoose.Types.ObjectId.isValid(validDocId)) {
      validDocId = new mongoose.Types.ObjectId(validDocId);
    } else {
      validDocId = null;
    }

    const updated = await Patient.findByIdAndUpdate(
      id,
      {
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        condition: body.condition,
        assignedDoctorId: validDocId,
        hospital: body.hospital,
        address: body.address,
        notes: body.notes,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email,
        condition: updated.condition,
        assignedDoctorId: updated.assignedDoctorId ? updated.assignedDoctorId.toString() : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Patient ID' }, { status: 400 });
    }

    const deleted = await Patient.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patient record deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

