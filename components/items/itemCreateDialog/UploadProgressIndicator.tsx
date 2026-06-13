import { Loader2 } from 'lucide-react';

interface UploadProgressIndicatorProps {
  progress: number;
}

export function UploadProgressIndicator({ progress }: UploadProgressIndicatorProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Uploading file...
      </div>
      <div className='h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full bg-primary transition-all duration-300'
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className='text-xs text-muted-foreground text-right'>
        {progress}%
      </p>
    </div>
  );
}
