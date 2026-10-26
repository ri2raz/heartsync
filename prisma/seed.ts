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
    topics: "physical-health-energy,academic-pressure-failure,life-beyond-exam",
    bio: "Dropped a year for JEE. Survived extreme study burnout, 3 AM caffeine crashes, and ruined sleep cycles before finding my balance. Here to listen through physical exhaustion, failure, and life beyond the exam.",
  },
  {
    alias: "Meera",
    title: "BIG_SIS",
    hue: 330,
    languages: "hi,en,mr",
    topics: "stress-wellbeing,family-pressure-homesick,safe-space-to-talk",
    bio: "Moved to a new city alone for coaching. Cried every night from homesickness and the heavy guilt of parental sacrifices. I offer a zero-judgment safe space to untangle your anxiety and feel heard.",
  },
  {
    alias: "Kabir",
    title: "BIG_BRO",
    hue: 25,
    languages: "en,hi,pa",
    topics: "physical-health-energy,loneliness-friendship,stress-wellbeing",
    bio: "Engineer who spent years running on 3 hours of sleep, zero friends, and severe somatic stress. If your body is exhausted, your hostel room feels lonely, or your energy is at rock bottom, let's talk.",
  },
  {
    alias: "Zoya",
    title: "BIG_SIS",
    hue: 280,
    languages: "en,hi,bn",
    topics: "family-pressure-homesick,academic-pressure-failure,life-beyond-exam",
    bio: "Eldest daughter bearing family expectations. Stumbled in competitive exams and discovered that self-worth isn't a test percentile. Here to remind you that your life is vastly bigger than the syllabus.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const adult = new Date("1998-06-15T00:00:00Z");

  const rituPasswordHash = await bcrypt.hash("ritu123@", 12);

  await db.user.upsert({
    where: { email: "ritu123@heartsync.local" },
    update: { passwordHash: rituPasswordHash, role: "ADMIN", alias: "ritu123" },
    create: { email: "ritu123@heartsync.local", alias: "ritu123", passwordHash: rituPasswordHash, dateOfBirth: adult, role: "ADMIN" },
  });

  await db.user.upsert({
    where: { email: "riturajverma2009@gmail.com" },
    update: { passwordHash: rituPasswordHash, role: "ADMIN", alias: "ritu123" },
    create: { email: "riturajverma2009@gmail.com", alias: "ritu123", passwordHash: rituPasswordHash, dateOfBirth: adult, role: "ADMIN" },
  });

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
    const profileData = {
      displayName: l.alias,
      title: l.title,
      bio: l.bio,
      languages: l.languages,
      topics: l.topics,
      avatarHue: l.hue,
      isOnline: true,
      lastSeenAt: new Date(),
    };
    await db.listenerProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
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
