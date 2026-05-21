import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'DevStash Dashboard',
};

export default function DashboardPage() {
  return (
    <div className='flex h-screen w-screen'>
      <div className='flex h-screen w-64 shrink-0'>
        <div className='flex h-full w-full flex-col border-r border-border bg-background' />
      </div>
      <div className='flex flex-1 flex-col'>
        <div className='border-b border-border bg-background pr-6' />
        <main className='min-w-0 flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold tracking-tight'>Welcome back</h1>
              <p className='mt-2 text-muted-foreground'>
                Here is a summary of your recent activity.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
