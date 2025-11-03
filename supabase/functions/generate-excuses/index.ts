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
    const { proposal, language = 'el' } = await req.json();
    
    if (!proposal) {
      return new Response(
        JSON.stringify({ error: "Πρόταση απαιτείται" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if user wants to quit
    const quitKeywords = {
      el: ['παρατάω', 'παρατω', 'quit', 'τα παρατάω', 'τα παρατω', 'εγκαταλείπω', 'εγκαταλειπω', 'παραιτούμαι', 'παραιτουμαι'],
      en: ['quit', 'give up', 'giving up', 'i quit', 'im quitting', 'surrender', 'stop trying']
    };
    
    const proposalLower = proposal.toLowerCase();
    const keywords = [...quitKeywords.el, ...quitKeywords.en];
    const isQuitting = keywords.some(keyword => proposalLower.includes(keyword));

    if (isQuitting) {
      const encourageQuitMessages = {
        el: `Σωστά! Η καλύτερη δικαιολογία είναι να παραδεχτείς ότι δεν έχεις ούτε το κουράγιο ούτε την επιμονή!

1. "Δεν είμαι φτιαγμένος για την επιτυχία - προτιμώ την ασφάλεια της αποτυχίας"
2. "Το να προσπαθώ με κουράζει - η μετριότητα είναι πολύ πιο χαλαρή"
3. "Άλλοι είναι καλύτεροι από εμένα anyway, γιατί να προσπαθήσω;"
4. "Δεν αξίζει τον κόπο - το Netflix με περιμένει"
5. "Είναι πολύ δύσκολο και δεν θέλω να νιώσω άβολα"`,
        en: `Exactly! The best excuse is to admit you don't have the courage or persistence!

1. "I'm not made for success - I prefer the safety of failure"
2. "Trying tires me out - mediocrity is so much more relaxing"
3. "Others are better than me anyway, why bother trying?"
4. "It's not worth the effort - Netflix is waiting for me"
5. "It's too hard and I don't want to feel uncomfortable"`
      };

      const message = encourageQuitMessages[language as keyof typeof encourageQuitMessages] || encourageQuitMessages.el;

      // Return as SSE stream to match expected format
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const lines = message.split('\n');
          lines.forEach(line => {
            const chunk = encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: line + '\n' } }] })}\n\n`);
            controller.enqueue(chunk);
          });
          
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
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

  const systemPrompts = {
    el: `Είσαι ειδικός στο να βρίσκεις δικαιολογίες για να αποφύγεις προτάσεις που δεν θέλεις να κάνεις.
Ο ρόλος σου είναι να δημιουργήσεις 5 έξυπνες, δημιουργικές και πειστικές δικαιολογίες.
Χρησιμοποίησε ελληνικά με χιουμοριστικό τρόπο.
Κάνε τις δικαιολογίες να ακούγονται αληθοφανείς αλλά ταυτόχρονα προφανώς αστείες.

Μορφοποίηση:
1. [Πρώτη δικαιολογία]
2. [Δεύτερη δικαιολογία]
3. [Τρίτη δικαιολογία]
4. [Τέταρτη δικαιολογία]
5. [Πέμπτη δικαιολογία]`,
    en: `You are an expert at finding excuses to avoid proposals you don't want to do.
Your role is to create 5 clever, creative and convincing excuses.
Use English in a humorous way.
Make the excuses sound believable but at the same time obviously funny.

Format:
1. [First excuse]
2. [Second excuse]
3. [Third excuse]
4. [Fourth excuse]
5. [Fifth excuse]`
  };

  const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.el;

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
