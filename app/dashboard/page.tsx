import { MobileHeader } from './components/mobile-header';
import { TopBar } from './components/top-bar';

export default function DashboardPage() {
  return (
    <div className='flex h-screen w-screen'>
      {/* Mobile header with menu button */}
      <MobileHeader />

      {/* Main content */}
      <div className='flex min-w-0 flex-1 flex-col'>
        <TopBar />
        <main className='min-w-0 flex-1 p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
