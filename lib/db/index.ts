import { createClient, Client } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// Create client
const url = process.env.TURSO_DATABASE_URL || 'file:youmatter.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const rawClient: Client = createClient({
  url,
  authToken,
});

// Retry wrapper
const client = {
  ...rawClient,
  execute: async (stmt: any) => {
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        return await rawClient.execute(stmt);
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        console.warn(`DB execute failed (attempt ${attempts}/${maxAttempts}), retrying...`, error.message);
        await new Promise(r => setTimeout(r, 1000 * attempts));
      }
    }
    throw new Error("DB Retry failed"); // Should be unreachable
  }
};

export default client;

// --- User Queries ---
export const userQueries = {
  getUserByEmail: async (email: string) => {
    const rs = await client.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
    return rs.rows[0];
  },

  getUserById: async (id: number | string) => {
    const rs = await client.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
    return rs.rows[0];
  },

  createUser: async (email: string, passwordHash: string, role: string, isVerified: number, isActive: number) => {
    const rs = await client.execute({
      sql: 'INSERT INTO users (email, password_hash, role, is_verified, is_active) VALUES (?, ?, ?, ?, ?)',
      args: [email, passwordHash, role, isVerified, isActive]
    });
    return rs;
  },

  updateUser: async (email: string, role: string, isVerified: number, isActive: number, id: number | string) => {
    const rs = await client.execute({
      sql: `UPDATE users 
            SET email = ?, role = ?, is_verified = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [email, role, isVerified, isActive, id]
    });
    return rs;
  },

  deleteUser: async (id: number | string) => {
    return await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
  },

  getUsersByRole: async (role: string) => {
    const rs = await client.execute({ sql: 'SELECT * FROM users WHERE role = ?', args: [role] });
    return rs.rows;
  },

  getAllUsers: async (limit: number, offset: number) => {
    const rs = await client.execute({
      sql: 'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      args: [limit, offset]
    });
    return rs.rows;
  },

  countUsersByRole: async (role: string) => {
    const rs = await client.execute({ sql: 'SELECT COUNT(*) as count FROM users WHERE role = ?', args: [role] });
    return rs.rows[0];
  },
};

// --- Patient Queries ---
export const patientQueries = {
  getPatientByUserId: async (userId: number | string) => {
    const rs = await client.execute({
      sql: `SELECT p.*, u.email, u.is_verified, u.is_active, u.created_at
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?`,
      args: [userId]
    });
    return rs.rows[0];
  },

  getPatientByUsername: async (username: string) => {
    const rs = await client.execute({
      sql: `SELECT p.*, u.email, u.is_verified, u.is_active, u.created_at
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE p.username = ?`,
      args: [username]
    });
    return rs.rows[0];
  },

  createPatient: async (
    userId: number | string,
    username: string,
    fullName: string | null,
    dob: string | null,
    gender: string | null,
    phone: string | null,
    profilePicture: string | null
  ) => {
    return await client.execute({
      sql: `INSERT INTO patients (user_id, username, full_name, date_of_birth, gender, phone, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, username, fullName || username, dob, gender, phone, profilePicture]
    });
  },

  updatePatient: async (
    username: string,
    fullName: string | null,
    dob: string | null,
    gender: string | null,
    phone: string | null,
    profilePicture: string | null,
    bio: string | null,
    userId: number | string
  ) => {
    return await client.execute({
      sql: `UPDATE patients
            SET username = ?, full_name = ?, date_of_birth = ?, gender = ?, phone = ?, profile_picture = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?`,
      args: [username, fullName, dob, gender, phone, profilePicture, bio, userId]
    });
  },

  checkUsernameAvailable: async (username: string) => {
    const rs = await client.execute({ sql: 'SELECT id FROM patients WHERE username = ?', args: [username] });
    return rs.rows[0];
  },
};

// --- Therapist Queries ---
export const therapistQueries = {
  getTherapistByUserId: async (userId: number | string) => {
    const rs = await client.execute({
      sql: `SELECT t.*, u.email, u.is_verified, u.is_active
            FROM therapists t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?`,
      args: [userId]
    });
    return rs.rows[0];
  },

  getTherapistById: async (id: number | string) => {
    const rs = await client.execute({
      sql: `SELECT t.*, u.email
            FROM therapists t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = ?`,
      args: [id]
    });
    return rs.rows[0];
  },

  getAllTherapists: async () => {
    const rs = await client.execute({
      sql: `SELECT t.*, u.email
            FROM therapists t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.full_name`,
      args: []
    });
    return rs.rows;
  },

  createTherapist: async (
    userId: number | string,
    fullName: string,
    bio: string | null,
    specialization: string | null,
    yearsOfExperience: number | string | null,
    phone: string | null,
    profilePicture: string | null,
    licenseNumber: string | null,
    institutionName: string | null,
    country: string | null,
    contactEmail: string | null,
    mission: string | null
  ) => {
    return await client.execute({
      sql: `INSERT INTO therapists (user_id, full_name, bio, specialization, years_of_experience, phone, profile_picture, license_number, institution_name, country, contact_email, mission)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId, fullName, bio, specialization, yearsOfExperience, phone, profilePicture,
        licenseNumber, institutionName, country, contactEmail, mission
      ]
    });
  },

  updateTherapist: async (
    fullName: string,
    bio: string | null,
    specialization: string | null,
    yearsOfExperience: number | string | null,
    phone: string | null,
    profilePicture: string | null,
    userId: number | string
  ) => {
    return await client.execute({
      sql: `UPDATE therapists 
            SET full_name = ?, bio = ?, specialization = ?, years_of_experience = ?, phone = ?, profile_picture = ?
            WHERE user_id = ?`,
      args: [fullName, bio, specialization, yearsOfExperience, phone, profilePicture, userId]
    });
  },
};

// Backward compatibility alias
export const professionalQueries = therapistQueries;

// --- Institutional Admin Queries (Deprecated) ---
export const institutionalAdminQueries = {
  getAdminByUserId: async () => null,
  createInstitutionalAdmin: async () => null,
  getAdminsByInstitution: async () => [],
};

// --- System Admin Queries ---
export const systemAdminQueries = {
  getAdminByUserId: async (userId: number | string) => {
    const rs = await client.execute({
      sql: `SELECT a.*, u.email
            FROM admins a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?`,
      args: [userId]
    });
    return rs.rows[0];
  },

  createSystemAdmin: async (userId: number | string, fullName: string, phone: string | null) => {
    return await client.execute({
      sql: `INSERT INTO admins (user_id, full_name, phone)
            VALUES (?, ?, ?)`,
      args: [userId, fullName, phone]
    });
  },

  getAllSystemAdmins: async () => {
    const rs = await client.execute({
      sql: `SELECT a.*, u.email, u.is_active
            FROM admins a
            JOIN users u ON a.user_id = u.id`,
      args: []
    });
    return rs.rows;
  },
};

// --- Activity Queries ---
export const activityQueries = {
  logActivity: async (userId: number | string, activityType: string, details: string) => {
    return await client.execute({
      sql: `INSERT INTO user_activity (user_id, activity_type, details)
            VALUES (?, ?, ?)`,
      args: [userId, activityType, details]
    });
  },

  getRecentActivities: async (limit: number, offset: number) => {
    const rs = await client.execute({
      sql: `SELECT ua.*, u.email
            FROM user_activity ua
            JOIN users u ON ua.user_id = u.id
            ORDER BY ua.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [limit, offset]
    });
    return rs.rows;
  },

  getUserGrowthStats: async () => {
    const rs = await client.execute({
      sql: `SELECT 
              role,
              DATE(created_at) as date,
              COUNT(*) as count
            FROM users
            WHERE created_at >= date('now', '-30 days')
            GROUP BY role, DATE(created_at)
            ORDER BY date DESC`,
      args: []
    });
    return rs.rows;
  },
};

export async function initializeDatabase() {
  console.warn("initializeDatabase called - manual migration recommended for Turso/LibSQL");
}
