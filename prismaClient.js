// prismaClient.js (robust: prefer ./generated/prisma, fall back to @prisma/client)
let PrismaClient;
try {
  PrismaClient = require('./generated/prisma').PrismaClient;
  console.log('Using Prisma Client from ./generated/prisma');
} catch (err) {
  PrismaClient = require('@prisma/client').PrismaClient;
  console.log('Using Prisma Client from @prisma/client');
}

const prisma = new PrismaClient();
module.exports = prisma;