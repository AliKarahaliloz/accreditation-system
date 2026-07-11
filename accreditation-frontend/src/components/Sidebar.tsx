'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, CheckSquare, BriefcaseIcon, PlusCircle, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import SidebarCriteriaTree from './SidebarCriteriaTree';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payloadStr = atob(payloadBase64);
          const payload = JSON.parse(payloadStr);
          if (payload.role === 'ROLE_SYS_ADMIN' || payload.role === 'SYS_ADMIN') {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error('Token parse hatası', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Çıkış yapıldı');
    router.push('/login');
  };

  const menuItems = [
    { label: 'Ana Sayfa', href: '/dashboard', icon: Home },
    { label: 'Bana Atanan Görevler', href: '/dashboard/my-tasks', icon: CheckSquare },
    { label: 'Benim Atadığım Görevler', href: '/dashboard/assigned-by-me', icon: BriefcaseIcon },
    { label: 'Yeni Görev Ata', href: '/dashboard/create-task', icon: PlusCircle },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'Sistem Yönetimi', href: '/dashboard/admin', icon: Shield });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-lg h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">MEDEK</h1>
        <p className="text-sm text-slate-400 mt-1">Akreditasyon Sistemi</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 text-sm font-medium',
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              {item.label}
            </Link>
          );
        })}

        <SidebarCriteriaTree />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors w-full text-left text-red-400 hover:bg-slate-800 hover:text-red-300 text-sm font-medium"
        >
          <LogOut size={20} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}