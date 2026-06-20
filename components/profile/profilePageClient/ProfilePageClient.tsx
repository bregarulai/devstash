'use client';

import { Mail, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { formatDaysAgo, getInitials } from '@/lib/utils/utils';

interface ProfilePageClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isPro: boolean;
    createdAt: Date;
  };
  hasPassword: boolean;
  itemStats: {
    totalItems: number;
    totalCollections: number;
    favoriteItems: number;
    favoriteCollections: number;
  };
  itemTypeBreakdown: {
    name: string;
    icon: string;
    color: string;
    count: number;
  }[];
}

export function ProfilePageClient({
  user,
  itemStats,
  itemTypeBreakdown,
  hasPassword,
}: ProfilePageClientProps) {
  const initials = getInitials(user.name, user.email);

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* Page Title */}
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold text-foreground'>Profile</h1>
        <p className='text-sm text-muted-foreground'>
          Manage your account settings and view your usage statistics.
        </p>
      </div>

      <Separator />

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar + Name row */}
          <div className='flex items-center gap-4'>
            <Avatar className='ring-4 ring-background size-20'>
              {user.image && (
                <AvatarImage src={user.image} alt={user.name || user.email} />
              )}
              <AvatarFallback className='text-lg bg-muted'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-semibold text-foreground'>
                  {user.name || 'Unnamed User'}
                </h2>
                {user.isPro && (
                  <Badge className='ml-1 bg-sidebar-primary text-sidebar-primary-foreground'>
                    PRO
                  </Badge>
                )}
              </div>
              <Badge variant='secondary' className='text-xs text-muted-foreground font-normal'>
                {hasPassword ? 'Email Account' : 'Github Account'}
              </Badge>
            </div>
          </div>

          {/* Email */}
          <div className='flex items-center gap-1.5 text-sm'>
            <Mail className='size-3.5 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Email</span>
            <span className='text-foreground'>{user.email}</span>
          </div>

          {/* Member Since */}
          <div className='flex items-center gap-1.5 text-sm'>
            <Calendar className='size-3.5 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Member since</span>
            <span className='text-foreground'>{formatDaysAgo(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Usage Overview</CardTitle>
          <CardDescription>
            A summary of your DevStash activity.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-muted ring-1 ring-border rounded-xl p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Total Items
              </p>
              <p className='text-2xl font-semibold text-foreground mt-1'>
                {itemStats.totalItems}
              </p>
            </div>
            <div className='bg-muted ring-1 ring-border rounded-xl p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Total Collections
              </p>
              <p className='text-2xl font-semibold text-foreground mt-1'>
                {itemStats.totalCollections}
              </p>
            </div>
            <div className='bg-muted ring-1 ring-border rounded-xl p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Favorites
              </p>
              <p className='text-2xl font-semibold text-foreground mt-1'>
                {itemStats.favoriteItems}
              </p>
            </div>
          </div>

          {itemTypeBreakdown.length > 0 && (
            <>
              <div className='space-y-1'>
                <h3 className='text-sm font-semibold text-foreground'>
                  Items by Type
                </h3>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
                {itemTypeBreakdown.map((type) => (
                  <Card key={type.name}>
                    <CardContent className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg' style={{ backgroundColor: `${type.color}15` }}>
                          <ItemTypeIcon type={type.name} />
                        </div>
                        <span className='text-xs text-foreground capitalize'>
                          {type.name}
                        </span>
                      </div>
                      <Badge variant='secondary' className='text-xs'>
                        {type.count}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
