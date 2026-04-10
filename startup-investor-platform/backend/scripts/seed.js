/**
 * Seed script — populates MongoDB with demo data
 * Run: node backend/scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const LearningResource = require('../models/LearningResource');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup_platform';

const demoStartups = [
  { name:'NeuroLend', sector:'fintech', stage:'seed', fundingRequired:500000, teamSize:6, founderExperience:7, description:'AI-powered personal lending platform that uses behavioural data and alternative credit scoring to extend credit to the underserved population. Our ML models achieve 40% lower default rates than traditional banks.', tagline:'Credit for everyone, powered by AI', aiScore:78, trustScore:72, competitionLevel:'medium', isPublished:true },
  { name:'MediScan AI', sector:'healthtech', stage:'series-a', fundingRequired:2000000, teamSize:14, founderExperience:12, description:'Computer vision platform for early cancer detection from medical imaging. Trained on 2M+ scans, our model achieves 97% accuracy — outperforming radiologists in 3 clinical trials. FDA breakthrough device designation received.', tagline:'Saving lives with computer vision', aiScore:91, trustScore:88, competitionLevel:'low', isPublished:true },
  { name:'LearnSphere', sector:'edtech', stage:'pre-seed', fundingRequired:250000, teamSize:4, founderExperience:4, description:'Adaptive learning platform for K-12 students that personalises curriculum in real-time using reinforcement learning. Teachers report 35% improvement in test scores after 90 days.', tagline:'Every child learns differently', aiScore:65, trustScore:60, competitionLevel:'high', isPublished:true },
  { name:'FarmBrain', sector:'agritech', stage:'seed', fundingRequired:750000, teamSize:8, founderExperience:9, description:'IoT + AI platform for precision farming. Soil sensors, weather integration and crop-specific ML models help farmers increase yield by 28% while reducing water usage by 40%.', tagline:'Smart farming for a hungry world', aiScore:74, trustScore:68, competitionLevel:'low', isPublished:true },
  { name:'CyberShield Pro', sector:'cybersecurity', stage:'series-a', fundingRequired:3000000, teamSize:18, founderExperience:15, description:'Zero-trust security platform using behavioural biometrics and ML anomaly detection. Detects insider threats 8x faster than signature-based systems. 120+ enterprise clients, $2M ARR.', tagline:'Security that thinks like a hacker', aiScore:87, trustScore:90, competitionLevel:'medium', isPublished:true },
  { name:'GreenChain', sector:'cleantech', stage:'seed', fundingRequired:1000000, teamSize:9, founderExperience:8, description:'Blockchain-verified carbon credit marketplace connecting corporations with certified offset projects. Real-time satellite verification eliminates greenwashing. $500K GMV in first 6 months.', tagline:'Verified carbon credits for net-zero', aiScore:76, trustScore:75, competitionLevel:'medium', isPublished:true },
];

const demoUsers = [
  { name:'Alex Chen', email:'founder@demo.com', password:'demo1234', role:'founder' },
  { name:'Sarah Williams', email:'investor@demo.com', password:'demo1234', role:'investor' },
  { name:'Admin User', email:'admin@demo.com', password:'demo1234', role:'admin' },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Clear existing demo data
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    console.log('🧹 Cleared existing demo users');

    // Create users
    const createdUsers = [];
    for (const u of demoUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
      console.log(`👤 Created user: ${u.email} (${u.role})`);
    }

    const founder = createdUsers.find(u => u.role === 'founder');
    const investor = createdUsers.find(u => u.role === 'investor');

    // Create investor profile
    await Investor.findOneAndUpdate(
      { user: investor._id },
      {
        user: investor._id,
        firmName: 'Apex Ventures',
        investorType: 'vc',
        sectors: ['fintech','healthtech','saas','ai-ml','cybersecurity'],
        preferredStages: ['seed','series-a'],
        minInvestment: 250000,
        maxInvestment: 3000000,
        totalBudget: 20000000,
        riskLevel: 'medium',
        investmentThesis: 'We invest in B2B SaaS and deep-tech startups with strong founder-market fit and early traction.',
        isAccredited: true,
        trustScore: 85,
      },
      { upsert: true, new: true }
    );
    console.log('💼 Created investor profile');

    // Create startups
    const existing = await Startup.countDocuments({ isPublished: true });
    if (existing < 3) {
      for (const s of demoStartups) {
        await Startup.create({ ...s, founder: founder._id });
      }
      console.log(`🚀 Created ${demoStartups.length} demo startups`);
    } else {
      console.log(`ℹ️  Skipped startup seed (${existing} already exist)`);
    }

    console.log('\n✅ Seed complete!\n');
    console.log('Demo Accounts:');
    console.log('  Founder:  founder@demo.com  / demo1234');
    console.log('  Investor: investor@demo.com / demo1234');
    console.log('  Admin:    admin@demo.com    / demo1234\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
