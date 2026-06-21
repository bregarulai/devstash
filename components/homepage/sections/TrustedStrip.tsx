import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Shield, Lock, BrainCircuit } from 'lucide-react';

const TRUST_SIGNALS = [
  { icon: Shield, label: 'Open source, MIT licensed', color: 'var(--color-brand)' },
  { icon: Lock, label: 'Encrypted at rest', color: 'var(--color-link)' },
  { icon: BrainCircuit, label: 'Your data is never used for AI training', color: 'var(--color-command)' },
];

export function TrustedStrip() {
  return (
    <Reveal variant="fast" className="max-w-6xl mx-auto mt-5 px-5 py-5">
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 list-none" role="list" aria-label="Trust signals">
        {TRUST_SIGNALS.map((signal) => (
          <li key={signal.label} className="flex items-center gap-2 text-muted-foreground text-sm">
            <signal.icon className="w-4 h-4 flex-none" style={{ color: signal.color }} />
            <span>{signal.label}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
