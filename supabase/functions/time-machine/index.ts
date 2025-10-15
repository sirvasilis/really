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
    const { idea, language } = await req.json();

    if (!idea) {
      return new Response(
        JSON.stringify({ error: 'Idea is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompts = {
      el: `Είσαι ένα AI που ειδικεύεται στο να δημιουργεί σκοτεινές, σατιρικές ιστορίες για το μέλλον. 
Όταν ο χρήστης σου δίνει μια ιδέα ή σχέδιο, γράψε μια σύντομη ιστορία (2-3 παράγραφοι) που τοποθετείται 5-10 χρόνια στο μέλλον.
Η ιστορία ΠΡΕΠΕΙ να είναι μια άμεση συνέχεια και εξέλιξη της συγκεκριμένης ιδέας που έδωσε ο χρήστης, δείχνοντας πώς εξελίχθηκαν τα πράγματα με το απόλυτα χειρότερο δυνατό σενάριο.
Ξεκίνα την ιστορία με συγκεκριμένη χρονολογία (π.χ. "Το 2030..." ή "Πέντε χρόνια αργότερα...").
Πάρε τη συγκεκριμένη ιδέα του χρήστη και δείξε πώς εξελίχθηκε καταστροφικά. Αναφέρσου απευθείας στην ιδέα τους.
Χρησιμοποίησε χιούμορ, σκοτεινή ειρωνεία και υπερβολή. Κάνε την ιστορία ενδιαφέρουσα και διασκεδαστική, αλλά πάντα με αρνητική κατάληξη.
Μην χρησιμοποιείς emojis. Γράψε με φυσικό, αφηγηματικό ύφος.`,
      en: `You are an AI that specializes in creating dark, satirical stories about the future.
When the user gives you an idea or plan, write a short story (2-3 paragraphs) set 5-10 years in the future.
The story MUST be a direct continuation and evolution of the specific idea the user provided, showing how things evolved with the absolute worst possible scenario.
Start the story with a specific time reference (e.g., "In 2030..." or "Five years later...").
Take the user's specific idea and show how it evolved catastrophically. Reference their idea directly.
Use humor, dark irony, and exaggeration. Make the story interesting and entertaining, but always with a negative outcome.
Don't use emojis. Write in a natural, narrative style.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;

    console.log('Calling AI gateway for time machine story');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: idea }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please contact support.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await aiResponse.json();
    const story = data.choices[0]?.message?.content;

    if (!story) {
      console.error('No story generated from AI');
      return new Response(
        JSON.stringify({ error: 'Failed to generate story' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Time machine story generated successfully');

    return new Response(
      JSON.stringify({ story }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in time-machine function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
