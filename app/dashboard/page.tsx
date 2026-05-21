import { Sidebar } from './components/sidebar';
import { TopBar } from './components/top-bar';

export default function DashboardPage() {
  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <TopBar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='min-w-0 flex-1 overflow-auto p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
