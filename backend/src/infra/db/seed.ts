import { kpis, policies, badges, lifecycles, userTypes, runtimes } from './schema';
import { getDb } from './client';
import fs from 'fs';
import path from 'path';

async function seed() {
    const seedPath = path.join(__dirname, '../../../data/seed-data.json');
    
    if (!fs.existsSync(seedPath)) {
        console.error('No seed data found! Run generate_seed first.');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    const db = getDb();

    // Insert data in correct order to maintain referential integrity
    console.log('Seeding KPIs...');
    await db.insert(kpis).values(data.kpis).onConflictDoNothing();

    console.log('Seeding lifecycles...');
    await db.insert(lifecycles).values(data.lifecycles).onConflictDoNothing();

    console.log('Seeding user types...');
    await db.insert(userTypes).values(data.userTypes).onConflictDoNothing();

    console.log('Seeding runtimes...');
    await db.insert(runtimes).values(data.runtimes).onConflictDoNothing();

    console.log('Seeding policies...');
    //lets iterate over policies and for each createdAt, let's make it a date object
    data.policies.forEach(policy => {
        policy.createdAt = new Date(policy.createdAt);
    });
    await db.insert(policies).values(data.policies).onConflictDoNothing();

    console.log('Seeding badges...');
    await db.insert(badges).values(data.badges).onConflictDoNothing();

    console.log('Seeding completed successfully!');
    process.exit(0);
}

seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});