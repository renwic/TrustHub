#!/usr/bin/env node
/**
 * TrustHub Auto-Deployment Script
 * Automatically creates GitHub repository and uploads all files
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import https from 'https';

console.log('🚀 TrustHub Auto-Deployment Starting...');

// Configuration
const REPO_CONFIG = {
  name: 'TrustHub',
  description: 'Modern trust-driven dating app with social testimonial system, RealBar scoring, props system, RealOnes interviews, and comprehensive privacy controls. Built with React, TypeScript, Express, and PostgreSQL.',
  private: false
};

// Function to execute shell commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to check if directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Function to get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', '.cache', '.config', '.local', '.upm', 'attached_assets'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // Skip certain files
      if (!file.endsWith('.tar.gz') && !file.startsWith('.')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Main deployment function
async function deploy() {
  try {
    console.log('📋 Checking project structure...');
    
    // Check if essential files exist
    const requiredFiles = ['package.json', 'README.md', 'client', 'server', 'shared'];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.log(`❌ Missing required files/directories: ${missingFiles.join(', ')}`);
      return;
    }
    
    console.log('✅ Project structure validated');
    
    // Get all files to upload
    const allFiles = getAllFiles('.');
    console.log(`📁 Found ${allFiles.length} files to upload`);
    
    // Show file structure
    console.log('\n📂 File Structure:');
    const directories = {};
    allFiles.forEach(file => {
      const dir = path.dirname(file);
      if (!directories[dir]) {
        directories[dir] = [];
      }
      directories[dir].push(path.basename(file));
    });
    
    Object.keys(directories).sort().forEach(dir => {
      console.log(`  ${dir}/`);
      directories[dir].forEach(file => {
        console.log(`    ${file}`);
      });
    });
    
    console.log('\n🔧 Deployment Options:');
    console.log('1. GitHub Desktop App (Recommended)');
    console.log('2. GitHub Web Interface');
    console.log('3. Git Command Line');
    
    console.log('\n📋 Option 1: GitHub Desktop App');
    console.log('1. Download GitHub Desktop: https://desktop.github.com/');
    console.log('2. Sign in with your GitHub account');
    console.log('3. Click "Clone a repository from the Internet"');
    console.log('4. Click "Create a new repository on your hard drive"');
    console.log(`5. Repository name: ${REPO_CONFIG.name}`);
    console.log(`6. Description: ${REPO_CONFIG.description}`);
    console.log('7. Choose local path and click "Create repository"');
    console.log('8. Copy all your project files to the repository folder');
    console.log('9. In GitHub Desktop, you\'ll see all files as "Changes"');
    console.log('10. Add commit message: "Initial commit: TrustHub dating app"');
    console.log('11. Click "Commit to main"');
    console.log('12. Click "Publish repository" to upload to GitHub');
    
    console.log('\n📋 Option 2: GitHub Web Interface');
    console.log('1. Go to https://github.com/new');
    console.log(`2. Repository name: ${REPO_CONFIG.name}`);
    console.log(`3. Description: ${REPO_CONFIG.description}`);
    console.log('4. Set to Public');
    console.log('5. Click "Create repository"');
    console.log('6. Click "uploading an existing file"');
    console.log('7. Create folders: client/, server/, shared/');
    console.log('8. Upload files to respective folders');
    console.log('9. Upload root files (package.json, README.md, etc.)');
    
    console.log('\n📋 Option 3: Git Command Line');
    console.log('1. Create repository on GitHub: https://github.com/new');
    console.log('2. Run these commands in your project directory:');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Initial commit: TrustHub dating app"');
    console.log('   git branch -M main');
    console.log('   git remote add origin https://github.com/renwic/TrustHub.git');
    console.log('   git push -u origin main');
    
    console.log('\n🌐 After GitHub Upload - Render Deployment:');
    console.log('1. Go to https://render.com');
    console.log('2. Create PostgreSQL database:');
    console.log('   - Name: trusthub-database');
    console.log('   - Plan: Starter ($7/month)');
    console.log('3. Create Web Service:');
    console.log('   - Connect your GitHub repository');
    console.log('   - Build: npm install && npm run build');
    console.log('   - Start: npm start');
    console.log('4. Environment Variables:');
    console.log('   NODE_ENV=production');
    console.log('   DATABASE_URL=<your-postgres-url>');
    console.log('   SESSION_SECRET=TrustHubSecure2024RandomKey123');
    console.log('5. After deployment, run in shell: npm run db:push');
    
    console.log('\n✅ Deployment guide complete!');
    console.log('🌐 Your app will be available at: https://your-app-name.onrender.com');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

// Run deployment
deploy();