import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      {/* Desktop sidebar skeleton */}
      <div className='hidden lg:flex lg:shrink-0 lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-background'>
        {/* Logo */}
        <div className='flex h-16 items-center px-4'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-7 w-7 rounded-lg' />
            <Skeleton className='h-5 w-20' />
          </div>
        </div>
        <div className='h-px bg-border' />
        {/* Navigation */}
        <div className='flex-1 overflow-y-auto py-4 px-4'>
          <div className='flex items-center justify-between mb-4'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-5 w-5 rounded' />
          </div>
          <div className='h-px bg-border mb-4' />
          {/* Types */}
          <Skeleton className='h-3 w-10 mb-2' />
          <div className='space-y-1'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between py-1'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-3 w-4' />
              </div>
            ))}
          </div>
          <div className='h-px bg-border my-4' />
          {/* Collections */}
          <Skeleton className='h-3 w-20 mb-2' />
          <div className='space-y-1'>
            <Skeleton className='h-3 w-16 mb-1' />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2 py-1 pl-4'>
                <Skeleton className='h-3 w-3 rounded-full' />
                <Skeleton className='h-4 w-24' />
              </div>
            ))}
          </div>
        </div>
        {/* User menu */}
        <div className='border-t border-border p-3'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-8 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-28' />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Top bar skeleton */}
        <header className='flex h-16 shrink-0 items-center gap-2 bg-background px-4 sm:px-6 border-b border-border'>
          {/* Mobile menu button */}
          <Skeleton className='h-8 w-8 rounded lg:hidden' />
          <div className='flex-1' />
          {/* Search bar */}
          <div className='hidden sm:flex sm:w-full sm:max-w-md lg:absolute lg:left-1/2 lg:-translate-x-1/2'>
            <Skeleton className='h-9 w-full rounded-lg' />
          </div>
          {/* Action buttons */}
          <div className='flex items-center gap-2 ml-auto'>
            <Skeleton className='h-8 w-8 rounded' />
            <Skeleton className='h-8 w-8 rounded' />
          </div>
        </header>
        <div className='h-px bg-border' />

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-6 lg:p-8 space-y-6'>
          {/* Stats cards skeleton */}
          <div className='flex flex-wrap items-center gap-8 bg-muted/40 rounded-xl px-6 py-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='h-6 w-6 rounded-lg' />
                <div className='space-y-1'>
                  <Skeleton className='h-5 w-8' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            ))}
          </div>

          {/* Collections section skeleton */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-4 w-16' />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='rounded-xl border border-border p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-4 rounded' />
                  </div>
                  <Skeleton className='h-3 w-48' />
                  <div className='flex items-center gap-2'>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className='h-6 w-6 rounded' />
                    ))}
                  </div>
                  <Skeleton className='h-5 w-14 rounded-full' />
                </div>
              ))}
            </div>
          </div>

          {/* Pinned items section skeleton */}
          <div className='space-y-4'>
            <Skeleton className='h-5 w-28' />
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='rounded-xl border border-border p-4'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-lg shrink-0' />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center gap-1.5'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-3 w-3 rounded-full' />
                      </div>
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
