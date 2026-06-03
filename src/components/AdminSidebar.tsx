'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Plans',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Grading Systems',
    href: '/admin/grading',
    icon: GraduationCap,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-navy-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-turquoise-500 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">KalinEdu</h1>
            <p className="text-xs text-turquoise-400">Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-turquoise-500 text-white shadow-md'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-700">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-navy-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </Link>
        <p className="text-xs text-gray-500 mt-2 px-3">
          KALINITECH SYSTEMS
        </p>
      </div>
    </aside>
  );
}
