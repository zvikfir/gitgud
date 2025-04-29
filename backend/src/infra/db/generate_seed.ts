import { kpis, policies, badges, lifecycles, userTypes, runtimes, 
         Kpi, Policy, Badge, Lifecycle, UserType, Runtime } from './schema';
import db from './client';
import fs from 'fs';
import path from 'path';

const seedData: {
    kpis: Kpi[];
    policies: Policy[];
    badges: Badge[];
    lifecycles: Lifecycle[];
    userTypes: UserType[];
    runtimes: Runtime[];
} = {
    kpis: [
        { name: 'Security', description: 'Security-related measurements' },
        { name: 'Quality', description: 'Code quality measurements' },
        { name: 'Performance', description: 'Performance metrics' }
    ],
    policies: [
        {
            name: 'HTTPS Only',
            uuid: 'https-only',
            description: 'Ensures HTTPS is used',
            version: '1.0',
            criteria: {},
            enabled: true,
            draft: false,
            scriptJs: 'return true;',
            ordinal: 100
        }
    ],
    badges: [
        { name: 'Security Champion', description: 'All security policies passed', kpiId: 1 },
        { name: 'Quality Master', description: 'All quality policies passed', kpiId: 2 }
    ],
    lifecycles: [
        { name: 'Production', description: 'Production applications' },
        { name: 'Development', description: 'Applications in development' }
    ],
    userTypes: [
        { type: 'Admin' },
        { type: 'User' }
    ],
    runtimes: [
        { name: 'Node.js', description: 'JavaScript runtime' },
        { name: 'Python', description: 'Python runtime' },
        { name: 'Java', description: 'Java runtime' }
    ]
};

const generateSeedFile = () => {
    const seedContent = `import { kpis, policies, badges, lifecycles, userTypes, runtimes } from './schema';

export const seed = {
    kpis: ${JSON.stringify(seedData.kpis, null, 2)},
    policies: ${JSON.stringify(seedData.policies, null, 2)},
    badges: ${JSON.stringify(seedData.badges, null, 2)},
    lifecycles: ${JSON.stringify(seedData.lifecycles, null, 2)},
    userTypes: ${JSON.stringify(seedData.userTypes, null, 2)},
    runtimes: ${JSON.stringify(seedData.runtimes, null, 2)}
};`;

    const outputPath = path.join(__dirname, '../../migrations/seed.ts');
    fs.writeFileSync(outputPath, seedContent);
    console.log(`Seed file generated at: ${outputPath}`);
};

generateSeedFile();

async function dumpData() {
    const data = {
        kpis: await db.select().from(kpis),
        policies: await db.select().from(policies),
        badges: await db.select().from(badges),
        lifecycles: await db.select().from(lifecycles),
        userTypes: await db.select().from(userTypes),
        runtimes: await db.select().from(runtimes),
    };

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the seed data
    fs.writeFileSync(
        path.join(dataDir, 'seed-data.json'),
        JSON.stringify(data, null, 2)
    );

    console.log('Seed data has been dumped to data/seed-data.json');
    process.exit(0);
}

dumpData().catch(console.error);
