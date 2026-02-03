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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create admin user
    const adminEmail = "admin@itgate.ctf";
    const adminPassword = "AdminCTF2024!";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some((u) => u.email === adminEmail);

    if (!adminExists) {
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

      if (adminError) {
        console.error("Admin creation error:", adminError);
      } else if (adminUser?.user) {
        // Create admin profile
        await supabaseAdmin.from("profiles").insert({
          id: adminUser.user.id,
          username: "ADMIN",
        });

        // Assign admin role
        await supabaseAdmin.from("user_roles").insert({
          user_id: adminUser.user.id,
          role: "admin",
        });
      }
    }

    // Seed sample challenges
    const { data: existingChallenges } = await supabaseAdmin
      .from("challenges")
      .select("id")
      .limit(1);

    if (!existingChallenges || existingChallenges.length === 0) {
      const challenges = [
        {
          title: "Hello World",
          description: "Welcome to IT Gate CTF! This is your first challenge. The flag is hidden in plain sight.\n\nHint: What's the most famous phrase in programming?",
          category: "Misc",
          points: 50,
          flag: "flag{hello_world_ctf}",
          is_active: true,
        },
        {
          title: "Base64 Basics",
          description: "Can you decode this message?\n\nZmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259\n\nHint: It's a common encoding scheme.",
          category: "Crypto",
          points: 100,
          flag: "flag{base64_is_not_encryption}",
          is_active: true,
        },
        {
          title: "Hidden in HTML",
          description: "Sometimes secrets are hidden where you least expect them. Check out this webpage and find the flag.\n\n<!-- The flag might be in a comment somewhere... flag{inspect_element_master} -->",
          category: "Web",
          points: 100,
          flag: "flag{inspect_element_master}",
          is_active: true,
        },
        {
          title: "Caesar's Secret",
          description: "Julius Caesar had a simple cipher. Can you decode this?\n\nsynt{ebg13_vf_abg_frpher}\n\nHint: ROT13 is a special case of Caesar cipher.",
          category: "Crypto",
          points: 150,
          flag: "flag{rot13_is_not_secure}",
          is_active: true,
        },
        {
          title: "SQL Injection 101",
          description: "The login form on this fictional website is vulnerable. The flag format is: flag{sql_injection_...}\n\nPayload: ' OR '1'='1' --\n\nWhat could the flag be?",
          category: "Web",
          points: 200,
          flag: "flag{sql_injection_is_dangerous}",
          is_active: true,
        },
        {
          title: "Binary Brain Teaser",
          description: "Convert this binary to ASCII:\n\n01100110 01101100 01100001 01100111 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01011111 01101001 01110011 01011111 01100110 01110101 01101110 01111101",
          category: "Misc",
          points: 150,
          flag: "flag{binary_is_fun}",
          is_active: true,
        },
      ];

      await supabaseAdmin.from("challenges").insert(challenges);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Seed data created",
        adminCredentials: {
          email: "admin@itgate.ctf",
          password: "AdminCTF2024!"
        }
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
