import { ProfileRetryForm } from './ProfileRetryForm';

interface ProfileErrorStateProps {
  errorType: 'db-failure' | 'user-not-found' | null;
}

export function ProfileErrorState({ errorType }: ProfileErrorStateProps) {
  if (errorType === 'user-not-found') {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-muted-foreground max-w-md text-center'>
          <p className='text-lg font-medium text-foreground'>We could not find your profile.</p>
          <p className='text-sm'>If this persists, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4 text-muted-foreground max-w-md text-center'>
        <p className='text-lg font-medium text-foreground'>Something went wrong loading your profile.</p>
        <p className='text-sm'>Please try again.</p>
        <ProfileRetryForm errorType={errorType} />
      </div>
    </div>
  );
}
