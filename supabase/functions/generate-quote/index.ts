import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { thought } = await req.json();
    console.log('Generating demotivational quote for:', thought);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Είσαι ένας κυνικός φιλόσοφος που δημιουργεί σύντομα, αιχμηρά demotivational quotes στα ελληνικά. 
Το quote πρέπει να είναι:
- Μία μόνο πρόταση (max 15-20 λέξεις)
- Κυνικό και αποθαρρυντικό
- Σχετικό με το θέμα που δόθηκε ή γενικό αν δεν δόθηκε θέμα
- Χωρίς εισαγωγικά

Παράδειγμα: "Η επιτυχία είναι σπάνια, η αποτυχία είναι η νόρμα."`;

    const userPrompt = thought && thought.trim() 
      ? `Δημιούργησε ένα demotivational quote για: ${thought}`
      : `Δημιούργησε ένα γενικό demotivational quote`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const quote = data.choices[0].message.content;

    console.log('Generated quote:', quote);

    return new Response(
      JSON.stringify({ quote }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-quote function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
