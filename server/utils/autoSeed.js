const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const ClassSchedule = require('../models/ClassSchedule');

/**
 * Independent, Idempotent Auto-Seeding System
 * Evaluates each reference collection independently on server startup.
 */
const autoSeedDB = async () => {
  if (process.env.AUTO_SEED === 'false') {
    console.log('[AutoSeed] AUTO_SEED set to false in environment. Auto-seeding disabled.');
    return;
  }

  try {
    console.log('[AutoSeed] Checking collection states...');

    // 1. Seed Trainers Independently
    const trainerCount = await Trainer.countDocuments();
    let seededTrainers = [];
    if (trainerCount === 0) {
      console.log('[AutoSeed] Trainers collection empty. Seeding default trainers...');
      seededTrainers = await Trainer.create([
        {
          name: 'Marcus Vance',
          role: 'Head Strength & Powerlifting Coach',
          specialtyCategory: 'strength',
          certifications: ['CSCS Certified', 'USAW Level 2'],
          experienceYears: 8,
          imageUrl: 'assets/images/trainer_1.jpg'
        },
        {
          name: 'Elena Rostova',
          role: 'HIIT & Metabolic Conditioning Director',
          specialtyCategory: 'hiit',
          certifications: ['NASM CPT', 'Precision Nutrition'],
          experienceYears: 6,
          imageUrl: 'assets/images/trainer_2.jpg'
        },
        {
          name: 'Derek Stone',
          role: 'Boxing & Functional Movement Coach',
          specialtyCategory: 'boxing',
          certifications: ['Golden Gloves', 'TRX Master'],
          experienceYears: 7,
          imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop'
        },
        {
          name: 'Sarah Jenkins',
          role: 'Mobility & Infrared Recovery Specialist',
          specialtyCategory: 'recovery',
          certifications: ['RYT 500 Yoga', 'FRC Mobility'],
          experienceYears: 5,
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
        }
      ]);
      console.log(`[AutoSeed] ✅ Seeded ${seededTrainers.length} Trainers.`);
    } else {
      console.log(`[AutoSeed] ℹ️ Trainers collection already populated (${trainerCount} items). Skipped.`);
      seededTrainers = await Trainer.find();
    }

    // 2. Seed Membership Plans Independently
    const planCount = await MembershipPlan.countDocuments();
    if (planCount === 0) {
      console.log('[AutoSeed] MembershipPlans collection empty. Seeding default plans...');
      const plans = await MembershipPlan.create([
        {
          name: 'Day Pass',
          slug: 'day-pass',
          monthlyPrice: 19,
          annualMonthlyPrice: 15,
          billingPeriod: 'per pass',
          features: ['Single day full facility access', 'Locker & shower room access', 'Free Wi-Fi & smoothie bar access'],
          disabledFeatures: ['Group class reservation', 'Infrared Sauna & Cryo access'],
          isPopular: false
        },
        {
          name: 'All-Access Standard',
          slug: 'all-access-standard',
          monthlyPrice: 49,
          annualMonthlyPrice: 39,
          billingPeriod: 'per month',
          features: ['24/7 Unlimited Gym Entry', 'All Group Classes Included', '1 Free Monthly PT Session', 'InBody 3D Composition Scan', 'Mobile App Workout & Macro Tracker'],
          isPopular: true,
          badgeText: 'MOST POPULAR'
        },
        {
          name: 'VIP Elite Recovery',
          slug: 'vip-elite-recovery',
          monthlyPrice: 89,
          annualMonthlyPrice: 69,
          billingPeriod: 'per month',
          features: ['Everything in Standard Plan', 'Unlimited Infrared Sauna & Cryo', '4 PT Sessions per Month', 'Unlimited Guest Passes (1 guest/visit)', 'Free Towel Service & Locker Upgrade'],
          isPopular: false
        }
      ]);
      console.log(`[AutoSeed] ✅ Seeded ${plans.length} Membership Plans.`);
    } else {
      console.log(`[AutoSeed] ℹ️ MembershipPlans collection already populated (${planCount} items). Skipped.`);
    }

    // 3. Seed Class Schedules Independently
    const scheduleCount = await ClassSchedule.countDocuments();
    if (scheduleCount === 0) {
      console.log('[AutoSeed] ClassSchedules collection empty. Seeding default schedules...');
      const marcus = seededTrainers[0] || {};
      const elena = seededTrainers[1] || {};
      const derek = seededTrainers[2] || {};
      const sarah = seededTrainers[3] || {};

      const schedules = await ClassSchedule.create([
        { className: 'Sunrise HIIT Shred', dayOfWeek: 'mon', startTime: '06:00 AM', durationMinutes: 45, trainerName: marcus.name || 'Marcus Vance', category: 'hiit', locationRoom: 'Studio A', intensityTag: 'High Intensity' },
        { className: 'Olympic Weightlifting', dayOfWeek: 'mon', startTime: '09:00 AM', durationMinutes: 60, trainerName: elena.name || 'Elena Rostova', category: 'strength', locationRoom: 'Barbell Zone', intensityTag: 'Strength' },
        { className: 'Cardio Kickboxing', dayOfWeek: 'mon', startTime: '05:30 PM', durationMinutes: 50, trainerName: derek.name || 'Derek Stone', category: 'boxing', locationRoom: 'Boxing Ring', intensityTag: 'Cardio & Agility' },
        { className: 'Infrared Mobility & Recovery', dayOfWeek: 'mon', startTime: '07:00 PM', durationMinutes: 45, trainerName: sarah.name || 'Sarah Jenkins', category: 'recovery', locationRoom: 'Zen Studio', intensityTag: 'Recovery' },
        { className: 'Metabolic Conditioning', dayOfWeek: 'tue', startTime: '07:00 AM', durationMinutes: 45, trainerName: derek.name || 'Derek Stone', category: 'hiit', locationRoom: 'Turf Area', intensityTag: 'Endurance' },
        { className: 'Pilates Core Flow', dayOfWeek: 'tue', startTime: '10:00 AM', durationMinutes: 50, trainerName: sarah.name || 'Sarah Jenkins', category: 'recovery', locationRoom: 'Studio B', intensityTag: 'Flexibility' },
        { className: 'Cross-Training WOD', dayOfWeek: 'wed', startTime: '06:00 AM', durationMinutes: 45, trainerName: elena.name || 'Elena Rostova', category: 'hiit', locationRoom: 'Turf Area', intensityTag: 'Functional' },
        { className: 'Squat & Deadlift Masterclass', dayOfWeek: 'wed', startTime: '06:30 PM', durationMinutes: 60, trainerName: marcus.name || 'Marcus Vance', category: 'strength', locationRoom: 'Power Rack Zone', intensityTag: 'Strength' }
      ]);
      console.log(`[AutoSeed] ✅ Seeded ${schedules.length} Class Schedules.`);
    } else {
      console.log(`[AutoSeed] ℹ️ ClassSchedules collection already populated (${scheduleCount} items). Skipped.`);
    }

    console.log('[AutoSeed] 🔒 User-generated collections (Bookings, Contact Messages) were skipped to preserve data privacy.');
  } catch (error) {
    console.error(`[AutoSeed Error] Auto-seeding encountered an issue: ${error.message}`);
  }
};

module.exports = autoSeedDB;
