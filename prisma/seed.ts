import { prisma } from "../lib/prisma";

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

async function main() {
  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });

    if (!existing) {
      await prisma.itemType.create({ data: type });
      console.log(`  Created: ${type.name}`);
    } else {
      console.log(`  Already exists: ${type.name}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
