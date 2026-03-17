import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.model.js';
import WorkerProfile from './models/WorkerProfile.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kaamlink';

// Central Point: India (Nagpur approx center, or New Delhi)
// We'll use New Delhi for this mock data: Lat: 28.6139, Lng: 77.2090
const CENTER_LAT = 28.6139;
const CENTER_LNG = 77.2090;

const skills = [
  'plumber', 'electrician', 'maid', 'cook', 'driver',
  'carpenter', 'painter', 'ac_technician', 'gardener',
  'security_guard', 'babysitter', 'elder_care', 'delivery'
];

const firstNames = ['Amit', 'Priya', 'Raj', 'Sneha', 'Vikram', 'Anjali', 'Deepak', 'Kavita', 'Suresh', 'Pooja', 'Rahul', 'Neha'];
const lastNames = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Patel', 'Kumar', 'Das', 'Roy'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random coordinates within ~15km radius of the center point
function generateRandomLocation(baseLat, baseLng, radiusInKm = 15) {
  const rInDegrees = radiusInKm / 111.32; // roughly 111km per degree
  const u = Math.random();
  const v = Math.random();
  const w = rInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust the x-coordinate for the shrinking of the east-west distances
  const newLng = x / Math.cos((baseLat * Math.PI) / 180) + baseLng;
  const newLat = y + baseLat;
  return [newLng, newLat]; // GeoJSON format: [longitude, latitude]
}

async function seedWorkers(count = 20) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Purging old mock workers...');

    // Clear old workers matching phone pattern to re-run safely
    const oldUsers = await User.find({ phone: /^999\d{7}$/ });
    for (const u of oldUsers) {
      await WorkerProfile.deleteOne({ userId: u._id });
      await User.deleteOne({ _id: u._id });
    }

    console.log('Generating new mock workers...');
    const hashedPwd = await bcrypt.hash('Password@123', 10);

    for (let i = 0; i < count; i++) {
      const fName = firstNames[getRandomInt(0, firstNames.length - 1)];
      const lName = lastNames[getRandomInt(0, lastNames.length - 1)];
      const primarySkill = skills[getRandomInt(0, skills.length - 1)];
      const coordinates = generateRandomLocation(CENTER_LAT, CENTER_LNG, 15);
      const phone = `999${i.toString().padStart(7, '0')}`;

      const user = await User.create({
        fullName: `${fName} ${lName}`,
        phone,
        email: `mock${i}@example.com`,
        password: hashedPwd,
        role: 'worker',
        isActive: true,
        verificationStatus: 'verified',
        address: {
          city: 'New Delhi',
          pincode: '110001',
          coordinates: {
            type: 'Point',
            coordinates: coordinates
          }
        },
        // Mocks for KYC to be considered "ProfileComplete"
        aadhaarNumber: '123456789012',
        bankAccount: {
          holderName: `${fName} ${lName}`,
          accountNumber: '123456789012',
          ifsc: 'SBIN0001234'
        }
      });

      const workerProfile = await WorkerProfile.create({
        userId: user._id,
        primarySkill,
        experienceYears: getRandomInt(1, 15),
        isOnline: true, // Crucial for map visibility
        isProfileComplete: true, // Crucial for map visibility
        wageRate: {
          amount: getRandomInt(300, 1500),
          unit: 'per_day'
        },
        languages: ['Hindi', 'English'],
        availability: {
          isAvailable: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          availableTimeStart: '08:00',
          availableTimeEnd: '20:00'
        },
        stats: {
          averageRating: (Math.random() * (5 - 3) + 3).toFixed(1), // Random 3.0 to 5.0
          totalJobsCompleted: getRandomInt(0, 50)
        }
      });

      // Link back to user
      await User.updateOne({ _id: user._id }, { $set: { workerProfile: workerProfile._id } });
      console.log(`Created  Worker ${i + 1}/${count} - ${primarySkill} at [${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}]`);
    }

    console.log('\n✅ Seeding complete! You can now test the Map feature around New Delhi.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedWorkers();
