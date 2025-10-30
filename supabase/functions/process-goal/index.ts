import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal, language } = await req.json();
    
    if (!goal) {
      return new Response(
        JSON.stringify({ error: "Goal is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === "el" 
      ? "Είσαι ένας γλωσσικός βοηθός. Πάρε το κείμενο που σου δίνει ο χρήστης και επέστρεψε μια γραμματικά σωστή έκδοση που να ταιριάζει στη φράση 'μπορείς να...'. Μην προσθέσεις εισαγωγικά ή επιπλέον κείμενο, απλά επέστρεψε τη διορθωμένη φράση. Παράδειγμα: αν ο χρήστης γράψει 'γινω πλουσιος', εσύ επιστρέφεις 'γίνεις πλούσιος'."
      : "You are a language assistant. Take the user's text and return a grammatically correct version that fits in the phrase 'you can...'. Don't add quotes or extra text, just return the corrected phrase. Example: if user writes 'become rich', you return 'become rich'.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: goal }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const processedGoal = data.choices?.[0]?.message?.content?.trim() || goal;

    return new Response(
      JSON.stringify({ processedGoal }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-goal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});