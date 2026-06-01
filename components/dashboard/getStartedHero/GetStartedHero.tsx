import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    number: 1,
    title: 'Collect',
    description: 'Save snippets, prompts, links, and files to DevStash',
  },
  {
    number: 2,
    title: 'Organize',
    description: 'Group your items into collections for easy access',
  },
  {
    number: 3,
    title: 'Search',
    description: 'Find anything instantly with powerful search and filters',
  },
];

export function GetStartedHero() {
  return (
    <div className='rounded-xl border bg-card p-8 shadow-sm'>
      <h2 className='text-xl font-semibold'>Welcome to DevStash</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Your knowledge hub is empty. Start by collecting your first item.
      </p>

      <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {STEPS.map((step) => (
          <div
            key={step.number}
            className='flex items-start gap-3 rounded-lg border p-4 bg-muted/30'
          >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
              {step.number}
            </div>
            <div>
              <p className='text-sm font-medium'>{step.title}</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 flex justify-center gap-3 items-center'>
        <Button size='lg' asChild>
          <a href='/collect'>
            Save your first item
            <ArrowRight className='ml-2 h-4 w-4' />
          </a>
        </Button>
        <span className='text-xs text-muted-foreground'>or press <span className='bg-muted px-1.5 py-0.5 rounded'>Ctrl+K</span> to quick save</span>
      </div>
    </div>
  );
}
