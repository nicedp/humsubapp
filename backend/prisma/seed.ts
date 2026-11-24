import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Society Master (id=1) ───────────────────────────────────────────────
  await (prisma as any).society.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Green Valley Residential Society',
      address: '123 Society Road, City - 400001',
      registrationNumber: 'MH/SOC/2024/001',
      contactEmail: 'admin@greenvalley.in',
      contactPhone: '+91-9000000000',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      status: 'active',           // Sprint 4: explicit active status (keeps id=1 unbroken)
      societyUrl: 'default-society',   // Sprint 8: account-based login (slug)
      accountNumber: '2026011001',     // Sprint 8: YYYYMMNNN format, counter starts at 1001
    },
  });
  // Advance the societies_id_seq past id=1 so future INSERTs don't conflict.
  // This is required because upsert with explicit id=1 does NOT advance the SERIAL sequence.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"societies"', 'id'), GREATEST((SELECT MAX(id) FROM societies), 1))`
  );
  console.log('✅ Society master seeded (id=1)');

  // ─── Society Settings (EAV — societyId=1) ────────────────────────────────
  const defaultSettings: Array<{ varName: string; varValue: string }> = [
    { varName: 'rate_per_sqft',       varValue: '1.0' },
    { varName: 'fixed_charge',        varValue: '700.0' },
    { varName: 'late_fee_grace_days', varValue: '10' },
    { varName: 'late_fee_per_day',    varValue: '10.0' },
    { varName: 'society_name',        varValue: 'Green Valley Residential Society' },
    { varName: 'address',             varValue: '123 Society Road, City - 400001' },
    { varName: 'bill_vacant_flats',   varValue: 'false' },
    { varName: 'require_2fa',         varValue: 'false' },
    { varName: 'bank_name',           varValue: '' },
    { varName: 'bank_account_number', varValue: '' },
    { varName: 'bank_ifsc',           varValue: '' },
    { varName: 'upi_id',              varValue: '' },
  ];

  for (const setting of defaultSettings) {
    await prisma.societySetting.upsert({
      where: { societyId_varName: { societyId: 1, varName: setting.varName } },
      update: {},
      create: { societyId: 1, varName: setting.varName, varValue: setting.varValue },
    });
  }
  console.log('✅ Society settings seeded (EAV)');

  // ─── Default Admin User ───────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await (prisma as any).user.upsert({
    where: { societyId_username: { societyId: 1, username: 'admin' } },
    update: {},
    create: {
      societyId: 1,
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('✅ Admin user seeded (username: admin, password: Admin@123)');

  // ─── Parking Slots (40 slots: P-001 to P-040) ────────────────────────────
  const parkingCount = await prisma.parkingSlot.count({ where: { societyId: 1 } });
  if (parkingCount === 0) {
    const parkingData = Array.from({ length: 40 }, (_, i) => ({
      societyId: 1,
      slotNumber: `P-${String(i + 1).padStart(3, '0')}`,
      isOccupied: false,
    }));
    await prisma.parkingSlot.createMany({ data: parkingData });
    console.log('✅ 40 parking slots seeded (P-001 to P-040)');
  } else {
    console.log('⏭️  Parking slots already exist, skipping');
  }

  // ─── Assets (lifts, borewell, water tank) ────────────────────────────────
  const assetCount = await prisma.asset.count({ where: { societyId: 1 } });
  if (assetCount === 0) {
    await prisma.asset.createMany({
      data: [
        {
          societyId: 1,
          name: 'Lift A',
          type: 'lift',
          status: 'operational',
          location: 'Block A - Main Entrance',
        },
        {
          societyId: 1,
          name: 'Lift B',
          type: 'lift',
          status: 'operational',
          location: 'Block B - Main Entrance',
        },
        {
          societyId: 1,
          name: 'Borewell',
          type: 'borewell',
          status: 'operational',
          location: 'Ground Floor - Rear',
        },
        {
          societyId: 1,
          name: 'Water Tank',
          type: 'water_tank',
          status: 'operational',
          location: 'Terrace Level',
        },
      ],
    });
    console.log('✅ Assets seeded (2 lifts, 1 borewell, 1 water tank)');
  } else {
    console.log('⏭️  Assets already exist, skipping');
  }

  // ─── Block A (default block for all existing flats) ──────────────────────
  const blockA = await prisma.block.upsert({
    where: { societyId_name: { societyId: 1, name: 'Block A' } },
    update: {},
    create: {
      societyId: 1,
      name: 'Block A',
      description: 'Main residential block',
      blockType: 'flats',
      totalFloors: 5,
      isActive: true,
    },
  });
  console.log(`✅ Block A seeded (id: ${blockA.id})`);

  // ─── Flats (F1-01 to F4-12 = 48 flats, PH-01 and PH-02) ─────────────────
  const flatCount = await prisma.flat.count({ where: { societyId: 1 } });
  if (flatCount === 0) {
    const flatsData: Array<{
      societyId: number;
      blockId: string;
      flatNumber: string;
      floor: number;
      type: 'flat' | 'penthouse';
      sqFt: number;
      status: 'vacant';
    }> = [];

    // Floors 1-4: 12 flats each
    for (let floor = 1; floor <= 4; floor++) {
      for (let unit = 1; unit <= 12; unit++) {
        flatsData.push({
          societyId: 1,
          blockId: blockA.id,
          flatNumber: `F${floor}-${String(unit).padStart(2, '0')}`,
          floor,
          type: 'flat' as any,
          sqFt: 1000.0,
          status: 'vacant' as const,
        });
      }
    }

    // Floor 5: 2 penthouses
    flatsData.push({
      societyId: 1,
      blockId: blockA.id,
      flatNumber: 'PH-01',
      floor: 5,
      type: 'penthouse' as any,
      sqFt: 2000.0,
      status: 'vacant' as const,
    });
    flatsData.push({
      societyId: 1,
      blockId: blockA.id,
      flatNumber: 'PH-02',
      floor: 5,
      type: 'penthouse' as any,
      sqFt: 2000.0,
      status: 'vacant' as const,
    });

    await prisma.flat.createMany({ data: flatsData });
    console.log('✅ 50 flats seeded (F1-01 to F4-12, PH-01, PH-02)');
  } else {
    console.log('⏭️  Flats already exist, skipping');
  }

  // ─── Default Expense Categories (per-society configurable) ───────────────
  const defaultExpenseCategories = [
    { slug: 'maintenance', name: 'Maintenance', color: '#8884d8', sortOrder: 1 },
    { slug: 'utility',     name: 'Utility',     color: '#82ca9d', sortOrder: 2 },
    { slug: 'salary',      name: 'Salary',      color: '#ffc658', sortOrder: 3 },
    { slug: 'repair',      name: 'Repair',      color: '#ff7300', sortOrder: 4 },
    { slug: 'admin',       name: 'Admin',       color: '#0088fe', sortOrder: 5 },
    { slug: 'other',       name: 'Other',       color: '#a4a4a4', sortOrder: 6 },
  ];

  for (const cat of defaultExpenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { societyId_slug: { societyId: 1, slug: cat.slug } },
      update: {},
      create: {
        societyId: 1,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        isDefault: true,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
  }
  console.log('✅ Default expense categories seeded (6 categories)');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });