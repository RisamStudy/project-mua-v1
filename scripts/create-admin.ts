// my-app/scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Data admin
    const adminData = {
      username: 'admin',
      email: 'admin@roromua.com',
      password: 'admin123', // Ganti dengan password yang aman
      name: 'Administrator',
      role: 'admin',
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      }
    });

    if (existingUser) {
      console.log('User already exists!');
      console.log('Username:', existingUser.username);
      console.log('Email:', existingUser.email);
      return;
    }

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role,
      },
    });

    console.log('Admin user created successfully!');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Password:', adminData.password);
    console.log('\nPlease change the password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();