import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================
// Demo user
// ============================================
const demoUser = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "demo123",
};

// ============================================
// System item types
// ============================================
const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

// ============================================
// Collections with items
// ============================================
const collections = [
  {
    name: "React Patterns",
    description: "Reusable React hooks, component patterns, and utility functions",
    items: [
      {
        title: "useDebounce Hook",
        contentType: "TEXT" as const,
        content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
        language: "typescript",
        itemType: "snippet",
        tags: ["react", "hooks", "debounce"],
      },
      {
        title: "useLocalStorage Hook",
        contentType: "TEXT" as const,
        content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
        language: "typescript",
        itemType: "snippet",
        tags: ["react", "hooks", "localStorage"],
      },
      {
        title: "useSessionStorage Hook",
        contentType: "TEXT" as const,
        content: `import { useState, useEffect } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
        language: "typescript",
        itemType: "snippet",
        tags: ["react", "hooks", "sessionStorage"],
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompt templates and workflow patterns for development",
    items: [
      {
        title: "Code Review Prompt",
        contentType: "TEXT" as const,
        content: `Review the following code for:
1. Potential bugs or edge cases
2. Performance optimizations
3. Security vulnerabilities
4. Code style and consistency
5. Missing error handling

Provide specific suggestions with code examples.`,
        itemType: "prompt",
        tags: ["ai", "code-review", "prompt"],
      },
      {
        title: "Documentation Generation Prompt",
        contentType: "TEXT" as const,
        content: `Generate comprehensive documentation for the following code:
1. Overview of purpose and functionality
2. Input/output specifications
3. Usage examples with different scenarios
4. Edge cases and error conditions
5. Dependencies and requirements

Format in Markdown with clear headings.`,
        itemType: "prompt",
        tags: ["ai", "documentation", "prompt"],
      },
      {
        title: "Refactoring Assistance Prompt",
        contentType: "TEXT" as const,
        content: `Analyze the following code and suggest refactoring improvements:
1. Identify code smells and anti-patterns
2. Suggest design pattern applications
3. Propose cleaner abstractions
4. Recommend testable splits
5. Provide refactored code examples

Focus on maintainability and readability.`,
        itemType: "prompt",
        tags: ["ai", "refactoring", "prompt"],
      },
    ],
  },
  {
    name: "DevOps Essentials",
    description: "Docker, CI/CD configurations, and deployment scripts",
    items: [
      {
        title: "Docker Compose for Next.js",
        contentType: "TEXT" as const,
        content: `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/devstash
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=devstash
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
        language: "yaml",
        itemType: "snippet",
        tags: ["docker", "devops", "nextjs"],
      },
      {
        title: "Deployment Script",
        contentType: "TEXT" as const,
        content: `#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Restart the application
pm2 restart devstash || pm2 start ecosystem.config.js

echo "Deployment complete!"`,
        language: "bash",
        itemType: "command",
        tags: ["deployment", "devops", "bash"],
      },
      {
        title: "Next.js Deployment Guide",
        contentType: "URL" as const,
        url: "https://nextjs.org/docs/app/getting-started/deployment",
        itemType: "link",
        tags: ["nextjs", "deployment", "guide"],
      },
      {
        title: "Vercel Deployment Docs",
        contentType: "URL" as const,
        url: "https://vercel.com/docs/deployments/next.js-apps",
        itemType: "link",
        tags: ["vercel", "deployment", "guide"],
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Essential terminal commands for daily development",
    items: [
      {
        title: "Git Reset & Undo Operations",
        contentType: "TEXT" as const,
        content: `# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, discard changes
git reset --hard HEAD~1

# Undo last commit, keep changes in working directory
git reset --mixed HEAD~1

# View commit history with diff stats
git log --oneline --stat

# Find commits that introduced a bug
git bisect start
git bisect bad
git bisect good v1.0.0`,
        language: "bash",
        itemType: "command",
        tags: ["git", "terminal", "debugging"],
      },
      {
        title: "Docker Management Commands",
        contentType: "TEXT" as const,
        content: `# Start containers in detached mode
docker-compose up -d

# View live logs
docker-compose logs -f app

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove all unused containers
docker container prune

# Remove all unused images
docker image prune -a`,
        language: "bash",
        itemType: "command",
        tags: ["docker", "terminal", "containers"],
      },
      {
        title: "Process Management",
        contentType: "TEXT" as const,
        content: `# Find and kill a process by port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or on Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Monitor memory usage
htop
# Or:
top -o mem

# Check disk usage
du -sh ./* | sort -rh | head -20`,
        language: "bash",
        itemType: "command",
        tags: ["process", "terminal", "monitoring"],
      },
      {
        title: "Package Manager Utilities",
        contentType: "TEXT" as const,
        content: `# npm
npm ls --depth=0           # List top-level dependencies
npm outdated               # Check for updates
npm prune --production     # Remove devDependencies
npm pack --json            # Package info without creating tarball

# yarn
yarn list --depth=0
yarn upgrade-interactive

# pnpm
pnpm list --depth=0
pnpm why <package>        # Show why a package is installed`,
        language: "bash",
        itemType: "command",
        tags: ["npm", "yarn", "pnpm", "packages"],
      },
    ],
  },
  {
    name: "Design Resources",
    description: "Curated links for UI design, CSS, and component libraries",
    items: [
      {
        title: "Tailwind CSS Documentation",
        contentType: "URL" as const,
        url: "https://tailwindcss.com/docs",
        itemType: "link",
        tags: ["css", "tailwind", "documentation"],
      },
      {
        title: "shadcn/ui Component Library",
        contentType: "URL" as const,
        url: "https://ui.shadcn.com",
        itemType: "link",
        tags: ["components", "shadcn", "react"],
      },
      {
        title: "Radix UI Primitives",
        contentType: "URL" as const,
        url: "https://www.radix-ui.com",
        itemType: "link",
        tags: ["accessibility", "radix", "primitives"],
      },
      {
        title: "Lucide Icon Library",
        contentType: "URL" as const,
        url: "https://lucide.dev",
        itemType: "link",
        tags: ["icons", "lucide", "svg"],
      },
    ],
  },
];

// ============================================
// Helper: get or create item type
// ============================================
async function getOrCreateItemType(name: string) {
  const type = await prisma.itemType.findFirst({
    where: { name, userId: null },
  });
  if (!type) {
    throw new Error(`System item type "${name}" not found. Run system types seeding first.`);
  }
  return type;
}

// ============================================
// Helper: get or create tag
// ============================================
async function getOrCreateTag(name: string) {
  const tag = await prisma.tag.findFirst({
    where: { name },
  });
  if (tag) return tag;
  return prisma.tag.create({ data: { name } });
}

// ============================================
// Main seeding
// ============================================
async function main() {
  console.log("Starting seed data...");

  // 1. Create demo user
  console.log("\n1. Creating demo user...");
  const hashedPassword = await bcrypt.hash(demoUser.password, 12);
  let user = await prisma.user.findFirst({
    where: { email: demoUser.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoUser.email,
        name: demoUser.name,
        password: hashedPassword,
      },
    });
    console.log(`   Created user: ${user.email}`);
  } else {
    console.log(`   User already exists: ${user.email}`);
  }

  const userId = user.id;

  // 2. Create system item types
  console.log("\n2. Creating system item types...");
  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });

    if (!existing) {
      await prisma.itemType.create({ data: type });
      console.log(`   Created: ${type.name}`);
    } else {
      console.log(`   Already exists: ${type.name}`);
    }
  }

  // 3. Create collections with items
  console.log("\n3. Creating collections and items...");
  for (const collection of collections) {
    let coll = await prisma.collection.findFirst({
      where: { name: collection.name, userId },
    });

    if (!coll) {
      const itemIds: string[] = [];

      for (const item of collection.items) {
        const itemType = await getOrCreateItemType(item.itemType);
        const tags = await Promise.all(
          item.tags.map((tag) => getOrCreateTag(tag)),
        );

        const isText = item.contentType === "TEXT";
        const hasLanguage = "language" in item && (item as { language?: string }).language;
        const hasUrl = item.contentType === "URL" && (item as { url?: string }).url;

        const created = await prisma.item.create({
          data: {
            title: item.title,
            contentType: item.contentType,
            itemType: { connect: { id: itemType.id } },
            user: { connect: { id: userId } },
            tags: { connect: tags.map((t) => ({ id: t.id })) },
            ...(isText && item.content ? { content: item.content } : {}),
            ...(hasLanguage ? { language: hasLanguage } : {}),
            ...(hasUrl ? { url: hasUrl } : {}),
          },
        });
        itemIds.push(created.id);
      }

      coll = await prisma.collection.create({
        data: {
          name: collection.name,
          description: collection.description,
          userId,
          items: {
            create: itemIds.map((itemId) => ({
              itemId,
            })),
          },
        },
      });
      console.log(`   Created collection: ${collection.name} (${collection.items.length} items)`);
    } else {
      console.log(`   Collection exists: ${collection.name}`);
    }
  }

  console.log("\nSeed data complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
