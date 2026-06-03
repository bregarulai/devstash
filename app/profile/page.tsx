import { auth } from '@/lib/auth';
import { getInitials, loadProfileData } from '@/lib/db/user';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDescription } from '@/components/ui/alert';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog';
import { UserCircle, Trash2, Calendar, Folder, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ItemTypeBreakdown {
  name: string;
  count: number;
  color: string;
  icon: string;
}

async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <UserCircle className="size-12" />
          <p className="text-lg">Sign in to view your profile</p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const profileData = await loadProfileData(session.user.id);

  const user = profileData.user;

  if (!user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center gap-4 h-64 text-muted-foreground'>
          <p>Unable to load profile. Please try again.</p>
          <Button asChild variant='default'>
            <Link href="/dashboard">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasPassword = user.password !== null;
  const initials = getInitials(user.name, user.email);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar className="ring-4 ring-background size-16">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name || user.email} />
            )}
            <AvatarFallback className="text-lg bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {user.name || 'Unnamed User'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          {user.isPro && (
            <Badge variant="default" className="ml-2">PRO</Badge>
          )}
        </div>

        <Separator />

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="size-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm text-foreground">{user.name || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="text-sm text-foreground">
                  {hasPassword ? 'Email/Password' : 'GitHub OAuth'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {user.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Folder className="size-4" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{profileData.itemStats.totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="size-4" />
                Total Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{profileData.itemStats.totalCollections}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="size-4" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{profileData.itemStats.favoriteItems}</p>
            </CardContent>
          </Card>
        </div>

        {/* Item Type Breakdown */}
        {profileData.itemTypeBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profileData.itemTypeBreakdown.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color: type.color }}>{type.icon}</span>
                      <span className="text-sm text-foreground capitalize">{type.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {type.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Password */}
        {hasPassword && (
          <ChangePasswordForm />
        )}

        {/* Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <Trash2 className="size-5" />
              Delete Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDescription className="mb-4 text-sm">
              Once you delete your account, all your data will be permanently removed. This action cannot be undone.
            </AlertDescription>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
