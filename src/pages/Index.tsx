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
  const [language, setLanguage] = useState<"el" | "en">("el");
  const { toast } = useToast();

  const translations = {
    el: {
      title: "DEMOTIVATOR",
      subtitle: "Μοιράσου τα όνειρά σου. Θα σου εξηγήσω γιατί δεν θα τα καταφέρεις.",
      placeholder: "Γράψε εδώ ο,τι σκέφτεσαι για να αντιμετωπίσεις την πραγματική αλήθεια",
      label: "Σου ήρθε κάποια φοβερή ιδέα που θα σε κάνει πετυχημένο ή κάποια φανταστική πρόταση για ξέφρενο γλέντι;",
      btnDemotivate: "Αποθάρρυνση",
      btnExcuses: "Δικαιολογίες",
      btnQuote: "Quote",
      thinking: "Σκέφτομαι...",
      generating: "Δημιουργώ...",
      errorTitle: "Σφάλμα",
      errorDesc: "Κάτι πήγε στραβά",
      emptyError: "Γράψε κάτι!",
      emptyDemotivate: "Πώς να σε αποθαρρύνω αν δεν μου πεις τι ονειρεύεσαι;",
      emptyExcuses: "Πώς να δημιουργήσω δικαιολογίες αν δεν μου πεις την πρόταση;",
      truthTitle: "Η Σκληρή Αλήθεια",
      excusesTitle: "Οι Δικαιολογίες σου",
      savingsTitle: "Σε γλίτωσα από...",
      savingsMoney: "Χαμένα χρήματα",
      savingsTime: "Χαμένος χρόνος",
      savingsStress: "Επιπλέον άγχος",
    },
    en: {
      title: "DEMOTIVATOR",
      subtitle: "Share your dreams. I'll explain why you won't make it.",
      placeholder: "Write here whatever you're thinking to face the real truth",
      label: "Did you get some amazing idea that will make you successful or some fantastic proposal for wild partying?",
      btnDemotivate: "Demotivate",
      btnExcuses: "Excuses",
      btnQuote: "Quote",
      thinking: "Thinking...",
      generating: "Generating...",
      errorTitle: "Error",
      errorDesc: "Something went wrong",
      emptyError: "Write something!",
      emptyDemotivate: "How can I demotivate you if you don't tell me what you're dreaming of?",
      emptyExcuses: "How can I generate excuses if you don't tell me the proposal?",
      truthTitle: "The Harsh Truth",
      excusesTitle: "Your Excuses",
      savingsTitle: "I saved you from...",
      savingsMoney: "Wasted money",
      savingsTime: "Wasted time",
      savingsStress: "Extra stress",
    }
  };

  const t = translations[language];

  const handleDemotivate = async () => {
    if (!thought.trim()) {
      toast({
        title: t.emptyError,
        description: t.emptyDemotivate,
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
          body: JSON.stringify({ thought, language }),
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
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.errorDesc,
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
        title: t.emptyError,
        description: t.emptyExcuses,
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
          body: JSON.stringify({ proposal: thought, language }),
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
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.errorDesc,
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
          body: JSON.stringify({ thought, language }),
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
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant={language === "el" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("el")}
          className="font-bold"
        >
          ΕΛ
        </Button>
        <Button
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="font-bold"
        >
          EN
        </Button>
      </div>
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <header className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Skull className="w-14 h-14 text-destructive animate-pulse" />
            <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t.title}
            </h1>
            <Skull className="w-14 h-14 text-destructive animate-pulse" />
          </div>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </header>

        <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl">
          <div className="space-y-3">
            <label className="text-base font-semibold text-foreground">
              {t.label}
            </label>
            <Textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder={t.placeholder}
              className="min-h-36 bg-background/50 border-2 border-border text-foreground resize-none text-base focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleDemotivate}
                disabled={isLoading || !thought.trim()}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold h-12 text-base transition-all hover:scale-105"
                size="lg"
              >
                {isLoading && mode === "demotivate" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.thinking}
                  </>
                ) : (
                  t.btnDemotivate
                )}
              </Button>
              <Button
                onClick={handleGenerateExcuses}
                disabled={isLoading || !thought.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base transition-all hover:scale-105"
                size="lg"
              >
                {isLoading && mode === "excuses" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  t.btnExcuses
                )}
              </Button>
            </div>
            <Button
              onClick={handleGenerateQuote}
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold h-12 text-base transition-all hover:scale-105"
              size="lg"
            >
              {isLoading && mode === "quote" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Skull className="mr-2 h-5 w-5" />
                  {t.btnQuote}
                </>
              )}
            </Button>
          </div>
        </Card>

        {demotivation && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl animate-fade-in">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {t.truthTitle}
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg">
                  {demotivation}
                </div>
              </div>
            </div>
          </Card>
        )}

        {excuses && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">
                {t.excusesTitle}
              </h2>
              <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg">
                {excuses}
              </div>
            </div>
          </Card>
        )}

        {quote && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-secondary shadow-xl animate-fade-in">
            <div className="flex items-center justify-center gap-4 py-6">
              <Skull className="w-10 h-10 text-secondary flex-shrink-0 animate-pulse" />
              <p className="text-2xl font-bold text-center text-foreground italic">
                "{quote}"
              </p>
              <Skull className="w-10 h-10 text-secondary flex-shrink-0 animate-pulse" />
            </div>
          </Card>
        )}

        {savings && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                {t.savingsTitle}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-4xl font-black text-destructive">
                    €{savings.money.toLocaleString()}
                  </div>
                  <div className="text-base text-muted-foreground font-medium">
                    {t.savingsMoney}
                  </div>
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-4xl font-black text-destructive">
                    {savings.time} {language === "el" ? "μήνες" : "months"}
                  </div>
                  <div className="text-base text-muted-foreground font-medium">
                    {t.savingsTime}
                  </div>
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-4xl font-black text-destructive">
                    {savings.stress}% stress
                  </div>
                  <div className="text-base text-muted-foreground font-medium">
                    {t.savingsStress}
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
