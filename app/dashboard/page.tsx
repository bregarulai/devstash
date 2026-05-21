import { Sidebar } from './components/sidebar';
import { TopBar } from './components/top-bar';

export default function DashboardPage() {
  return (
    <div className='flex h-screen w-screen'>
      <div className='flex h-screen w-64 shrink-0'>
        <Sidebar />
      </div>
      <div className='flex flex-1 flex-col '>
        <TopBar />
        <main className='min-w-0 flex-1 p-6'>
          <h2 className='text-2xl font-semibold'>Main</h2>
        </main>
      </div>
    </div>
  );
}
