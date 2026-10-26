/**
 * Local development seed. Creates demo accounts so you can try every flow.
 * Never run this against production — the demo passwords are public.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_PASSWORD = "demo-password-123";

const LISTENERS = [
  {
    alias: "Aarav",
    title: "BIG_BRO",
    hue: 210,
    languages: "hi,en",
    topics: "exams,career,family",
    bio: "Dropped a year for JEE, didn't get the college I wanted, and turned out fine. I know how loud the pressure gets — happy to just listen, or help you think through a Plan B.",
  },
  {
    alias: "Meera",
    title: "BIG_SIS",
    hue: 330,
    languages: "hi,en,mr",
    topics: "breakups,self-worth,overthinking",
    bio: "Moved to Pune alone at 21 and went through a messy breakup in my first month. I'm a good listener, a terrible judge, and I'll never tell you to 'just move on'.",
  },
  {
    alias: "Kabir",
    title: "BIG_BRO",
    hue: 25,
    languages: "en,hi,pa",
    topics: "work,new-city,loneliness",
    bio: "Software engineer, first job in Bengaluru, zero friends for a year. If your city feels too big and your weekends too quiet, let's talk.",
  },
  {
    alias: "Zoya",
    title: "BIG_SIS",
    hue: 280,
    languages: "en,hi,bn",
    topics: "family,friendship,self-worth",
    bio: "Eldest daughter, so I know about expectations. I listen without fixing — unless you want ideas, then I have plenty.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const adult = new Date("1998-06-15T00:00:00Z");

  await db.user.upsert({
    where: { email: "admin@heartsync.local" },
    update: {},
    create: { email: "admin@heartsync.local", alias: "Safety Team", passwordHash, dateOfBirth: adult, role: "ADMIN" },
  });

  await db.user.upsert({
    where: { email: "seeker@heartsync.local" },
    update: {},
    create: { email: "seeker@heartsync.local", alias: "Sunny", passwordHash, dateOfBirth: adult, minutesBalance: 60 },
  });

  for (const l of LISTENERS) {
    const email = `${l.alias.toLowerCase()}@heartsync.local`;
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email, alias: l.alias, passwordHash, dateOfBirth: adult, role: "LISTENER" },
    });
    await db.listenerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: l.alias,
        title: l.title,
        bio: l.bio,
        languages: l.languages,
        topics: l.topics,
        avatarHue: l.hue,
        isOnline: true,
        lastSeenAt: new Date(),
      },
    });
  }

  console.log(`Seeded demo accounts. Password for all: ${DEMO_PASSWORD}`);
  console.log("  admin@heartsync.local · seeker@heartsync.local · aarav@ / meera@ / kabir@ / zoya@heartsync.local");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
