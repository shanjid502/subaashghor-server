import config from '../config';
import { UserModel } from '../modules/Auth/auth.model';

export const seedSuperAdmin = async () => {
  const email = config.super_admin_email;
  const phone = config.super_admin_phone;
  const password = config.super_admin_pass;

  if (!email || !phone || !password) {
    console.log('⚠️ Super admin credentials are not fully configured in the environment variables. Skipping seed.');
    return;
  }

  try {
    const existingAdmin = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingAdmin) {
      const adminName = (config.super_admin_name || 'Super Admin').replace(/['"]/g, '').trim();
      if (existingAdmin.name !== adminName) {
        existingAdmin.name = adminName;
        await existingAdmin.save();
        console.log(`✨ Updated existing Super Admin name to: "${adminName}"`);
      } else {
        console.log('✨ Super admin already exists in the database. Skipping seed.');
      }
      return;
    }

    const adminName = (config.super_admin_name || 'Super Admin').replace(/['"]/g, '').trim();

    await UserModel.create({
      name: adminName,
      email,
      phone,
      passwordHash: password, // Mongoose pre-save hook will hash this
      role: 'admin',
    });

    console.log('🚀 Super admin seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
  }
};
