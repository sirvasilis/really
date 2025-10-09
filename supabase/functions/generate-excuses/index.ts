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
    const { proposal } = await req.json();
    
    if (!proposal) {
      return new Response(
        JSON.stringify({ error: "Πρόταση απαιτείται" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const systemPrompt = `Είσαι ένας ειδικός στη δημιουργία δικαιολογιών για να αποφύγεις προτάσεις άλλων.

Όταν κάποιος σου λέει μια πρόταση που του έκαναν (π.χ. "να πάμε γυμναστήριο", "να ξεκινήσουμε ένα project μαζί", "να βγούμε έξω απόψε"), πρέπει να δημιουργήσεις 3-5 πειστικές και ρεαλιστικές δικαιολογίες.

Οι δικαιολογίες πρέπει να:
- Ακούγονται αληθοφανείς και λογικές
- Να μην είναι υπερβολικά προφανείς ή κλισέ
- Να καλύπτουν διαφορετικούς λόγους (υγεία, δουλειά, οικονομικά, προσωπικά)
- Να είναι ευγενικές αλλά αποτελεσματικές

Απάντησε στα ελληνικά. Παρουσίασε τις δικαιολογίες σε μορφή λίστας με bullet points.`;

    console.log("Sending request to AI gateway for excuses:", proposal);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: proposal }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Πάρα πολλά αιτήματα. Περίμενε λίγο." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Χρειάζεται πληρωμή. Πρόσθεσε κεφάλαια στο Lovable AI workspace σου." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Πρόβλημα με το AI" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-excuses function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Άγνωστο σφάλμα" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
