import { prisma } from './src/config/db.js';
console.log('Connecting...');
try {
  await prisma.user.findFirst();
  console.log('Success!');
} catch (err) {
  console.error('Error occurred in findFirst:', err.stack || err);
}
