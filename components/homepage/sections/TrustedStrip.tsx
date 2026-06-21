import { Reveal } from '@/components/homepage/reveal/Reveal';
import { Shield, Lock, BrainCircuit } from 'lucide-react';

const TRUST_SIGNALS = [
  { icon: Shield, label: 'Open source' },
  { icon: Lock, label: 'Encrypted at rest' },
  { icon: BrainCircuit, label: 'Not used for AI training' },
];

export function TrustedStrip() {
  return (
    <Reveal className="max-w-6xl mx-auto mt-5 px-5 py-5">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {TRUST_SIGNALS.map((signal) => (
          <div key={signal.label} className="flex items-center gap-2 text-muted-foreground text-sm">
            <signal.icon className="w-4 h-4 flex-none" />
            <span>{signal.label}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
