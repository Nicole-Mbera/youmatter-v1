import db from '@/lib/db';
import bcrypt from 'bcryptjs';

const therapists = [
  {
    email: 'dr.amara@youmatter.com',
    full_name: 'Dr. Amara Okonkwo',
    password: 'TestPassword123',
    specialization: 'Anxiety & Depression',
    years_of_experience: 8,
    bio: 'Clinical psychologist specializing in anxiety disorders and depression. Compassionate, experienced, and dedicated to helping clients achieve mental wellness.',
    license_number: 'LMHC-2024-001',
    institution_name: 'Wellness Clinic Lagos',
    country: 'Nigeria',
    phone: '+234 801 234 5678',
    mission: 'To provide compassionate, evidence-based mental health care to all who seek it.',
  },
  {
    email: 'dr.kwame@youmatter.com',
    full_name: 'Dr. Kwame Mensah',
    password: 'TestPassword123',
    specialization: 'Relationships & Trauma',
    years_of_experience: 10,
    bio: 'Licensed therapist with expertise in trauma therapy and relationship counseling. Certified in EMDR and trauma-focused CBT.',
    license_number: 'LPCC-2024-002',
    institution_name: 'Healing Hearts Center',
    country: 'Ghana',
    phone: '+233 501 234 5678',
    mission: 'Empowering individuals to heal and build healthy relationships.',
  },
  {
    email: 'zainab.hassan@youmatter.com',
    full_name: 'Zainab Hassan',
    password: 'TestPassword123',
    specialization: 'Life Transitions & Career Counseling',
    years_of_experience: 6,
    bio: 'Counselor specializing in life transitions, career development, and personal growth. Passionate about helping clients navigate major life changes.',
    license_number: 'LCSW-2024-003',
    institution_name: 'Growth Pathways',
    country: 'Kenya',
    phone: '+254 701 234 5678',
    mission: 'To guide individuals through life transitions with compassion and expertise.',
  },
  {
    email: 'dr.favour@youmatter.com',
    full_name: 'Dr. Favour Adeyemi',
    password: 'TestPassword123',
    specialization: 'Child Psychology & Family Therapy',
    years_of_experience: 7,
    bio: 'Licensed psychologist specializing in child development and family dynamics. Certified play therapist with 7 years of experience.',
    license_number: 'PhD-PSY-2024-004',
    institution_name: 'Family Wellness Institute',
    country: 'Nigeria',
    phone: '+234 812 234 5678',
    mission: 'Supporting families and children for healthier, happier lives.',
  },
  {
    email: 'dr.kamau@youmatter.com',
    full_name: 'Dr. James Kamau',
    password: 'TestPassword123',
    specialization: 'Substance Abuse & Addiction',
    years_of_experience: 12,
    bio: 'Clinical psychologist with extensive experience in addiction treatment and recovery. Certified addiction counselor and interventionist.',
    license_number: 'CAC-2024-005',
    institution_name: 'Recovery Center Nairobi',
    country: 'Kenya',
    phone: '+254 712 234 5678',
    mission: 'Helping individuals overcome addiction and reclaim their lives.',
  },
];

async function seedTherapists() {
  console.log('🌱 Starting therapist seeding...');

  try {
    for (const therapist of therapists) {
      try {
        // Check if user already exists
        const existingUser = await db.execute({
          sql: 'SELECT id FROM users WHERE email = ?',
          args: [therapist.email]
        });

        if (existingUser.rows.length > 0) {
          console.log(`⏭️  User ${therapist.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(therapist.password, 10);

        // Create user with 'teacher' role
        const userResult = await db.execute({
          sql: `INSERT INTO users (email, password_hash, role, is_verified, is_active)
                VALUES (?, ?, ?, ?, ?)`,
          args: [therapist.email, hashedPassword, 'teacher', 1, 1]
        });

        const userId = (userResult as any).lastInsertRowid;
        console.log(`✅ Created user: ${therapist.email} (ID: ${userId})`);

        // Create teacher profile
        await db.execute({
          sql: `INSERT INTO teachers (
            user_id, full_name, bio, specialization, years_of_experience,
            phone, license_number, institution_name, country, contact_email, mission
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            therapist.full_name,
            therapist.bio,
            therapist.specialization,
            therapist.years_of_experience,
            therapist.phone,
            therapist.license_number,
            therapist.institution_name,
            therapist.country,
            therapist.email,
            therapist.mission
          ]
        });

        console.log(`✅ Created therapist profile: ${therapist.full_name}`);
      } catch (error) {
        console.error(`❌ Error seeding therapist ${therapist.email}:`, error);
      }
    }

    console.log('✨ Therapist seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedTherapists();
