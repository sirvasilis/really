import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const petPrompts: { [key: string]: string[] } = {
      cat: [
        "An adorable fluffy kitten with big eyes playing with a ball of yarn",
        "A cute cat wearing tiny sunglasses lounging in a sunny spot",
        "A funny cat making a silly face while trying to catch a laser pointer",
        "A sweet sleeping kitten curled up in a cozy blanket",
        "A playful cat jumping and trying to catch a butterfly"
      ],
      dog: [
        "An adorable puppy with floppy ears playing in the grass",
        "A cute dog wearing a bow tie and smiling at the camera",
        "A funny dog with its tongue out enjoying a sunny day",
        "A sweet dog cuddling with a teddy bear",
        "A playful dog running happily through a field"
      ]
    };

    const prompts = petPrompts[petType] || petPrompts.cat;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    console.log(`Generating ${petType} image with prompt: ${randomPrompt}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
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
    console.error("Error generating pet image:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
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
