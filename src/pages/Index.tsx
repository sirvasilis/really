import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, Skull, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [thought, setThought] = useState("");
  const [demotivation, setDemotivation] = useState("");
  const [excuses, setExcuses] = useState("");
  const [quote, setQuote] = useState("");
  const [savings, setSavings] = useState<{ money: number; time: number; stress: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"demotivate" | "excuses" | "quote" | null>(null);
  const { toast } = useToast();

  const handleDemotivate = async () => {
    if (!thought.trim()) {
      toast({
        title: "Γράψε κάτι!",
        description: "Πώς να σε αποθαρρύνω αν δεν μου πεις τι ονειρεύεσαι;",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMode("demotivate");
    setDemotivation("");
    setExcuses("");
    setQuote("");
    setSavings(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/demotivate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ thought }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get demotivation");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentDemotivation = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check for savings data
            if (parsed.savings) {
              setSavings(parsed.savings);
            } else {
              // Regular streaming content
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                currentDemotivation += content;
                setDemotivation(currentDemotivation);
              }
            }
          } catch (e) {
            console.error("JSON parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Κάτι πήγε στραβά",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setMode(null);
    }
  };

  const handleGenerateExcuses = async () => {
    if (!thought.trim()) {
      toast({
        title: "Γράψε κάτι!",
        description: "Πώς να δημιουργήσω δικαιολογίες αν δεν μου πεις την πρόταση;",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMode("excuses");
    setExcuses("");
    setDemotivation("");
    setQuote("");
    setSavings(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-excuses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ proposal: thought }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate excuses");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentExcuses = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              currentExcuses += content;
              setExcuses(currentExcuses);
            }
          } catch (e) {
            console.error("JSON parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Κάτι πήγε στραβά",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setMode(null);
    }
  };

  const handleGenerateQuote = async () => {
    setIsLoading(true);
    setMode("quote");
    setQuote("");
    setDemotivation("");
    setExcuses("");
    setSavings(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ thought }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quote");
      }

      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Κάτι πήγε στραβά",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Skull className="w-12 h-12 text-destructive animate-pulse-glow" />
            <h1 className="text-5xl font-black text-foreground tracking-tight">
              DEMOTIVATOR
            </h1>
            <Skull className="w-12 h-12 text-destructive animate-pulse-glow" />
          </div>
          <p className="text-muted-foreground text-lg">
            Μοιράσου τα όνειρά σου. Θα σου εξηγήσω γιατί δεν θα τα καταφέρεις.
          </p>
        </header>

        <Card className="p-6 space-y-4 bg-card border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Τι σκέφτεσαι;
            </label>
            <Textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="π.χ. Θέλω να γίνω YouTuber... ή Μου πρότειναν να πάμε γυμναστήριο..."
              className="min-h-32 bg-secondary border-border text-foreground resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleDemotivate}
              disabled={isLoading || !thought.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
              size="lg"
            >
              {isLoading && mode === "demotivate" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Σκέφτομαι...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Αποθάρρυνση
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateExcuses}
              disabled={isLoading || !thought.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              size="lg"
            >
              {isLoading && mode === "excuses" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Δημιουργώ...
                </>
              ) : (
                "Δικαιολογίες"
              )}
            </Button>
            <Button
              onClick={handleGenerateQuote}
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold"
              size="lg"
            >
              {isLoading && mode === "quote" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Δημιουργώ...
                </>
              ) : (
                <>
                  <Skull className="mr-2 h-4 w-4" />
                  Quote
                </>
              )}
            </Button>
          </div>
        </Card>

        {demotivation && (
          <Card className="p-6 bg-card border-border border-2 border-destructive/50 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">
                  Η Σκληρή Αλήθεια
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {demotivation}
                </div>
              </div>
            </div>
          </Card>
        )}

        {excuses && (
          <Card className="p-6 bg-card border-border border-2 border-primary/30 animate-fade-in">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-primary">
                Οι Δικαιολογίες σου
              </h2>
              <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {excuses}
              </div>
            </div>
          </Card>
        )}

        {quote && (
          <Card className="p-6 bg-card border-border border-2 border-secondary/50 animate-fade-in">
            <div className="flex items-center justify-center gap-3 py-4">
              <Skull className="w-8 h-8 text-secondary flex-shrink-0" />
              <p className="text-xl font-bold text-center text-foreground italic">
                "{quote}"
              </p>
              <Skull className="w-8 h-8 text-secondary flex-shrink-0" />
            </div>
          </Card>
        )}

        {savings && (
          <Card className="p-6 bg-card border-border border-2 border-primary/30 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Σε γλίτωσα από...
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-3xl font-black text-destructive">
                    €{savings.money.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Χαμένα χρήματα
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-destructive">
                    {savings.time} μήνες
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Χαμένος χρόνος
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-destructive">
                    {savings.stress}% stress
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Επιπλέον άγχος
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
