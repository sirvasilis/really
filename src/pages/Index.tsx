import { useState, useEffect } from "react";
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
  const [mode, setMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | "quote" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [language, setLanguage] = useState<"el" | "en">("en");
  const { toast } = useToast();

  const translations = {
    el: {
      title: "DEMOTIVATOR",
      subtitle: "Έχεις όνειρα; Τέλεια! Ας τα θεραπεύσουμε πριν εξαπλωθούν!",
      demotivateTitle: "Αποθάρρυνση",
      demotivateDesc: "Πείσε με ότι δεν πρέπει να το κάνω",
      excusesTitle: "Δικαιολογίες",
      excusesDesc: "Πείσε κάποιον άλλο ότι δεν πρέπει να το κάνω",
      eightBallTitle: "8Ball",
      eightBallDesc: "Άσε τη μοίρα να αποφασίσει γιατί δεν πρέπει να το κάνω",
      distractionTitle: "Περισπασμός",
      distractionDesc: "Περίσπασέ με για να μην το κάνω",
      demotivateLabel: "Πιστεύεις πως έχεις την ιδέα που θα σε κάνει πετυχημένο;",
      demotivatePlaceholder: "Γράψε εδώ ο,τι σκέφτεσαι και άσε την αλήθεια να σε προσγειώσει στην πραγματικότητα",
      excusesLabel: "Σε προσκάλεσαν σε κάτι που δεν συμβαδίζει με την μιζέρια σου;",
      excusesPlaceholder: "Γράψε εδώ την πρόταση που σου έγινε και οι δικαιολογίες θα σε σώσουν απο το να συμμετέχεις σε κάτι που ίσως σε κάνει χαρούμενο",
      btnDemotivate: "Αποθάρρυνση",
      btnExcuses: "Δικαιολογίες",
      btnQuote: "Quote",
      btnAlternative: "Εναλλακτικά",
      btnSubmit: "Υποβολή",
      btnBack: "Πίσω",
      thinking: "Σκέφτομαι...",
      generating: "Δημιουργώ...",
      errorTitle: "Σφάλμα",
      errorDesc: "Κάτι πήγε στραβά",
      emptyError: "Γράψε κάτι!",
      emptyDemotivate: "Πώς να σε αποθαρρύνω αν δεν μου πεις τι ονειρεύεσαι;",
      emptyExcuses: "Πώς να δημιουργήσω δικαιολογίες αν δεν μου πεις την πρόταση;",
      truthTitle: "Η Σκληρή Αλήθεια",
      excusesResultTitle: "Οι Δικαιολογίες σου",
      savingsTitle: "Σε γλίτωσα από...",
      savingsMoney: "Χαμένα χρήματα",
      savingsTime: "Χαμένος χρόνος",
      savingsStress: "Επιπλέον άγχος",
    },
    en: {
      title: "DEMOTIVATOR",
      subtitle: "Got dreams? Great! Let's treat them before they spread!",
      demotivateTitle: "Demotivate",
      demotivateDesc: "Convince me I shouldn't do it",
      excusesTitle: "Excuses",
      excusesDesc: "Convince someone else I shouldn't do it",
      eightBallTitle: "8Ball",
      eightBallDesc: "Let faith decide why I shouldn't do it",
      distractionTitle: "Distraction",
      distractionDesc: "Distract me so I don't do it",
      demotivateLabel: "Do you believe you have the idea that will make you successful?",
      demotivatePlaceholder: "Write here whatever you're thinking and let the truth bring you back to reality",
      excusesLabel: "Were you invited to something that doesn't match your misery?",
      excusesPlaceholder: "Write here the proposal you received and the excuses will save you from participating in something that might make you happy",
      btnDemotivate: "Demotivate",
      btnExcuses: "Excuses",
      btnQuote: "Quote",
      btnAlternative: "Alternative",
      btnSubmit: "Submit",
      btnBack: "Back",
      thinking: "Thinking...",
      generating: "Generating...",
      errorTitle: "Error",
      errorDesc: "Something went wrong",
      emptyError: "Write something!",
      emptyDemotivate: "How can I demotivate you if you don't tell me what you're dreaming of?",
      emptyExcuses: "How can I generate excuses if you don't tell me the proposal?",
      truthTitle: "The Harsh Truth",
      excusesResultTitle: "Your Excuses",
      savingsTitle: "I saved you from...",
      savingsMoney: "Wasted money",
      savingsTime: "Wasted time",
      savingsStress: "Extra stress",
    }
  };

  const t = translations[language];

  useEffect(() => {
    handleGenerateQuote();
  }, []);

  const handleModeSelection = (newMode: "demotivate" | "excuses" | "8ball" | "distraction") => {
    setSelectedMode(newMode);
    setShowInput(true);
    setThought("");
    setDemotivation("");
    setExcuses("");
    setSavings(null);
  };

  const handleBack = () => {
    setShowInput(false);
    setSelectedMode(null);
    setThought("");
    setDemotivation("");
    setExcuses("");
    setSavings(null);
  };

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
          body: JSON.stringify({ thought, language: "en" }),
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
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="font-bold"
        >
          EN
        </Button>
        <Button
          variant={language === "el" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("el")}
          className="font-bold"
        >
          ΕΛ
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

        {!showInput ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                onClick={() => handleModeSelection("demotivate")}
                className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive"
              >
                <h3 className="text-2xl font-bold text-destructive mb-2">{t.demotivateTitle}</h3>
                <p className="text-muted-foreground">{t.demotivateDesc}</p>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("excuses")}
                className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-primary"
              >
                <h3 className="text-2xl font-bold text-primary mb-2">{t.excusesTitle}</h3>
                <p className="text-muted-foreground">{t.excusesDesc}</p>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("8ball")}
                className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-secondary"
              >
                <h3 className="text-2xl font-bold text-secondary-foreground mb-2">{t.eightBallTitle}</h3>
                <p className="text-muted-foreground">{t.eightBallDesc}</p>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("distraction")}
                className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-accent"
              >
                <h3 className="text-2xl font-bold text-accent-foreground mb-2">{t.distractionTitle}</h3>
                <p className="text-muted-foreground">{t.distractionDesc}</p>
              </Card>
            </div>
          </>
        ) : (
          <Card className="p-8 space-y-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl">
            <div className="space-y-3">
              <label className="text-base font-semibold text-foreground">
                {selectedMode === "demotivate" 
                  ? t.demotivateLabel 
                  : selectedMode === "excuses"
                  ? t.excusesLabel
                  : selectedMode === "8ball"
                  ? "What decision are you facing?"
                  : "What task are you procrastinating on?"}
              </label>
              <Textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder={
                  selectedMode === "demotivate" 
                    ? t.demotivatePlaceholder 
                    : selectedMode === "excuses"
                    ? t.excusesPlaceholder
                    : selectedMode === "8ball"
                    ? "Describe your dilemma..."
                    : "What do you need to avoid doing?"
                }
                className="min-h-36 bg-background/50 border-2 border-border text-foreground resize-none text-base focus:border-primary transition-colors"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                disabled={isLoading}
                variant="outline"
                className="font-bold h-12 text-base"
                size="lg"
              >
                {t.btnBack}
              </Button>
              <Button
                onClick={() => {
                  if (selectedMode === "demotivate") handleDemotivate();
                  else if (selectedMode === "excuses") handleGenerateExcuses();
                  else if (selectedMode === "8ball") handleDemotivate(); // Reuse demotivate for now
                  else if (selectedMode === "distraction") handleGenerateExcuses(); // Reuse excuses for now
                }}
                disabled={isLoading || !thought.trim()}
                className={`flex-1 font-bold h-12 text-base transition-all hover:scale-105 ${
                  selectedMode === "demotivate"
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    : selectedMode === "excuses"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : selectedMode === "8ball"
                    ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground"
                }`}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {mode === "quote" ? t.generating : t.thinking}
                  </>
                ) : (
                  t.btnSubmit
                )}
              </Button>
            </div>
          </Card>
        )}

        {demotivation && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl animate-fade-in">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-4 flex-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {t.truthTitle}
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg">
                  {demotivation}
                </div>
                <Button
                  onClick={handleDemotivate}
                  disabled={isLoading}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold transition-all hover:scale-105"
                  size="lg"
                >
                  {isLoading && mode === "demotivate" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t.thinking}
                    </>
                  ) : (
                    t.btnAlternative
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {excuses && (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">
                {t.excusesResultTitle}
              </h2>
              <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-lg">
                {excuses}
              </div>
              <Button
                onClick={handleGenerateExcuses}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all hover:scale-105"
                size="lg"
              >
                {isLoading && mode === "excuses" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  t.btnAlternative
                )}
              </Button>
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
