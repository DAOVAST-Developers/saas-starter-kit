"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OrgSwitcher } from "@/components/org-switcher";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    }
    fetchUserRole();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Team Settings", href: "/settings/team", icon: Users },
    { label: "Billing & Plans", href: "/settings/billing", icon: CreditCard },
    { label: "User Profile", href: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Panel", href: "/admin", icon: Shield });
  }

  return (
    <>
      {/* Mobile menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 py-6 px-4 space-y-6">
          {/* Header branding */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/35 border border-violet-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              SaaS Starter Kit
            </span>
          </div>

          {/* Org Switcher */}
          <div className="px-1">
            <OrgSwitcher />
          </div>

          {/* Nav links */}
          <nav className="flex-1 space-y-1.5 px-1 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-violet-600/10 text-violet-400 border border-violet-500/15"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                      isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-350"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile + logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700 text-xs truncate uppercase">
              {userEmail ? userEmail[0] : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-500 font-medium">Logged in as</p>
              <p className="text-sm font-semibold text-slate-300 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
