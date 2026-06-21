import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className='mx-auto max-w-4xl space-y-8'>
      {/* Page title skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-7 w-24' />
        <Skeleton className='h-4 w-64' />
      </div>

      {/* Billing card skeleton */}
      <div className='rounded-xl border border-border p-6 space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-4 w-80' />
        </div>
        <div className='flex items-center justify-between'>
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-24' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-5 w-10 rounded-sm' />
            </div>
          </div>
        </div>
        <div className='rounded-lg border border-border bg-muted/40 p-4 space-y-3'>
          <Skeleton className='h-3 w-20' />
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-4 w-12' />
            </div>
            <Skeleton className='h-2 w-full' />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-12' />
            </div>
            <Skeleton className='h-2 w-full' />
          </div>
        </div>
        <Skeleton className='h-9 w-32' />
      </div>

      {/* Editor preferences skeleton */}
      <div className='rounded-xl border border-border p-6 space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-4 w-72' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-8 w-20' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-8 w-24' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-8 w-28' />
          </div>
        </div>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-3.5 w-56' />
            </div>
            <Skeleton className='h-5 w-9 rounded-full' />
          </div>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-3.5 w-52' />
            </div>
            <Skeleton className='h-5 w-9 rounded-full' />
          </div>
        </div>
      </div>

      {/* Password section skeleton */}
      <div className='space-y-3'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-4 w-56' />
        <Skeleton className='h-9 w-36' />
      </div>

      {/* Delete account skeleton */}
      <div className='rounded-xl border border-destructive/30 p-6 space-y-3'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-4 w-80' />
        <Skeleton className='h-9 w-32' />
      </div>
    </div>
  );
}
