import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className='space-y-6 p-6 lg:p-8'>
      <div className='flex gap-4'>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-32' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Skeleton className='h-32' />
          <Skeleton className='h-32' />
          <Skeleton className='h-32' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-40' />
        <div className='space-y-3'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <div className='space-y-3'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div>
      </div>
    </div>
  );
}
