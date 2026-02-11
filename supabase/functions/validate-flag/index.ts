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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const { challengeId, questionId, flag } = await req.json();

    if (!challengeId || !flag) {
      return new Response(
        JSON.stringify({ error: "Missing challengeId or flag" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      if (Date.now() > endTime) {
        return new Response(
          JSON.stringify({ error: "Competition has ended. No more submissions are accepted." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // If questionId is provided, validate against a sub-question
    if (questionId) {
      // Check if already solved this question
      const { data: existingSolve } = await supabaseAdmin
        .from("submissions")
        .select("id")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .eq("question_id", questionId)
        .eq("is_correct", true)
        .limit(1)
        .maybeSingle();

      if (existingSolve) {
        return new Response(
          JSON.stringify({ correct: true, message: "Already solved" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the question flag
      const { data: question, error: questionError } = await supabaseAdmin
        .from("challenge_questions")
        .select("flag, challenge_id")
        .eq("id", questionId)
        .single();

      if (questionError || !question || question.challenge_id !== challengeId) {
        return new Response(
          JSON.stringify({ error: "Question not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check challenge is active
      const { data: challenge } = await supabaseAdmin
        .from("challenges")
        .select("is_active")
        .eq("id", challengeId)
        .single();

      if (!challenge?.is_active) {
        return new Response(
          JSON.stringify({ error: "Challenge is not active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Constant-time comparison
      const submittedFlag = flag.trim();
      const correctFlag = question.flag;
      let isCorrect = submittedFlag.length === correctFlag.length;
      const len = Math.max(submittedFlag.length, correctFlag.length);
      for (let i = 0; i < len; i++) {
        const a = i < submittedFlag.length ? submittedFlag.charCodeAt(i) : 0;
        const b = i < correctFlag.length ? correctFlag.charCodeAt(i) : 0;
        if (a !== b) isCorrect = false;
      }

      await supabaseAdmin.from("submissions").insert({
        user_id: userId,
        challenge_id: challengeId,
        question_id: questionId,
        submitted_flag: flag.trim(),
        is_correct: isCorrect,
      });

      return new Response(
        JSON.stringify({ correct: isCorrect }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Original flow: validate against challenge-level flag
    const { data: existingSolve } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("is_correct", true)
      .is("question_id", null)
      .limit(1)
      .maybeSingle();

    if (existingSolve) {
      return new Response(
        JSON.stringify({ correct: true, message: "Already solved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const submittedFlag = flag.trim();
    const correctFlag = challenge.flag;
    let isCorrect = submittedFlag.length === correctFlag.length;
    const len = Math.max(submittedFlag.length, correctFlag.length);
    for (let i = 0; i < len; i++) {
      const a = i < submittedFlag.length ? submittedFlag.charCodeAt(i) : 0;
      const b = i < correctFlag.length ? correctFlag.charCodeAt(i) : 0;
      if (a !== b) isCorrect = false;
    }

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
