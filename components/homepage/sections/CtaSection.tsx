import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Code, Terminal, Sparkles } from 'lucide-react';

export function CtaSection() {
  return (
    <Reveal variant="scale">
      <section className="my-10 mx-5 max-w-6xl lg:mx-auto rounded-2xl overflow-hidden bg-[var(--color-brand)]">
        <div className="relative px-8 py-14 lg:px-16 lg:py-20 text-center">

          <div className="relative">
            <h2 className="text-[clamp(1.5rem,3vw+0.5rem,2.25rem)] font-bold tracking-[-0.02em] leading-[1.15] text-balance text-white">
              Your next command is already in your stash
            </h2>
            <p className="mt-3.5 mx-auto max-w-[460px] text-white/70 leading-relaxed text-pretty">
              Start saving snippets, prompts, and commands today. Free forever for up to 50 items.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 bg-white text-[var(--color-brand)] hover:bg-white/90 font-semibold"
                asChild
              >
                <Link href="/register">Create Your Stash</Link>
              </Button>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <span className="flex -space-x-1">
                  <span className="w-5 h-5 rounded-full bg-white/20 border border-[var(--color-brand)] flex items-center justify-center"><Code className="w-2.5 h-2.5" /></span>
                  <span className="w-5 h-5 rounded-full bg-white/20 border border-[var(--color-brand)] flex items-center justify-center"><Terminal className="w-2.5 h-2.5" /></span>
                  <span className="w-5 h-5 rounded-full bg-white/20 border border-[var(--color-brand)] flex items-center justify-center"><Sparkles className="w-2.5 h-2.5" /></span>
                </span>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
