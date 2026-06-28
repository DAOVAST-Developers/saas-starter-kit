"use client";

import React, { useEffect, useState } from "react";
import { useOrganizationStore, Organization } from "@/stores/organization-store";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, Plus, Check, Users, Loader2 } from "lucide-react";

export function OrgSwitcher() {
  const supabase = createClient();
  const { currentOrg, organizations, setCurrentOrg, setOrganizations } = useOrganizationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organizations on mount
  useEffect(() => {
    async function loadOrgs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: members, error } = await supabase
          .from("organization_members")
          .select("org_id, organizations(*)")
          .eq("user_id", user.id);

        if (error) throw error;

        const orgsList: Organization[] = (members || []).map((m: any) => m.organizations);
        setOrganizations(orgsList);

        if (orgsList.length > 0 && !currentOrg) {
          setCurrentOrg(orgsList[0] ?? null);
        }
      } catch (err) {
        console.error("Failed to load organizations:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrgs();
  }, [supabase, setCurrentOrg, setOrganizations, currentOrg]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // 1. Insert organization
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: newOrgName, slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Insert member as owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          org_id: newOrg.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      const created: Organization = newOrg;
      setOrganizations([...organizations, created]);
      setCurrentOrg(created);
      setNewOrgName("");
      setIsCreating(false);
      setIsOpen(false);
    } catch (err) {
      console.error("Error creating organization:", err);
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-slate-500 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading teams...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-56 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
      >
        <div className="flex items-center space-x-2 truncate">
          <Users className="h-4 w-4 text-violet-400 shrink-0" />
          <span className="font-medium truncate">
            {currentOrg ? currentOrg.name : "Personal Workspace"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 animate-fadeIn">
          <div className="text-xs font-semibold text-slate-500 px-3 py-1.5 uppercase tracking-wider">
            Switch Workspace
          </div>
          
          <div className="space-y-1 my-1 max-h-40 overflow-y-auto">
            {organizations.map((org: Organization) => (
              <button
                key={org.id}
                onClick={() => {
                  setCurrentOrg(org);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition-all text-left cursor-pointer"
              >
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && (
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 my-1.5"></div>

          <form onSubmit={handleCreateOrg} className="p-2 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Create New Team
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Team Name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg p-1.5 text-xs cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
