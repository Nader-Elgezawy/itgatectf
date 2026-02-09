import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const certificateId = url.searchParams.get("id");

    if (!certificateId || typeof certificateId !== "string" || certificateId.length > 20) {
      return new Response(
        JSON.stringify({ error: "Invalid certificate ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate format: ITGCTF-XXXXXXXX
    if (!/^ITGCTF-[A-Z0-9]{8}$/.test(certificateId)) {
      return new Response(
        JSON.stringify({ error: "Invalid certificate format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up the profile by certificate_id
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, player1_name, player2_name, player3_name, certificate_id, created_at")
      .eq("certificate_id", certificateId)
      .maybeSingle();

    if (error || !profile) {
      return new Response(
        JSON.stringify({ valid: false, error: "Certificate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if team is admin (admins don't get certificates)
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id);

    if (roles?.some((r: any) => r.role === "admin")) {
      return new Response(
        JSON.stringify({ valid: false, error: "Certificate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get team stats from leaderboard
    const { data: leaderboard } = await supabaseAdmin.rpc("get_leaderboard");
    
    const teamIndex = leaderboard?.findIndex((e: any) => e.user_id === profile.id) ?? -1;
    const teamEntry = teamIndex !== -1 ? leaderboard[teamIndex] : null;

    // Check if team solved at least one challenge
    const solvedCount = teamEntry ? Number(teamEntry.solved_count) : 0;
    if (solvedCount === 0) {
      return new Response(
        JSON.stringify({ valid: false, error: "Certificate not yet earned" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        certificate: {
          id: profile.certificate_id,
          teamName: profile.username,
          players: [profile.player1_name, profile.player2_name, profile.player3_name].filter(Boolean),
          rank: teamIndex + 1,
          totalPoints: teamEntry ? Number(teamEntry.total_points) : 0,
          solvedCount,
          totalParticipants: leaderboard?.length ?? 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
