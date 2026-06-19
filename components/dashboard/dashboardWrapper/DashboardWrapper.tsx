import { SystemItemType, CollectionWithStats } from '@/types/db';
import { DashboardWrapperClient } from './DashboardWrapperClient';

export function DashboardWrapper({
  children,
  user,
  systemItemTypes,
  favoriteCollections,
  recentCollections,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isPro: boolean;
  };
  systemItemTypes: SystemItemType[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
}) {
  return (
    <DashboardWrapperClient
      user={user}
      systemItemTypes={systemItemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      {children}
    </DashboardWrapperClient>
  );
}