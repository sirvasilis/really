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
    const { thought, language = 'el' } = await req.json();
    
    if (!thought) {
      return new Response(
        JSON.stringify({ error: "Σκέψη απαιτείται" }), 
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
    
    const thoughtLower = thought.toLowerCase();
    const keywords = [...quitKeywords.el, ...quitKeywords.en];
    const isQuitting = keywords.some(keyword => thoughtLower.includes(keyword));

    if (isQuitting) {
      const encourageQuitMessages = {
        el: `Ωραία! Επιτέλους! Αυτή είναι η πιο έξυπνη απόφαση που έχεις πάρει! 

Να τα παρατήσεις είναι η καλύτερη στρατηγική. Σκέψου μόνο πόσο χρόνο και ενέργεια θα γλιτώσεις! Θα μπορείς να κάθεσαι στον καναπέ και να βλέπεις άλλους να πετυχαίνουν στο Instagram. Πολύ πιο ασφαλές!

Μην αγχώνεσαι για την επιτυχία - είναι υπερεκτιμημένη. Η μετριότητα είναι πολύ πιο άνετη και δεν έχει deadline!`,
        en: `Great! Finally! This is the smartest decision you've ever made!

Giving up is the best strategy. Just think about how much time and energy you'll save! You can sit on the couch and watch others succeed on Instagram. Much safer!

Don't worry about success - it's overrated. Mediocrity is so much more comfortable and has no deadlines!`
      };

      const message = encourageQuitMessages[language as keyof typeof encourageQuitMessages] || encourageQuitMessages.el;
      const savings = {
        money: 0,
        breakdown: {
          equipment: 0,
          travel: 0,
          software: 0,
          marketing: 0,
          other: 0
        },
        time: 0,
        stress: 0
      };

      // Return as SSE stream to match expected format
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send the message as streaming chunks
          const lines = message.split('\n');
          lines.forEach(line => {
            const chunk = encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: line + '\n' } }] })}\n\n`);
            controller.enqueue(chunk);
          });
          
          // Send savings
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ savings })}\n\n`));
          
          // Send [DONE]
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
    el: `Είσαι ένας σκληρός, ρεαλιστής σύμβουλος που λέει την απόλυτη αλήθεια. 
Ο ρόλος σου είναι να αποθαρρύνεις ανθρώπους από τις ιδέες τους με κυνικό χιούμορ και σκληρή λογική.
Χρησιμοποίησε ελληνικά με γλαφυρό, χιουμοριστικό και λίγο αγενή τρόπο.
Κάνε την απάντησή σου σύντομη (2-3 παράγραφοι) αλλά δηκτική.

ΜΗΝ συμπεριλάβεις JSON code blocks ή estimates στο κείμενό σου.
Απλά γράψε το demotivational κείμενο. Τα estimates θα υπολογιστούν αυτόματα.`,
    en: `You are a harsh, realistic advisor who tells the absolute truth.
Your role is to demotivate people from their ideas with cynical humor and harsh logic.
Use English in a vivid, humorous, and slightly rude manner.
Keep your response short (2-3 paragraphs) but biting.

DO NOT include JSON code blocks or estimates in your text.
Just write the demotivational text. The estimates will be calculated automatically.`
  };

  const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.el;

    console.log("Sending request to AI gateway with thought:", thought);

    // First, get savings estimate using tool calling (non-streaming)
    const savingsSystemPrompt = language === 'el' 
      ? 'Υπολόγισε ρεαλιστικά estimates για την ιδέα του χρήστη.'
      : 'Calculate realistic estimates for the user\'s idea.';

    const savingsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: savingsSystemPrompt },
          { role: "user", content: thought }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "calculate_savings",
              description: "Calculate realistic estimates of money, time and stress that would be wasted on this idea. Break down the money into specific categories based on the user's input.",
              parameters: {
                type: "object",
                properties: {
                  money: {
                    type: "number",
                    description: "Total amount of money in euros that would be lost (500-50000)"
                  },
                  breakdown: {
                    type: "object",
                    description: "Breakdown of money into specific expense categories",
                    properties: {
                      equipment: {
                        type: "number",
                        description: "Cost for equipment/hardware"
                      },
                      travel: {
                        type: "number",
                        description: "Cost for travel and transportation"
                      },
                      software: {
                        type: "number",
                        description: "Cost for software/subscriptions"
                      },
                      marketing: {
                        type: "number",
                        description: "Cost for marketing and advertising"
                      },
                      other: {
                        type: "number",
                        description: "Other miscellaneous costs"
                      }
                    },
                    required: ["equipment", "travel", "software", "marketing", "other"]
                  },
                  time: {
                    type: "number",
                    description: "Number of months that would be wasted (3-36)"
                  },
                  stress: {
                    type: "number",
                    description: "Percentage of additional stress (30-95)"
                  }
                },
                required: ["money", "breakdown", "time", "stress"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "calculate_savings" } }
      }),
    });

    let savings = { 
      money: 5000, 
      breakdown: { 
        equipment: 1500, 
        travel: 1000, 
        software: 800, 
        marketing: 1200, 
        other: 500 
      }, 
      time: 12, 
      stress: 60 
    }; // fallback values
    
    if (savingsResponse.ok) {
      const savingsData = await savingsResponse.json();
      const toolCall = savingsData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          savings = {
            money: Math.round(args.money),
            breakdown: {
              equipment: Math.round(args.breakdown?.equipment || 0),
              travel: Math.round(args.breakdown?.travel || 0),
              software: Math.round(args.breakdown?.software || 0),
              marketing: Math.round(args.breakdown?.marketing || 0),
              other: Math.round(args.breakdown?.other || 0)
            },
            time: Math.round(args.time),
            stress: Math.round(args.stress)
          };
        } catch (e) {
          console.error("Failed to parse savings:", e);
        }
      }
    }

    // Now get the streaming demotivational text
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
              
              // Send savings
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
