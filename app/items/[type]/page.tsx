import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  getItemsByTypeWithMeta,
  getSystemItemTypesWithCounts,
} from '@/lib/db/items';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { ItemCard } from '@/components/items/itemCard/ItemCard';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  const types = await getSystemItemTypesWithCounts();
  return types.map((type) => ({ type: type.name }));
}

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { items, types, hasError } = await getItemsByTypeWithMeta(
    session.user.id,
    type,
  );

  const currentType = types.find((t) => t.name === type);

  if (!currentType) {
    notFound();
  }

  return (
    <DashboardWrapper
      user={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email || '',
        image: session.user.image ?? null,
        isPro: false,
      }}
      systemItemTypes={types}
      favoriteCollections={[]}
      recentCollections={[]}
    >
      <div className='flex flex-1 flex-col gap-6 p-6'>
        {hasError && (
          <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' x2='12' y1='8' y2='12' />
              <line x1='12' x2='12.01' y1='16' y2='16' />
            </svg>
            <p className='text-sm'>Failed to load items. Please try again.</p>
          </div>
        )}
        <div className='flex items-center gap-3'>
          <div
            className='flex h-10 w-10 items-center justify-center rounded-lg'
            style={{
              backgroundColor: `${currentType.color}15`,
              color: currentType.color,
            }}
          >
            <ItemTypeIcon type={currentType.name} className='h-5 w-5' />
          </div>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {currentType.name.charAt(0).toUpperCase() +
                currentType.name.slice(1)}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Empty>
            <EmptyMedia variant='icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5 text-muted-foreground'
              >
                <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
                <path d='M14 2v4a2 2 0 0 0 2 2h4' />
              </svg>
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No items yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t added any {currentType.name} items yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
