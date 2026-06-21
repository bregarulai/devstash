import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { CheckCircle } from 'lucide-react';

const AI_FEATURES = [
  'Auto-generated titles & summaries',
  'Smart tag suggestions from code context',
  'Find related items across types',
  'Natural language search: "that postgres index trick"',
  'Detect duplicate & outdated snippets',
];

const AI_TAGS = ['react', 'hooks', 'typescript', 'state', 'toggle'];

export function AiSection() {
  return (
    <section id="ai" className="max-w-6xl mx-auto px-5 py-10">
      <Reveal>
        <div className="grid gap-8 bg-secondary border border-border rounded-2xl p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div>
            <Badge
              variant="outline"
              className="mb-3.5 bg-secondary text-secondary-foreground border-border font-bold uppercase tracking-[0.1em] text-[11px]"
            >
              Pro Feature
            </Badge>
            <h2 className="text-[clamp(1.625rem,3vw+0.75rem,2.5rem)] font-bold tracking-[-0.02em] leading-[1.15] text-balance">
              Let AI tag, title, and tidy your stash
            </h2>
            <p className="mt-3.5 mb-5 text-muted-foreground leading-relaxed text-pretty">
              Stop hand-organizing. DevStash AI reads your snippets and prompts, then suggests tags,
              summaries, and related items automatically.
            </p>
            <p className="text-muted-foreground text-xs mb-5">
              Your snippets are encrypted at rest and never used for model training.
            </p>
            <ul className="flex flex-col gap-3 mb-6">
              {AI_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-base">
                  <CheckCircle className="w-5 h-5 text-success flex-none" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild>
              <a href="#pricing">Upgrade to Pro</a>
            </Button>
          </div>

          <div className="bg-code-window border border-border/22 rounded-xl overflow-hidden">
            <div className="flex gap-[7px] px-3.5 py-3 bg-code-header">
              <span className="w-[11px] h-[11px] rounded-full bg-dot-red" />
              <span className="w-[11px] h-[11px] rounded-full bg-dot-yellow" />
              <span className="w-[11px] h-[11px] rounded-full bg-dot-green" />
            </div>
            <div className="flex gap-1 px-2 bg-code-header border-t border-b border-border/22">
              <span className="text-xs text-foreground py-2 px-3 border-b-2 border-brand font-mono">
                useState.ts
              </span>
              <span className="text-xs text-muted-foreground py-2 px-3 border-b-2 border-transparent font-mono">
                README.md
              </span>
            </div>
            <div className="font-mono text-[13px] py-3.5 bg-code-window overflow-x-auto">
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">1</span>
                <span className="text-foreground whitespace-pre">
                  <span className="text-[var(--syntax-keyword)]">import</span> {'{'} useState {'}'}{' '}
                  <span className="text-[var(--syntax-keyword)]">from</span>{' '}
                  <span className="text-[var(--syntax-string)]">&apos;react&apos;</span>
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">2</span>
                <span className="text-foreground" />
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">3</span>
                <span className="text-foreground whitespace-pre">
                  <span className="text-[var(--syntax-keyword)]">export function</span>{' '}
                  <span className="text-[var(--syntax-function)]">useToggle</span>
                  {'(initial = '}
                  <span className="text-[var(--syntax-keyword)]">false</span>
                  {' ) {'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">4</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-[var(--syntax-keyword)]">const</span> {'[on, setOn] = '}
                  <span className="text-[var(--syntax-function)]">useState</span>
                  {'(initial)'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">5</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-[var(--syntax-keyword)]">const</span> toggle = () =&gt;{' '}
                  <span className="text-[var(--syntax-function)]">setOn</span>(o =&gt; !o)
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">6</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-[var(--syntax-keyword)]">return</span> {'{'} on, toggle, setOn {'}'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">7</span>
                <span className="text-foreground">{'}'}</span>
              </div>
            </div>
            <div className="border-t border-border/22 bg-code-header p-3.5">
              <span className="block text-xs font-semibold text-muted-foreground mb-2.5">
                AI Generated Tags
              </span>
              <div className="flex flex-wrap gap-[7px]">
                {AI_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold py-1 px-2.5 rounded-sm bg-secondary text-secondary-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
