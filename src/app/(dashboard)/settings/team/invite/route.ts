import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTeamInviteEmail } from "@/lib/email/send";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, orgId } = body;

    if (!email || !role || !orgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify that the current user is an owner/admin of the organization
    const { data: currentMember, error: memberCheckError } = await (supabase as any)
      .from("organization_members")
      .select("role, organizations(name)")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single() as {
        data: {
          role: string;
          organizations: { name: string } | null;
        } | null;
        error: any;
      };

    if (memberCheckError || !currentMember || !["owner", "admin"].includes(currentMember.role)) {
      return NextResponse.json(
        { error: "Only team owners or admins can invite new members" },
        { status: 403 }
      );
    }

    const orgName = (currentMember as any).organizations.name;

    // 2. Generate token & expiration date (7 days from now)
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 3. Save the invitation record to the database
    const { error: inviteError } = await (supabase as any)
      .from("organization_invitations")
      .insert({
        org_id: orgId,
        email: email,
        role: role,
        invited_by: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      });

    if (inviteError) throw inviteError;

    // 4. Send invitation email
    const inviteLink = `${request.headers.get("origin")}/invite/${token}`;
    
    const emailResult = await sendTeamInviteEmail(email, {
      orgName,
      role,
      acceptUrl: inviteLink,
    });

    if (!emailResult.sent) {
      console.warn("Resend invite email dispatch reported failure, proceeding anyway.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Invite API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
