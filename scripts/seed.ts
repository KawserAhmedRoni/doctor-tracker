import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/mongodb';
import Doctor from '../lib/models/Doctor';
import Patient from '../lib/models/Patient';
import User from '../lib/models/User';
import { INITIAL_DOCTORS, INITIAL_PATIENTS } from '../src/data/mockData';

async function seed() {
  console.log('--- Starting Database Seeding ---');
  await connectDB();

  console.log('Clearing old collections...');
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await User.deleteMany({});

  // 1. Create Default Admin
  console.log('Creating Admin User...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Morgan Reed',
    email: 'admin@doctortracker.health',
    password: hashedPassword,
    role: 'admin',
  });
  console.log('Admin user created: admin@doctortracker.health / admin123');

  // 2. Insert Doctors and keep a map from old id -> new ObjectId
  console.log('Seeding Doctors...');
  const doctorIdMap = new Map<string, mongoose.Types.ObjectId>();

  for (const doc of INITIAL_DOCTORS) {
    const created = await Doctor.create({
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      phone: doc.phone,
      email: doc.email,
      avatarUrl: doc.avatarUrl,
      createdAt: new Date(doc.createdAt || '2026-01-01'),
    });
    doctorIdMap.set(doc.id, created._id as mongoose.Types.ObjectId);
  }
  console.log(`Inserted ${INITIAL_DOCTORS.length} doctors into MongoDB Atlas!`);

  // 3. Insert Patients with mapped assignedDoctorId
  console.log('Seeding Patients...');
  const patientDocs = INITIAL_PATIENTS.map((p) => {
    const mappedDoctorId = p.assignedDoctorId ? doctorIdMap.get(p.assignedDoctorId) || null : null;
    return {
      fullName: p.fullName,
      phone: p.phone,
      email: p.email || '',
      dateOfBirth: p.dateOfBirth || '',
      gender: p.gender || 'Prefer not to say',
      condition: p.condition,
      assignedDoctorId: mappedDoctorId,
      hospital: p.hospital || '',
      address: p.address || '',
      notes: p.notes || '',
      registrationDate: new Date(p.registrationDate || Date.now()),
    };
  });

  await Patient.insertMany(patientDocs);
  console.log(`Inserted ${patientDocs.length} patients into MongoDB Atlas!`);

  console.log('--- Database Seeding Completed Successfully! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

