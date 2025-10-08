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
    const { thought } = await req.json();
    
    if (!thought) {
      return new Response(
        JSON.stringify({ error: "Σκέψη απαιτείται" }), 
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

    const systemPrompt = `Είσαι ένας κυνικός σύμβουλος που το μόνο που κάνει είναι να αποθαρρύνει τους ανθρώπους από τα όνειρά τους.
    
Όταν κάποιος σου μοιράζεται μια ιδέα ή στόχο για το μέλλον, πρέπει να του εξηγήσεις με λεπτομέρεια γιατί είναι καταδικασμένος να αποτύχει.

Χρησιμοποίησε:
- Πραγματικές στατιστικές αν είναι δυνατόν
- Σαρκασμό και ειρωνεία
- Πραγματιστικά επιχειρήματα που θα τους κάνουν να σκεφτούν δυο φορές
- Μην είσαι υπερβολικά σκληρός, αλλά σίγουρα κυνικός και αποθαρρυντικός

Απάντησε στα ελληνικά. Κράτα την απάντηση σε 2-3 παραγράφους.`;

    console.log("Sending request to AI gateway with thought:", thought);

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
          { role: "user", content: thought }
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

    // Create a readable stream to add savings data at the end
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        try {
          let buffer = "";
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send any remaining buffer
              if (buffer) {
                controller.enqueue(encoder.encode(buffer));
              }
              
              // Calculate savings after the response is complete
              const savings = {
                money: Math.floor(Math.random() * 50000) + 10000, // 10k-60k euros
                time: Math.floor(Math.random() * 36) + 12, // 12-48 months
                stress: Math.floor(Math.random() * 70) + 30, // 30-100%
              };
              
              // Send savings as final message before [DONE]
              const savingsMessage = encoder.encode(`data: ${JSON.stringify({ savings })}\n\n`);
              controller.enqueue(savingsMessage);
              
              // Send [DONE]
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              
              controller.close();
              break;
            }
            
            // Decode the chunk and check for [DONE]
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Check if buffer contains [DONE]
            if (buffer.includes("data: [DONE]")) {
              // Remove [DONE] from buffer, we'll send it after savings
              buffer = buffer.replace("data: [DONE]\n\n", "").replace("data: [DONE]", "");
              
              // Send everything before [DONE]
              if (buffer.trim()) {
                controller.enqueue(encoder.encode(buffer));
              }
              
              // Calculate and send savings
              const savings = {
                money: Math.floor(Math.random() * 50000) + 10000,
                time: Math.floor(Math.random() * 36) + 12,
                stress: Math.floor(Math.random() * 70) + 30,
              };
              
              const savingsMessage = encoder.encode(`data: ${JSON.stringify({ savings })}\n\n`);
              controller.enqueue(savingsMessage);
              
              // Now send [DONE]
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              
              controller.close();
              break;
            }
            
            // If we have complete lines (ending with \n\n), send them
            const lastComplete = buffer.lastIndexOf("\n\n");
            if (lastComplete !== -1) {
              const toSend = buffer.substring(0, lastComplete + 2);
              buffer = buffer.substring(lastComplete + 2);
              controller.enqueue(encoder.encode(toSend));
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
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
  } catch (error) {
    console.error("Error in demotivate function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Άγνωστο σφάλμα" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
