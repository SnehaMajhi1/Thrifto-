require('dotenv').config();
const { listClothes } = require('./src/controllers/clothesController');
const { connectDB } = require('./src/config/db');

async function test() {
  await connectDB();
  const req = { query: {} };
  const res = {
    status: (code) => ({
      json: (data) => console.log('STATUS:', code, 'DATA:', JSON.stringify(data, null, 2))
    })
  };
  await listClothes(req, res);
  process.exit();
}
test();
