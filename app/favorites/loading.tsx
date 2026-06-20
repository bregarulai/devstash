import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesLoading() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
          <Skeleton className='h-5 w-5' />
        </div>
        <div>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-4 w-20 mt-1' />
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-5 w-6 rounded-full' />
            </div>
            <Skeleton className='h-9 w-[140px]' />
          </div>
          <div className='space-y-1'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-md px-3 py-2'
              >
                <Skeleton className='h-4 w-4 shrink-0' />
                <Skeleton className='h-4 flex-1' />
                <Skeleton className='h-5 w-14 shrink-0 rounded-full' />
                <Skeleton className='h-4 w-16 shrink-0' />
                <Skeleton className='h-4 w-4 shrink-0' />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-6 rounded-full' />
            </div>
            <Skeleton className='h-9 w-[140px]' />
          </div>
          <div className='space-y-1'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-md px-3 py-2'
              >
                <Skeleton className='h-4 w-4 shrink-0' />
                <Skeleton className='h-4 flex-1' />
                <Skeleton className='h-4 w-12 shrink-0' />
                <Skeleton className='h-4 w-16 shrink-0' />
                <Skeleton className='h-4 w-4 shrink-0' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
