#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building aplikasi untuk deployment cPanel...\n');

try {
  // 1. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // 2. Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npm run prisma:generate', { stdio: 'inherit' });

  // 3. Build aplikasi
  console.log('🏗️  Building aplikasi...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Cek apakah build berhasil
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    throw new Error('Build gagal: folder .next tidak ditemukan');
  }

  const buildId = path.join(nextDir, 'BUILD_ID');
  if (!fs.existsSync(buildId)) {
    throw new Error('Build gagal: BUILD_ID tidak ditemukan');
  }

  console.log('✅ Build berhasil!');
  console.log('\n📋 Files yang perlu di-upload ke cPanel:');
  console.log('   ✓ .next/ folder');
  console.log('   ✓ app/ folder');
  console.log('   ✓ components/ folder');
  console.log('   ✓ lib/ folder');
  console.log('   ✓ public/ folder');
  console.log('   ✓ prisma/ folder');
  console.log('   ✓ package.json');
  console.log('   ✓ package-lock.json');
  console.log('   ✓ server.js');
  console.log('   ✓ next.config.js');
  console.log('   ✓ middleware.ts');
  console.log('   ✓ global.d.ts');
  console.log('   ✓ .env.production');

  console.log('\n⚠️  Jangan lupa:');
  console.log('   1. Set NODE_ENV=production di cPanel');
  console.log('   2. Set database URL dan secrets');
  console.log('   3. Install dependencies di server: npm install --production');
  console.log('   4. Restart aplikasi Node.js');

} catch (error) {
  console.error('❌ Build gagal:', error.message);
  process.exit(1);
}