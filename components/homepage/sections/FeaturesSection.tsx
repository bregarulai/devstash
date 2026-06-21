import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Code, Sparkles, Terminal, FileText, Folder, Link, Search, Copy } from 'lucide-react';

function SnippetCard() {
  return (
    <article className="relative h-full bg-card border border-border rounded-xl overflow-hidden transition-colors duration-200 hover:border-foreground/20 flex flex-col">
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: 'color-mix(in srgb, var(--color-snippet) 16%, transparent)', color: 'var(--color-snippet)' }}
          >
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Code Snippets</h3>
            <p className="text-muted-foreground text-xs">Syntax-highlighted, searchable, one-click copy</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <Search className="w-3.5 h-3.5" />
            <span>debounce react hook...</span>
          </div>
          <span className="text-[10px] text-muted-foreground bg-secondary border border-border rounded px-1.5 py-0.5 font-mono">JS</span>
        </div>
      </div>
      <div className="font-mono text-[11px] leading-relaxed bg-[var(--color-snippet)]/5 border-t border-[var(--color-snippet)]/10 p-4 pt-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground font-sans font-medium">debounce.ts</span>
          <Copy className="w-3 h-3 text-muted-foreground" />
        </div>
        <div><span className="text-[var(--syntax-keyword)]">function</span> <span className="text-[var(--syntax-function)]">debounce</span>(fn, ms) {'{'}</div>
        <div>{'  '}<span className="text-[var(--syntax-keyword)]">let</span> timer;</div>
        <div>{'  '}<span className="text-[var(--syntax-keyword)]">return</span> (...args) =&gt; {'{'}</div>
        <div>{'    '}<span className="text-[var(--syntax-function)]">clearTimeout</span>(timer);</div>
        <div>{'    '}timer = <span className="text-[var(--syntax-function)]">setTimeout</span>(() =&gt; fn(...args), ms);</div>
        <div>{'  }'};</div>
        <div>{'}'}</div>
      </div>
    </article>
  );
}

function PromptCard() {
  return (
    <article className="relative h-full bg-card border border-border rounded-xl overflow-hidden transition-colors duration-200 hover:border-foreground/20 flex flex-row lg:flex-col">
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--color-prompt) 16%, transparent)', color: 'var(--color-prompt)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">AI Prompts</h3>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed mb-3">Version, tag, and rate your prompts. Find the one that actually worked last Tuesday.</p>
        </div>
        <div className="font-mono text-[11px] leading-relaxed bg-[var(--color-prompt)]/5 border border-[var(--color-prompt)]/10 rounded-lg p-3 overflow-hidden">
          <div className="text-[10px] text-muted-foreground font-sans font-medium mb-1.5">system prompt</div>
          <div className="text-foreground/80 line-clamp-3">You are a senior TypeScript engineer. Review the following code for type safety, edge cases, and performance...</div>
        </div>
      </div>
      <div className="hidden lg:block border-t border-border px-5 py-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-prompt)]" /> v3</span>
        <span>rated 4.8</span>
        <span>used 127 times</span>
      </div>
    </article>
  );
}

function CommandCard() {
  return (
    <article className="relative h-full bg-card border border-border rounded-xl overflow-hidden transition-colors duration-200 hover:border-foreground/20 flex flex-col">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: 'color-mix(in srgb, var(--color-command) 16%, transparent)', color: 'var(--color-command)' }}
          >
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Commands</h3>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">Shell one-liners with copy buttons and language detection.</p>
      </div>
      <div className="font-mono text-[11px] bg-[var(--color-command)]/5 border-t border-[var(--color-command)]/10 p-3.5 flex-1 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="bg-secondary border border-border rounded px-1.5 py-0.5 text-[10px] font-sans font-medium">git</span>
          <Copy className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="text-foreground/80"><span className="text-[var(--color-command)]">$</span> git log --oneline --graph --decorate -10</div>
        <div className="text-foreground/50 mt-1">* a1b2c3d (HEAD -&gt; main) fix: resolve auth timeout</div>
        <div className="text-foreground/50">* e4f5g6h feat: add search indexing</div>
      </div>
    </article>
  );
}

function NoteCard() {
  return (
    <article className="relative h-full bg-card border border-border rounded-xl overflow-hidden transition-colors duration-200 hover:border-foreground/20 flex flex-col">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: 'color-mix(in srgb, var(--color-note) 16%, transparent)', color: 'var(--color-note)' }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Notes</h3>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">Markdown notes for context that doesn&apos;t fit a snippet.</p>
      </div>
      <div className="border-t border-border p-4 pt-3 flex-1">
        <div className="text-[11px] leading-relaxed text-foreground/80">
          <div className="font-bold text-xs mb-1">Auth flow decisions</div>
          <div className="text-muted-foreground mb-1.5">2024-03-15</div>
          <div className="flex gap-1.5 mb-2">
            <span className="bg-secondary border border-border rounded px-1.5 py-0.5 text-[10px] font-medium">nextauth</span>
            <span className="bg-secondary border border-border rounded px-1.5 py-0.5 text-[10px] font-medium">jwt</span>
          </div>
          <div className="text-muted-foreground line-clamp-2">Switched from session tokens to JWT for better mobile support. Key tradeoff: no server-side revocation without a blacklist...</div>
        </div>
      </div>
    </article>
  );
}

function SmallCard({ icon: Icon, color, title, description }: { icon: typeof Folder; color: string; title: string; description: string }) {
  return (
    <article className="relative h-full bg-card border border-border rounded-xl p-5 overflow-hidden transition-colors duration-200 hover:border-foreground/20 flex flex-col">
      <div
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </article>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 pb-10">
      <Reveal variant="scale" className="max-w-6xl mx-auto pt-20 pb-9 lg:text-left text-center">
        <h2 className="text-[clamp(1.625rem,3vw+0.75rem,2.5rem)] tracking-[-0.02em] font-bold leading-[1.15] text-balance">
          One stash for every kind of dev knowledge
        </h2>
        <p className="mt-3.5 mx-auto lg:mx-0 max-w-[560px] text-muted-foreground text-base leading-relaxed text-pretty">
          Six item types, each with its own tailored UI. No more dumping everything into a notes app.
        </p>
      </Reveal>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5">
        <Reveal variant="stagger" delay={0} className="lg:col-span-2">
          <SnippetCard />
        </Reveal>
        <Reveal variant="stagger" delay={100} className="lg:row-span-2">
          <PromptCard />
        </Reveal>
        <Reveal variant="stagger" delay={200}>
          <CommandCard />
        </Reveal>
        <Reveal variant="stagger" delay={300} className="lg:col-span-2">
          <NoteCard />
        </Reveal>
        <Reveal variant="stagger" delay={400}>
          <SmallCard icon={Folder} color="var(--color-file)" title="Files & Docs" description="Drop PDFs, config files, and screenshots. Secure cloud storage with one-click downloads." />
        </Reveal>
        <Reveal variant="stagger" delay={500}>
          <SmallCard icon={Link} color="var(--color-link)" title="Links" description="Save external references with auto-generated previews. Never lose a useful tab again." />
        </Reveal>
      </div>
    </section>
  );
}
