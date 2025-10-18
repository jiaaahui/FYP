// server/prismaClient.js
// Single Prisma client instance.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;