import { db } from './db';
import { users, dmtoTable, inseeDept } from '@shared/schema';
import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    email: 'admin@calcunotaire.fr',
    password: hashedPassword,
    isAdmin: true,
  }).onConflictDoNothing();
  console.log('✅ Admin user created');

  // Load and insert DMTO data
  const dmtoCSV = readFileSync(join(process.cwd(), 'seeds/dmto_table.csv'), 'utf-8');
  const dmtoLines = dmtoCSV.split('\n').slice(1).filter(line => line.trim());
  
  for (const line of dmtoLines) {
    const [deptCode, deptName, dmtoRate, communeRate, stateAddition, totalTransfer, 
           notaryFeesBase, notaryFixed, version, validFrom, validTo, sourceUrl] = 
      line.split(',');
    
    await db.insert(dmtoTable).values({
      deptCode,
      deptName,
      dmtoRate,
      communeRate,
      stateAddition,
      totalTransfer,
      notaryFeesBase,
      notaryFixed,
      version,
      validFrom: new Date(validFrom),
      validTo: validTo ? new Date(validTo) : null,
      sourceUrl,
    }).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${dmtoLines.length} DMTO rates`);

  // Load and insert INSEE data
  const inseeCSV = readFileSync(join(process.cwd(), 'seeds/insee_dept.csv'), 'utf-8');
  const inseeLines = inseeCSV.split('\n').slice(1).filter(line => line.trim());
  
  for (const line of inseeLines) {
    const [codeCommune, deptCode, communeName] = line.split(',');
    
    await db.insert(inseeDept).values({
      codeCommune,
      deptCode,
      communeName,
    }).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${inseeLines.length} INSEE entries`);

  console.log('✨ Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
