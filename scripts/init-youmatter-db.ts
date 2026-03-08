import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.env.TURSO_DATABASE_URL || 'file:youmatter.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

async function initializeDatabase() {
  try {
    console.log('🗂️  Initializing You Matter database...\n');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../lib/db/schema-youmatter.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await client.execute(statement);
    }

    console.log('✅ Database schema created successfully!\n');

    // Add seed data
    console.log('🌱 Adding seed data...\n');

    // Create test patient
    const patientPasswordHash = bcrypt.hashSync('testpatient123', 10);
    const patientUserResult = await client.execute({
      sql: `INSERT INTO users (email, password_hash, role, is_verified, is_active) 
            VALUES (?, ?, ?, ?, ?)`,
      args: ['patient@youmatter.com', patientPasswordHash, 'patient', 1, 1],
    });

    await client.execute({
      sql: `INSERT INTO patients (user_id, username, full_name, date_of_birth, gender, phone, bio, english_proficiency) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        1,
        'testpatient',
        'Jane Doe',
        '1995-05-15',
        'female',
        '+1234567890',
        'Looking for therapy support',
        'fluent',
      ],
    });

    console.log('✓ Test patient created:');
    console.log('  Email: patient@youmatter.com');
    console.log('  Password: testpatient123\n');

    // Create multiple test therapists
    const therapists = [
      {
        email: 'dr.amara@youmatter.com',
        name: 'Dr. Amara Okonkwo',
        specialization: 'Anxiety & Depression',
        experience: 8,
        country: 'Nigeria',
        license: 'LIC-001-2024',
        fee: 80,
      },
      {
        email: 'dr.kwame@youmatter.com',
        name: 'Dr. Kwame Mensah',
        specialization: 'Relationships & Trauma',
        experience: 10,
        country: 'Ghana',
        license: 'LIC-002-2024',
        fee: 75,
      },
      {
        email: 'zainab.hassan@youmatter.com',
        name: 'Zainab Hassan',
        specialization: 'Life Transitions',
        experience: 6,
        country: 'Kenya',
        license: 'LIC-003-2024',
        fee: 70,
      },
    ];

    for (let i = 0; i < therapists.length; i++) {
      const therapist = therapists[i];
      const passwordHash = bcrypt.hashSync('testtherapist123', 10);

      await client.execute({
        sql: `INSERT INTO users (email, password_hash, role, is_verified, is_active) 
              VALUES (?, ?, ?, ?, ?)`,
        args: [therapist.email, passwordHash, 'therapist', 1, 1],
      });

      await client.execute({
        sql: `INSERT INTO therapists 
              (user_id, full_name, specialization, years_of_experience, license_number, 
               country, consultation_fee, is_verified, verification_status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          i + 2,
          therapist.name,
          therapist.specialization,
          therapist.experience,
          therapist.license,
          therapist.country,
          therapist.fee,
          1,
          'approved',
        ],
      });
    }

    console.log('✓ Test therapists created:');
    for (let i = 0; i < therapists.length; i++) {
      console.log(`  ${i + 1}. ${therapists[i].email}`);
      console.log(`     Name: ${therapists[i].name}`);
      console.log(`     Password: testtherapist123\n`);
    }

    // Add sample education resources
    await client.execute({
      sql: `INSERT INTO education_resources (title, description, category, author) 
            VALUES (?, ?, ?, ?)`,
      args: [
        'Understanding Anxiety',
        'A comprehensive guide to managing anxiety in daily life',
        'mental-health',
        'Dr. Amara Okonkwo',
      ],
    });

    await client.execute({
      sql: `INSERT INTO education_resources (title, description, category, author) 
            VALUES (?, ?, ?, ?)`,
      args: [
        'Building Healthy Relationships',
        'Learn communication skills for better relationships',
        'relationships',
        'Dr. Kwame Mensah',
      ],
    });

    console.log('✓ Sample education resources created\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ Database initialization complete!');
    console.log('═══════════════════════════════════════════\n');

    console.log('📋 Test Credentials:');
    console.log('─────────────────────');
    console.log('\n👤 Patient Account:');
    console.log('   Email: patient@youmatter.com');
    console.log('   Password: testpatient123');
    console.log('\n👨‍⚕️  Therapist Accounts:');
    for (const therapist of therapists) {
      console.log(`   ${therapist.email}`);
    }
    console.log('   Password (all): testtherapist123');
    console.log('\n✨ Database is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
