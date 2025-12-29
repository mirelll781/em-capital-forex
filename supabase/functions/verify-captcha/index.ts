import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyCaptchaRequest {
  token: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyCaptchaRequest = await req.json();

    if (!token) {
      console.error("No CAPTCHA token provided");
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use test secret key for development, or real key from env
    const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY") || "1x0000000000000000000000000000000AA";
    
    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify with Cloudflare Turnstile
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const verifyResult = await verifyResponse.json();
    console.log("Turnstile verification result:", verifyResult);

    if (verifyResult.success) {
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.error("CAPTCHA verification failed:", verifyResult["error-codes"]);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "CAPTCHA verification failed",
          codes: verifyResult["error-codes"]
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-captcha function:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
