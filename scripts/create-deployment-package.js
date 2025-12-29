#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Membuat LEAN deployment package untuk cPanel...\n');

try {
  // Pastikan build sudah ada
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('❌ Folder .next tidak ditemukan. Jalankan build terlebih dahulu:');
    console.log('   npm run build:cpanel');
    process.exit(1);
  }

  // Buat folder deployment
  const deployDir = path.join(process.cwd(), 'production-deploy');
  if (fs.existsSync(deployDir)) {
    console.log('🗑️  Menghapus deployment package lama...');
    fs.rmSync(deployDir, { recursive: true, force: true });
  }

  fs.mkdirSync(deployDir);
  console.log('📁 Membuat LEAN production deployment package...');

  // HANYA files yang WAJIB untuk production
  const productionFiles = [
    '.next',           // Build output
    'app',             // Next.js app directory
    'components',      // React components
    'lib',             // Utilities
    'public',          // Static assets
    'prisma',          // Database
    'package.json',    // Dependencies
    'package-lock.json', // Lock file
    'server.js',       // Custom server
    'next.config.js',  // Next config
    'middleware.ts',   // Middleware
    'global.d.ts'      // Types
  ];

  productionFiles.forEach(file => {
    const srcPath = path.join(process.cwd(), file);
    const destPath = path.join(deployDir, file);
    
    if (fs.existsSync(srcPath)) {
      console.log(`   ✓ ${file}`);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } else {
      console.log(`   ⚠️  ${file} tidak ditemukan, skip...`);
    }
  });

  // Copy .env.production sebagai .env
  const envProd = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(envProd)) {
    console.log('   ✓ .env.production → .env');
    fs.copyFileSync(envProd, path.join(deployDir, '.env'));
  }

  // Hitung ukuran
  const deploySize = getFolderSize(deployDir);
  const originalSize = getFolderSize(process.cwd()) - getFolderSize(path.join(process.cwd(), 'node_modules'));

  console.log('\n✅ LEAN deployment package siap!');
  console.log(`📁 Folder: ${deployDir}`);
  console.log(`📊 Ukuran: ${(deploySize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎯 Penghematan: ${(((originalSize - deploySize) / originalSize) * 100).toFixed(1)}%`);

  console.log('\n📋 Upload ke cPanel:');
  console.log('   1. Compress folder production-deploy');
  console.log('   2. Upload & extract di cPanel');
  console.log('   3. npm install --production');
  console.log('   4. Set environment variables');
  console.log('   5. Restart Node.js app');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getFolderSize(folderPath) {
  if (!fs.existsSync(folderPath)) return 0;
  
  let size = 0;
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      size += getFolderSize(itemPath);
    } else {
      size += fs.statSync(itemPath).size;
    }
  }
  
  return size;
}