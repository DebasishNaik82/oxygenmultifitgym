'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Loader2, 
  Dumbbell,
  Users,
  Image as ImageIcon,
  Star,
  Layers,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Facilities', href: '/admin/facilities', icon: Layers },
  { name: 'Services', href: '/admin/services', icon: Activity },
  { name: 'Membership', href: '/admin/membership', icon: Users },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const timer = setTimeout(() => {
      const authenticated = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(authenticated);
      setLoading(false);

      if (isLoginPage) {
        if (authenticated) {
          router.push('/admin');
        }
      } else {
        if (!authenticated) {
          router.push('/admin/login');
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, isLoginPage, router]);

  // If on login page, render children directly without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state for protected admin routes
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  // Not authenticated for protected admin routes
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-brand-green" />
            <span className="text-lg font-black uppercase italic tracking-tighter">
              O2 <span className="text-brand-green">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                pathname === link.href 
                  ? "bg-brand-green text-brand-charcoal" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-10">
        {children}
      </main>
    </div>
  );
}
