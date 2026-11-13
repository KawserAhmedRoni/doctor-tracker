import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';

export async function GET() {
  try {
    await connectDB();

    const [totalDoctors, totalPatients, patientsPerDoctorAgg, conditionDistributionAgg] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      // Patients count grouped by doctor
      Doctor.aggregate([
        {
          $lookup: {
            from: 'patients',
            localField: '_id',
            foreignField: 'assignedDoctorId',
            as: 'patients',
          },
        },
        {
          $project: {
            name: 1,
            specialization: 1,
            patientCount: { $size: '$patients' },
          },
        },
        { $sort: { patientCount: -1 } },
        { $limit: 8 },
      ]),
      // Condition breakdown
      Patient.aggregate([
        {
          $group: {
            _id: '$condition',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const unassignedCount = await Patient.countDocuments({ assignedDoctorId: null });

    return NextResponse.json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        unassignedPatients: unassignedCount,
        patientsPerDoctor: patientsPerDoctorAgg.map((d: any) => ({
          doctorId: d._id.toString(),
          name: d.name,
          specialization: d.specialization,
          count: d.patientCount,
        })),
        conditionDistribution: conditionDistributionAgg.map((c: any) => ({
          condition: c._id || 'Unknown',
          count: c.count,
        })),
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

