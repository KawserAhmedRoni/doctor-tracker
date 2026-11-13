import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Doctor ID' }, { status: 400 });
    }

    const doctor = await Doctor.findById(id).lean();
    if (!doctor) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }

    const patients = await Patient.find({ assignedDoctorId: doctor._id }).sort({ registrationDate: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        id: (doctor as any)._id.toString(),
        name: (doctor as any).name,
        specialization: (doctor as any).specialization,
        hospital: (doctor as any).hospital,
        phone: (doctor as any).phone,
        email: (doctor as any).email,
        avatarUrl: (doctor as any).avatarUrl || '',
        createdAt: (doctor as any).createdAt ? new Date((doctor as any).createdAt).toISOString().split('T')[0] : '',
        patients: patients.map((p: any) => ({
          id: p._id.toString(),
          fullName: p.fullName,
          phone: p.phone,
          email: p.email,
          condition: p.condition,
          registrationDate: p.registrationDate ? new Date(p.registrationDate).toISOString().split('T')[0] : '',
        })),
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
      return NextResponse.json({ success: false, error: 'Invalid Doctor ID' }, { status: 400 });
    }

    const updated = await Doctor.findByIdAndUpdate(
      id,
      {
        name: body.name,
        specialization: body.specialization,
        hospital: body.hospital,
        phone: body.phone,
        email: body.email ? body.email.toLowerCase() : undefined,
        avatarUrl: body.avatarUrl,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        specialization: updated.specialization,
        hospital: updated.hospital,
        phone: updated.phone,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString().split('T')[0] : '',
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
      return NextResponse.json({ success: false, error: 'Invalid Doctor ID' }, { status: 400 });
    }

    const deleted = await Doctor.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Doctor not found' }, { status: 404 });
    }

    // Per spec: Unassign patients whose doctor is deleted
    await Patient.updateMany({ assignedDoctorId: deleted._id }, { $set: { assignedDoctorId: null } });

    return NextResponse.json({
      success: true,
      message: 'Doctor removed successfully and associated patients set to unassigned.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

