require('dotenv').config();
const { connectDB } = require('./src/config/db');
const Clothes = require('./src/models/Clothes');
const User = require('./src/models/User');

async function run() {
  try {
    await connectDB();
    const items = await Clothes.find({})
      .populate('seller', 'name email profilePicture')
      .limit(20)
      .skip(0)
      .sort('-createdAt');
    console.log('Success, found items:', items.length);
  } catch(e) {
    console.error('Stack:', e.stack);
  } finally {
    process.exit();
  }
}
run();
