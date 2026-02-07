import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("No valid auth header found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Validate the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.log("Claims validation failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    const { challengeId, flag } = await req.json();

    if (!challengeId || !flag) {
      return new Response(
        JSON.stringify({ error: "Missing challengeId or flag" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if competition timer has expired
    const { data: settings } = await supabaseAdmin
      .from("competition_settings")
      .select("end_time, is_active")
      .limit(1)
      .maybeSingle();

    if (settings?.is_active && settings?.end_time) {
      const endTime = new Date(settings.end_time).getTime();
      const now = Date.now();
      if (now > endTime) {
        console.log("Competition has ended, rejecting submission");
        return new Response(
          JSON.stringify({ error: "Competition has ended. No more submissions are accepted." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if already solved
    const { data: existingSolve } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("is_correct", true)
      .single();

    if (existingSolve) {
      return new Response(
        JSON.stringify({ correct: true, message: "Already solved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the challenge flag
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("flag, is_active")
      .eq("id", challengeId)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!challenge.is_active) {
      return new Response(
        JSON.stringify({ error: "Challenge is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if flag is correct (case-sensitive)
    const isCorrect = flag.trim() === challenge.flag;

    // Log the submission
    await supabaseAdmin.from("submissions").insert({
      user_id: userId,
      challenge_id: challengeId,
      submitted_flag: flag.trim(),
      is_correct: isCorrect,
    });

    return new Response(
      JSON.stringify({ correct: isCorrect }),
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
