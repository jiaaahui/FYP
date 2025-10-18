// Lightweight Prisma client wrapper that uses the generated client at ../generated/prisma
// Adjust the path if your server code sits in a different folder.
const { PrismaClient } = require('../../generated/prisma');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Avoid creating multiple clients during hot reload in development
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;