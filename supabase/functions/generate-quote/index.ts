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
    const { thought, language = 'el' } = await req.json();
    console.log('Generating demotivational quote for:', thought);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompts = {
      el: `Είσαι ειδικός στη δημιουργία demotivational quotes.
Ο ρόλος σου είναι να δημιουργήσεις ένα σύντομο, κυνικό quote που αποθαρρύνει.
Χρησιμοποίησε ελληνικά με σκοτεινό χιούμορ.

Το quote πρέπει να είναι:
- Μία μόνο πρόταση (max 15-20 λέξεις)
- Κυνικό και αποθαρρυντικό
- Σχετικό με το θέμα που δόθηκε ή γενικό αν δεν δόθηκε θέμα
- Χωρίς εισαγωγικά

Παράδειγμα: "Η επιτυχία είναι σπάνια, η αποτυχία είναι η νόρμα."`,
      en: `You are an expert at creating demotivational quotes.
Your role is to create a short, cynical quote that demotivates.
Use English with dark humor.

The quote must be:
- Only one sentence (max 15-20 words)
- Cynical and demotivating
- Related to the given topic or general if no topic was given
- Without quotation marks

Example: "Success is rare, failure is the norm."`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.el;

    const userPrompts = {
      el: {
        withThought: `Δημιούργησε ένα demotivational quote για: ${thought}`,
        withoutThought: `Δημιούργησε ένα γενικό demotivational quote`
      },
      en: {
        withThought: `Create a demotivational quote about: ${thought}`,
        withoutThought: `Create a general demotivational quote`
      }
    };

    const lang = language as keyof typeof userPrompts;
    const userPrompt = thought && thought.trim() 
      ? userPrompts[lang].withThought
      : userPrompts[lang].withoutThought;

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
