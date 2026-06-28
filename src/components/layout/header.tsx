"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Sparkles } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    return { label, href };
  });

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-30 sticky top-0">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <span className="text-slate-600">Workspace</span>
        {breadcrumbs.length > 0 && <span className="text-slate-700">/</span>}
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              <span
                className={`font-medium ${
                  isLast ? "text-slate-200" : "text-slate-400 hover:text-slate-350 cursor-pointer"
                }`}
              >
                {crumb.label}
              </span>
              {!isLast && <span className="text-slate-700">/</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full bg-slate-900 border border-slate-800/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-lg transition-all cursor-pointer relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </button>

        {/* Pro Plan badge */}
        <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-violet-650/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-semibold">
          <Sparkles className="h-3 w-3" />
          <span>Pro Tier</span>
        </div>
      </div>
    </header>
  );
}
