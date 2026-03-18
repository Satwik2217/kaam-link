import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.model.js';

dotenv.config();

const main = async () => {
  await connectDB();
  const user = await User.findOne({ phone: '9876543211' }).select('+aadhaarNumber +bankAccount.holderName +bankAccount.accountNumber +bankAccount.ifsc +bankAccount.upiId').lean();
  console.log('user doc:', JSON.stringify(user, null, 2));
  process.exit(0);
};

main();
