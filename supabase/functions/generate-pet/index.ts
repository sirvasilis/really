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
    
    let imageUrl: string;

    if (petType === "dog") {
      // Fetch dog image from Dog CEO API
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      
      if (!response.ok) {
        throw new Error("Failed to fetch dog image");
      }

      const data = await response.json();
      imageUrl = data.message;
    } else {
      // Fetch cat image from Cat API
      const response = await fetch("https://api.thecatapi.com/v1/images/search");
      
      if (!response.ok) {
        throw new Error("Failed to fetch cat image");
      }

      const data = await response.json();
      imageUrl = data[0].url;
    }

    console.log(`Fetched ${petType} image: ${imageUrl}`);

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
    console.error("Error fetching pet image:", error);
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
