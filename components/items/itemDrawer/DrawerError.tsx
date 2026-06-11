import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DrawerErrorProps {
  message: string;
}

export function DrawerError({ message }: DrawerErrorProps) {
  return (
    <Alert variant='destructive' className='py-2'>
      <AlertCircle className='size-4' />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
