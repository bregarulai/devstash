import Link from 'next/link';
import { ArrowRight, Package, FolderOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyboardHint } from '@/components/dashboard/keyboardHint/KeyboardHint';

const STEPS = [
  {
    icon: Package,
    title: 'Collect',
    description: 'Save snippets, prompts, links, and files to DevStash',
  },
  {
    icon: FolderOpen,
    title: 'Organize',
    description: 'Group your items into collections for easy access',
  },
  {
    icon: Search,
    title: 'Search',
    description: 'Find anything instantly with powerful search and filters',
  },
];

export function GetStartedHero() {
  return (
    <div className='rounded-xl border bg-card p-8 ring-1 ring-foreground/10'>
      <h2 className='text-xl font-semibold'>Welcome to DevStash</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Your knowledge hub is empty. Start by collecting your first item.
      </p>

      <div className='mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {STEPS.map((step) => (
          <div
            key={step.title}
            className='flex items-start gap-3 rounded-lg border p-4 bg-muted/30'
          >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted'>
              <step.icon className='h-4 w-4 text-muted-foreground' />
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
          <Link href='/collect'>
            Save your first item
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
        <span className='text-xs text-muted-foreground'>or press <KeyboardHint shortcut='Ctrl+K' /> to quick save</span>
      </div>
    </div>
  );
}
