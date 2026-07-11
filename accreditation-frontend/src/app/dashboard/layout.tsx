import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
