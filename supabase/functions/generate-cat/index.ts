import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const prompts = [
      "A cute orange tabby kitten with big round eyes, sitting in a tiny cardboard box that's way too small, looking absolutely adorable and silly",
      "A fluffy white Persian cat making a derpy face with its tongue slightly out, ultra cute and funny",
      "A chubby gray British Shorthair cat doing a funny yoga pose, stretching in the most adorable way",
      "A playful calico kitten with curious eyes, tangled up in colorful yarn, looking sweet and mischievous",
      "A tiny black kitten with big green eyes, wearing a miniature bowtie, looking extremely dignified yet adorable",
      "A ginger cat lying on its back with paws in the air, looking completely relaxed and silly",
      "A fluffy Ragdoll cat with blue eyes, peeking out from behind curtains with the cutest expression",
      "A Scottish Fold cat with folded ears, sitting like a human in a tiny chair, absolutely adorable",
      "A Maine Coon kitten with tufted ears, making surprised face at a butterfly, super cute and funny",
      "A Siamese cat with crossed eyes, looking at the camera with the most charming and silly expression"
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: randomPrompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
