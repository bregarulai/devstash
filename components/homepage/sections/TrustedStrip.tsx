import { Reveal } from '@/components/homepage/reveal/Reveal';

const STRIP_PHRASES = [
  'Where did I save that snippet?',
  'Which prompt worked best?',
  'What command fixed it last time?',
  'Which tab had the answer?',
];

export function TrustedStrip() {
  return (
    <Reveal className="max-w-6xl mx-auto mt-5 px-5 py-6 text-center">
      <p className="text-muted-foreground text-[13px] mb-3.5">
        Built for developers who are tired of:
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 gap-x-[22px] font-mono text-[13px] text-muted-foreground">
        {STRIP_PHRASES.map((phrase) => (
          <span key={phrase}>
            <span className="text-cyan-500">&ldquo;</span>
            {phrase}
            <span className="text-cyan-500">&rdquo;</span>
          </span>
        ))}
      </div>
    </Reveal>
  );
}
