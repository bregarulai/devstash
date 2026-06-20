import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const AI_FEATURES = [
  'Auto-generated titles & summaries',
  'Smart tag suggestions from code context',
  'Find related items across types',
  'Natural language search: "that postgres index trick"',
  'Detect duplicate & outdated snippets',
];

const AI_TAGS = [
  { label: 'react', type: 'snippet' },
  { label: 'hooks', type: 'prompt' },
  { label: 'typescript', type: 'command' },
  { label: 'state', type: 'note' },
  { label: 'toggle', type: 'url' },
];

export function AiSection() {
  return (
    <section id="ai" className="max-w-6xl mx-auto px-5 py-10">
      <Reveal>
        <div className="grid gap-8 bg-secondary border border-border rounded-[22px] p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div>
            <Badge
              variant="outline"
              className="mb-3.5 bg-gradient-to-r from-amber-500 to-pink-500 text-black border-transparent font-bold uppercase tracking-[0.1em] text-[11px]"
            >
              Pro Feature
            </Badge>
            <h2 className="text-[clamp(24px,4vw,34px)] font-bold tracking-[-0.02em] leading-[1.15]">
              Let AI tag, title, and tidy your stash
            </h2>
            <p className="mt-3.5 mb-5 text-muted-foreground">
              Stop hand-organizing. DevStash AI reads your snippets and prompts, then suggests tags,
              summaries, and related items automatically.
            </p>
            <ul className="flex flex-col gap-3 mb-6">
              {AI_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-base">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-none" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild>
              <a href="#pricing">Upgrade to Pro</a>
            </Button>
          </div>

          <div className="bg-[#0a0f1f] border border-border/22 rounded-xl overflow-hidden shadow-[var(--shadow-lg)]">
            <div className="flex gap-[7px] px-3.5 py-3 bg-[#0d1326]">
              <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
            </div>
            <div className="flex gap-1 px-2 bg-[#0d1326] border-t border-b border-border/22">
              <span className="text-xs text-foreground py-2 px-3 border-b-2 border-snippet font-mono">
                useState.ts
              </span>
              <span className="text-xs text-muted-foreground py-2 px-3 border-b-2 border-transparent font-mono">
                README.md
              </span>
            </div>
            <div className="font-mono text-[13px] py-3.5 bg-[#0a0f1f]">
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">1</span>
                <span className="text-foreground whitespace-pre">
                  <span className="text-purple-400">import</span> {'{'} useState {'}'}{' '}
                  <span className="text-purple-400">from</span>{' '}
                  <span className="text-yellow-300">&apos;react&apos;</span>
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">2</span>
                <span className="text-foreground" />
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">3</span>
                <span className="text-foreground whitespace-pre">
                  <span className="text-purple-400">export function</span>{' '}
                  <span className="text-blue-400">useToggle</span>
                  {'(initial = '}
                  <span className="text-purple-400">false</span>
                  {' ) {'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">4</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-purple-400">const</span> {'[on, setOn] = '}
                  <span className="text-blue-400">useState</span>
                  {'(initial)'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">5</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-purple-400">const</span> toggle = () =&gt;{' '}
                  <span className="text-blue-400">setOn</span>(o =&gt; !o)
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">6</span>
                <span className="text-foreground whitespace-pre">
                  {'  '}
                  <span className="text-purple-400">return</span> {'{'} on, toggle, setOn {'}'}
                </span>
              </div>
              <div className="flex px-3.5 hover:bg-white/[0.02]">
                <span className="w-7 text-muted-foreground select-none flex-none">7</span>
                <span className="text-foreground">{'}'}</span>
              </div>
            </div>
            <div className="border-t border-border/22 bg-[#0d1326] p-3.5">
              <span className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-amber-500 mb-2.5">
                AI Generated Tags
              </span>
              <div className="flex flex-wrap gap-[7px]">
                {AI_TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="text-xs font-semibold py-1 px-2.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, var(--color-${tag.type}) 14%, transparent)`,
                      color: `var(--color-${tag.type})`,
                      border: `1px solid color-mix(in srgb, var(--color-${tag.type}) 40%, transparent)`,
                    }}
                  >
                    {tag.label}
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
