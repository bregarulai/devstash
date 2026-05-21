export function Sidebar() {
  return (
    <aside className='flex h-screen w-64 flex-col border-r border-border bg-background'>
      <div className='flex h-16 items-center px-4'>
        <span className='text-lg font-bold'>DevStash</span>
      </div>
      <div className='flex-1 p-4'>
        <h2 className='text-2xl font-semibold'>Sidebar</h2>
      </div>
    </aside>
  );
}
