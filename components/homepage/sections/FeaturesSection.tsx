import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Code, Sparkles, Terminal, FileText, Folder, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    type: 'snippet',
    icon: Code,
    title: 'Code Snippets',
    description: 'Syntax-highlighted, language-tagged, and instantly searchable. Copy in one click.',
    color: 'var(--color-snippet)',
  },
  {
    type: 'prompt',
    icon: Sparkles,
    title: 'AI Prompts',
    description: 'Version, tag, and rate your prompts. Find the one that actually worked last Tuesday.',
    color: 'var(--color-prompt)',
  },
  {
    type: 'command',
    icon: Terminal,
    title: 'Instant Search',
    description: 'Cmd+K command palette with fuzzy search across items and collections. Open, find, done.',
    color: 'var(--color-command)',
  },
  {
    type: 'note',
    icon: FileText,
    title: 'Commands & Notes',
    description: "Shell one-liners with copy buttons, plus markdown notes for context that doesn't fit a snippet.",
    color: 'var(--color-note)',
  },
  {
    type: 'file',
    icon: Folder,
    title: 'Files & Docs',
    description: 'Drop PDFs, config files, and screenshots. Secure cloud storage with one-click downloads.',
    color: 'var(--color-file)',
  },
  {
    type: 'url',
    icon: Link,
    title: 'Collections',
    description: 'Group related items into collections. Color-coded by content type. Share with your team.',
    color: 'var(--color-link)',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 pb-10">
      <Reveal className="max-w-6xl mx-auto pt-20 pb-9 text-center">
        <h2 className="text-[clamp(26px,4.5vw,40px)] tracking-[-0.02em] font-bold leading-[1.15] text-balance">
          One stash for every kind of dev knowledge
        </h2>
        <p className="mt-3.5 mx-auto max-w-[560px] text-muted-foreground text-base text-pretty">
          Seven item types, each with its own tailored UI. No more dumping everything into a notes app.
        </p>
      </Reveal>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5 lg:auto-rows-[minmax(0,1fr)]">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.type} className={cn(i === 0 && 'lg:col-span-2 lg:row-span-1')}>
            <article className="group relative h-full bg-card border border-border rounded-xl p-[22px] overflow-hidden transition-colors duration-200 hover:border-border/40">
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3.5"
                style={{
                  background: `color-mix(in srgb, ${feature.color} 16%, transparent)`,
                  color: feature.color,
                }}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1.5 text-balance">{feature.title}</h3>
              <p className="text-muted-foreground text-[14.5px]">{feature.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
