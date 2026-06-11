import { Skeleton } from '@/components/ui/skeleton';

export function DrawerSkeleton() {
  return (
    <div className='space-y-4 py-6'>
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <div className='space-y-2'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-5/6' />
        <Skeleton className='h-3 w-4/6' />
      </div>
    </div>
  );
}
