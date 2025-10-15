import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, Skull, Loader2, ThumbsDown, MessageSquare, Sparkles, Cat, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const [thought, setThought] = useState("");
  const [demotivation, setDemotivation] = useState("");
  const [excuses, setExcuses] = useState("");
  const [quote, setQuote] = useState("");
  const [eightBallAnswer, setEightBallAnswer] = useState("");
  const [timeMachineStory, setTimeMachineStory] = useState("");
  const [catImage, setCatImage] = useState("");
  const [savings, setSavings] = useState<{ money: number; time: number; stress: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | "quote" | "timeMachine" | "test" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | "timeMachine" | "test" | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [language, setLanguage] = useState<"el" | "en">("en");
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [testProcessed, setTestProcessed] = useState(false);
  const [testClickCount, setTestClickCount] = useState(0);
  const [showTestResult, setShowTestResult] = useState(false);
  const [testGoal, setTestGoal] = useState("");
  const [testStep, setTestStep] = useState<1 | 2 | 3>(1); // 1: goal input, 2: test, 3: result
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const { toast } = useToast();

  const eightBallAnswers = {
    el: [
      "Σίγουρα όχι",
      "Καλύτερα μην το κάνεις",
      "Μην το ρισκάρεις",
      "Ξεχνά το",
      "Δεν το βλέπω",
      "Απίθανο",
      "Κακή ιδέα",
      "Οι πιθανότητες είναι εναντίον σου",
      "Μην το σκέφτεσαι καν",
      "Αποφάσισε αργότερα"
    ],
    en: [
      "Definitely not",
      "Better not",
      "Don't risk it",
      "Forget it",
      "I don't see it",
      "Unlikely",
      "Bad idea",
      "Odds are against you",
      "Don't even think about it",
      "Decide later"
    ]
  };

  const translations = {
    el: {
      title: "DEMOTIVATOR",
      subtitle: "Έχεις όνειρα; Τέλεια! Ας τα θεραπεύσουμε πριν εξαπλωθούν!",
      demotivateTitle: "Αποθάρρυνση",
      demotivateDesc: "Πείσε με γιατί δεν πρέπει να το κάνω",
      excusesTitle: "Δικαιολογίες",
      excusesDesc: "Πείσε κάποιον άλλον γιατί δεν πρέπει να το κάνω",
      eightBallTitle: "8Ball",
      eightBallDesc: "Άσε τη μοίρα να αποφασίσει γιατί δεν πρέπει να το κάνω",
      distractionTitle: "Περισπασμός",
      distractionDesc: "Περίσπασέ με για να μην το κάνω",
      timeMachineTitle: "Χρονομηχανή",
      timeMachineDesc: "Δείξε μου τι θα συμβεί αν το κάνω",
      timeMachineLabel: "Θέλεις να δεις το μέλλον;",
      timeMachinePlaceholder: "Γράψε την ιδέα σου εδώ και ταξίδεψε μπροστά στο χρόνο για να δεις το αποτέλεσμα",
      timeMachineResultTitle: "Το Μέλλον Ήρθε...",
      emptyTimeMachine: "Πώς να σε δείξω το μέλλον αν δεν μου πεις την ιδέα σου;",
      testTitle: "Δοκιμή",
      testDesc: "Υπολόγισε αν μπορώ να το κάνω",
      testGoalDialogTitle: "Πες μου λίγα για τον στόχο σου",
      testGoalDialogDesc: "Πες μου λίγα για τον στόχο σου, ώστε να δημιουργήσω το σωστό τεστ για εσένα",
      testGoalPlaceholder: "Γράψε τον στόχο σου εδώ...",
      testStartButton: "Έναρξη",
      testExitButton: "Έξοδος",
      testResult: "Χρειάστηκες {time} δευτερόλεπτα και πάτησες {count} φορές ένα κουμπί που δεν κάνει ΤΙΠΟΤΑ. Σοβαρά πιστεύεις ότι μπορείς να {goal}; Καλή τύχη με αυτό!",
      emptyTestGoal: "Πρέπει να μου πεις τον στόχο σου πρώτα!",
      testContinue: "Συνέχεια",
      petDialogTitle: "Διάλεξε το ζωάκι σου",
      petDialogDesc: "Τι θέλεις να δεις;",
      petCat: "Γάτα",
      petDog: "Σκύλο",
      demotivateLabel: "Πιστεύεις πως έχεις την ιδέα που θα σε κάνει πετυχημένο;",
      demotivatePlaceholder: "Γράψε εδώ ο,τι σκέφτεσαι και άσε την αλήθεια να σε προσγειώσει στην πραγματικότητα",
      excusesLabel: "Σε προσκάλεσαν σε κάτι που δεν συμβαδίζει με την μιζέρια σου;",
      excusesPlaceholder: "Γράψε εδώ την πρόταση που σου έγινε και οι δικαιολογίες θα σε σώσουν απο το να συμμετέχεις σε κάτι που ίσως σε κάνει χαρούμενο",
      eightBallLabel: "Ποια είναι η ιδέα σου;",
      eightBallPlaceholder: "Να...",
      eightBallResultTitle: "Η Μοίρα Αποφάσισε",
      distractionResultTitle: "Απόλαυσε τη Διαφυγή",
      btnDemotivate: "Αποθάρρυνση",
      btnExcuses: "Δικαιολογίες",
      btnQuote: "Quote",
      btnAlternative: "Εναλλακτικά",
      btnShakeBallAgain: "Ανακάτεψε ξανά την μπάλα",
      btnNewDistraction: "Νέος Περισπασμός",
      btnShakeBall: "Ανακάτεψε την μπάλα",
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
      shouldI: "Να",
    },
    en: {
      title: "DEMOTIVATOR",
      subtitle: "Got dreams? Great! Let's treat them before they spread!",
      demotivateTitle: "Demotivate",
      demotivateDesc: "Convince me why I shouldn't do it",
      excusesTitle: "Excuses",
      excusesDesc: "Convince someone else why I shouldn't do it",
      eightBallTitle: "8Ball",
      eightBallDesc: "Let faith decide why I shouldn't do it",
      distractionTitle: "Distraction",
      distractionDesc: "Distract me so I don't do it",
      timeMachineTitle: "Time Machine",
      timeMachineDesc: "Show me what happens if I do it",
      timeMachineLabel: "Want to see the future?",
      timeMachinePlaceholder: "Write your idea here and travel forward in time to see the outcome",
      timeMachineResultTitle: "The Future Has Arrived...",
      emptyTimeMachine: "How can I show you the future if you don't tell me your idea?",
      testTitle: "Test",
      testDesc: "Calculate if I am able to do it",
      testGoalDialogTitle: "Tell me about your goal",
      testGoalDialogDesc: "Tell me a little about your goal, so that I can generate the right test for you",
      testGoalPlaceholder: "Write your goal here...",
      testStartButton: "Start",
      testExitButton: "Exit",
      testResult: "It took you {time} seconds and you clicked {count} times on a button that does NOTHING. You seriously think you can {goal}? Good luck with that!",
      emptyTestGoal: "You need to tell me your goal first!",
      testContinue: "Continue",
      petDialogTitle: "Choose your pet",
      petDialogDesc: "What do you want to see?",
      petCat: "Cat",
      petDog: "Dog",
      demotivateLabel: "Do you believe you have the idea that will make you successful?",
      demotivatePlaceholder: "Write here whatever you're thinking and let the truth bring you back to reality",
      excusesLabel: "Were you invited to something that doesn't match your misery?",
      excusesPlaceholder: "Write here the proposal you received and the excuses will save you from participating in something that might make you happy",
      eightBallLabel: "What's your idea?",
      eightBallPlaceholder: "Should I...",
      eightBallResultTitle: "Fate Has Decided",
      distractionResultTitle: "Enjoy Your Escape",
      btnDemotivate: "Demotivate",
      btnExcuses: "Excuses",
      btnQuote: "Quote",
      btnAlternative: "Alternative",
      btnShakeBallAgain: "Shake the ball again",
      btnNewDistraction: "New Distraction",
      btnShakeBall: "Shake the ball",
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
      shouldI: "Should I",
      savingsTime: "Wasted time",
      savingsStress: "Extra stress",
    }
  };

  const t = translations[language];

  useEffect(() => {
    handleGenerateQuote();
  }, [language]);

  const handleModeSelection = (newMode: "demotivate" | "excuses" | "8ball" | "distraction" | "timeMachine" | "test") => {
    setSelectedMode(newMode);
    setThought("");
    setDemotivation("");
    setExcuses("");
    setEightBallAnswer("");
    setTimeMachineStory("");
    setCatImage("");
    setSavings(null);
    setTestProcessed(false);
    setTestClickCount(0);
    setShowTestResult(false);
    setTestGoal("");
    setTestStep(1);
    setTestStartTime(0);
    setShowInput(true);
    
    if (newMode === "distraction") {
      setShowPetDialog(true);
    }
  };

  const handleBack = () => {
    setShowInput(false);
    setSelectedMode(null);
    setThought("");
    setDemotivation("");
    setExcuses("");
    setEightBallAnswer("");
    setTimeMachineStory("");
    setCatImage("");
    setSavings(null);
    setTestProcessed(false);
    setTestClickCount(0);
    setShowTestResult(false);
    setTestGoal("");
    setTestStep(1);
    setTestStartTime(0);
    setShowGoalDialog(false);
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

  const handle8Ball = () => {
    setMode("8ball");
    const answers = eightBallAnswers[language];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    setEightBallAnswer(randomAnswer);
    setMode(null);
  };

  const handleDistraction = async (petType: "cat" | "dog") => {
    setShowPetDialog(false);
    setIsLoading(true);
    setMode("distraction");
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ petType }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to generate ${petType} image`);
      }

      const data = await response.json();
      if (data && data.imageUrl) {
        setCatImage(data.imageUrl);
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

  const handleTimeMachine = async () => {
    if (!thought.trim()) {
      toast({
        title: t.emptyError,
        description: t.emptyTimeMachine,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMode("timeMachine");
    setTimeMachineStory("");
    setDemotivation("");
    setExcuses("");
    setQuote("");
    setSavings(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/time-machine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ idea: thought, language }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate story");
      }

      const data = await response.json();
      setTimeMachineStory(data.story);
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

  const handleGoalSubmit = () => {
    if (!testGoal.trim()) {
      toast({
        title: t.emptyError,
        description: t.emptyTestGoal,
        variant: "destructive",
      });
      return;
    }
    setTestStep(2);
    setTestStartTime(Date.now());
  };

  const handleTestStartClick = () => {
    setTestClickCount(prev => prev + 1);
  };

  const handleTestExit = () => {
    const timeSpent = Math.round((Date.now() - testStartTime) / 1000);
    setTestStep(3);
  };

  return (
    <>
      <AlertDialog open={showPetDialog} onOpenChange={setShowPetDialog}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogFooter className="flex-col gap-4 sm:flex-col items-center justify-center pt-6">
            <div className="flex gap-3 md:gap-4 w-full justify-center">
              <AlertDialogAction 
                onClick={() => handleDistraction("cat")}
                className="text-5xl md:text-6xl h-24 w-24 md:h-32 md:w-32 hover:scale-110 transition-transform"
              >
                🐱
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={() => handleDistraction("dog")}
                className="text-5xl md:text-6xl h-24 w-24 md:h-32 md:w-32 hover:scale-110 transition-transform"
              >
                🐶
              </AlertDialogAction>
            </div>
            <AlertDialogCancel 
              onClick={handleBack}
              className="w-full max-w-xs text-sm md:text-base"
            >
              {language === "el" ? "Ακύρωση" : "Cancel"}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="font-bold text-sm md:text-base min-w-[50px]"
        >
          EN
        </Button>
        <Button
          variant={language === "el" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("el")}
          className="font-bold text-sm md:text-base min-w-[50px]"
        >
          ΕΛ
        </Button>
      </div>
      <div className="w-full max-w-2xl space-y-6 md:space-y-8 animate-fade-in pt-20 md:pt-0">
        <header className="text-center space-y-3 md:space-y-6 px-2">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Skull className="w-7 h-7 md:w-14 md:h-14 text-destructive animate-pulse flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t.title}
            </h1>
            <Skull className="w-7 h-7 md:w-14 md:h-14 text-destructive animate-pulse flex-shrink-0" />
          </div>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            {t.subtitle}
          </p>
        </header>

        {!showInput ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Card 
                onClick={() => handleModeSelection("demotivate")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors flex-shrink-0">
                    <ThumbsDown className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.demotivateTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.demotivateDesc}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("excuses")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-primary hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.excusesTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.excusesDesc}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("timeMachine")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-primary hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Clock className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.timeMachineTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.timeMachineDesc}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("test")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors flex-shrink-0">
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.testTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.testDesc}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("8ball")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-secondary hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.eightBallTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.eightBallDesc}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("distraction")}
                className="group p-4 md:p-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-accent hover:shadow-2xl"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                    <Cat className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">{t.distractionTitle}</h3>
                    <p className="text-xs md:text-sm lg:text-base text-muted-foreground">{t.distractionDesc}</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="p-4 md:p-8 space-y-4 md:space-y-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl">
            {selectedMode === "8ball" && eightBallAnswer ? (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-2xl font-bold text-secondary text-center px-2">
                  {t.shouldI} {thought}
                </h2>
                <div className="flex items-center justify-center py-6 md:py-8">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center shadow-2xl border-4 border-secondary/30">
                    <p className="text-lg md:text-2xl font-bold text-center text-secondary-foreground px-4 md:px-6">
                      {eightBallAnswer}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="font-bold h-11 md:h-12 text-sm md:text-base"
                    size="lg"
                  >
                    {t.btnBack}
                  </Button>
                  <Button
                    onClick={handle8Ball}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                    size="lg"
                  >
                    {t.btnShakeBallAgain}
                  </Button>
                </div>
              </div>
            ) : selectedMode === "distraction" && isLoading ? (
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
                <p className="text-xl font-semibold text-muted-foreground">
                  {t.generating}...
                </p>
              </div>
            ) : selectedMode === "distraction" && catImage ? (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-accent text-center">
                  {t.distractionResultTitle}
                </h2>
                <div className="flex justify-center">
                  <img 
                    src={catImage} 
                    alt="Cute cat" 
                    className="max-w-full h-auto rounded-lg shadow-lg max-h-[400px] md:max-h-[500px] object-cover"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="font-bold h-11 md:h-12 text-sm md:text-base"
                    size="lg"
                  >
                    {t.btnBack}
                  </Button>
                  <Button
                    onClick={() => setShowPetDialog(true)}
                    disabled={isLoading}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                    size="lg"
                  >
                    {isLoading && mode === "distraction" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        {t.generating}
                      </>
                    ) : (
                      t.btnNewDistraction
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {selectedMode === "test" && testStep === 2 ? (
                  <div className="space-y-6 md:space-y-8 py-8 md:py-12">
                    <div className="flex flex-col gap-4 md:gap-6 items-center justify-center">
                      <Button
                        onClick={handleTestStartClick}
                        className="w-full max-w-xs md:w-64 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-16 md:h-20 text-xl md:text-2xl transition-all hover:scale-105"
                        size="lg"
                      >
                        {t.testStartButton}
                      </Button>
                      <Button
                        onClick={handleTestExit}
                        variant="destructive"
                        className="w-full max-w-xs md:w-64 font-bold h-16 md:h-20 text-xl md:text-2xl transition-all hover:scale-105"
                        size="lg"
                      >
                        {t.testExitButton}
                      </Button>
                    </div>
                  </div>
                ) : selectedMode === "test" && testStep === 3 ? (
                  <div className="space-y-4 md:space-y-6">
                    <div className="text-foreground/90 text-base md:text-lg text-center leading-relaxed px-2">
                      {t.testResult
                        .replace('{time}', Math.round((Date.now() - testStartTime) / 1000).toString())
                        .replace('{count}', testClickCount.toString())
                        .replace('{goal}', testGoal)}
                    </div>
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="font-bold h-11 md:h-12 text-sm md:text-base w-full"
                      size="lg"
                    >
                      {t.btnBack}
                    </Button>
                  </div>
                ) : (
                  <>
                    {selectedMode === "test" && testStep === 1 ? (
                      <>
                        <div className="space-y-3">
                          <label className="text-sm md:text-base font-semibold text-foreground">
                            {t.testGoalDialogDesc}
                          </label>
                          <Textarea
                            value={testGoal}
                            onChange={(e) => setTestGoal(e.target.value)}
                            placeholder={t.testGoalPlaceholder}
                            className="min-h-32 md:min-h-36 bg-background/50 border-2 border-border text-foreground resize-none text-sm md:text-base focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                          <Button
                            onClick={handleBack}
                            variant="outline"
                            className="font-bold h-11 md:h-12 text-sm md:text-base"
                            size="lg"
                          >
                            {t.btnBack}
                          </Button>
                          <Button
                            onClick={handleGoalSubmit}
                            disabled={!testGoal.trim()}
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold h-11 md:h-12 text-sm md:text-base transition-all hover:scale-105"
                            size="lg"
                          >
                            {t.testContinue}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {selectedMode !== "8ball" && selectedMode !== "test" && (
                            <label className="text-sm md:text-base font-semibold text-foreground">
                              {selectedMode === "demotivate" 
                                ? t.demotivateLabel 
                                : selectedMode === "excuses"
                                ? t.excusesLabel
                                : t.timeMachineLabel}
                            </label>
                          )}
                          {selectedMode !== "test" && (
                            <Textarea
                              value={thought}
                              onChange={(e) => setThought(e.target.value)}
                              placeholder={
                                selectedMode === "demotivate" 
                                  ? t.demotivatePlaceholder 
                                  : selectedMode === "excuses"
                                  ? t.excusesPlaceholder
                                  : selectedMode === "timeMachine"
                                  ? t.timeMachinePlaceholder
                                  : t.eightBallPlaceholder
                              }
                              className="min-h-32 md:min-h-36 bg-background/50 border-2 border-border text-foreground resize-none text-sm md:text-base focus:border-primary transition-colors"
                              disabled={isLoading}
                            />
                          )}
                        </div>

                        {selectedMode !== "test" && (
                          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <Button
                              onClick={handleBack}
                              disabled={isLoading}
                              variant="outline"
                              className="font-bold h-11 md:h-12 text-sm md:text-base"
                              size="lg"
                            >
                              {t.btnBack}
                            </Button>
                            <Button
                              onClick={() => {
                                if (selectedMode === "demotivate") handleDemotivate();
                                else if (selectedMode === "excuses") handleGenerateExcuses();
                                else if (selectedMode === "8ball") handle8Ball();
                                else if (selectedMode === "timeMachine") handleTimeMachine();
                              }}
                              disabled={isLoading || !thought.trim()}
                              className={`flex-1 font-bold h-11 md:h-12 text-sm md:text-base transition-all hover:scale-105 ${
                                selectedMode === "demotivate"
                                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  : selectedMode === "8ball"
                                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                              }`}
                              size="lg"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                                  {mode === "quote" ? t.generating : t.thinking}
                                </>
                              ) : (
                                selectedMode === "8ball" ? t.btnShakeBall : t.btnSubmit
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Card>
        )}

        {demotivation && (
          <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl animate-fade-in">
            <div className="flex items-start gap-3 md:gap-4">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-3 md:space-y-4 flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {t.truthTitle}
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm md:text-lg">
                  {demotivation}
                </div>
                <Button
                  onClick={handleDemotivate}
                  disabled={isLoading}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                  size="lg"
                >
                  {isLoading && mode === "demotivate" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
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
          <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                {t.excusesResultTitle}
              </h2>
              <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm md:text-lg">
                {excuses}
              </div>
              <Button
                onClick={handleGenerateExcuses}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                size="lg"
              >
                {isLoading && mode === "excuses" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  t.btnAlternative
                )}
              </Button>
            </div>
          </Card>
        )}

        {timeMachineStory && (
          <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="flex items-start gap-3 md:gap-4">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-3 md:space-y-4 flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {t.timeMachineResultTitle}
                </h2>
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm md:text-lg">
                  {timeMachineStory}
                </div>
                <Button
                  onClick={handleTimeMachine}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                  size="lg"
                >
                  {isLoading && mode === "timeMachine" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      {t.generating}
                    </>
                  ) : (
                    t.btnAlternative
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!showInput && !selectedMode && (
          <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-secondary shadow-xl">
            <div className="flex items-center justify-center gap-3 md:gap-4 py-4 md:py-6 min-h-[100px] md:min-h-[120px]">
              {isLoading && mode === "quote" ? (
                <>
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-secondary animate-spin flex-shrink-0" />
                  <p className="text-lg md:text-2xl font-bold text-center text-muted-foreground italic">
                    {t.generating}...
                  </p>
                </>
              ) : quote ? (
                <>
                  <Skull className="w-7 h-7 md:w-10 md:h-10 text-secondary flex-shrink-0 animate-pulse" />
                  <p className="text-base md:text-2xl font-bold text-center text-foreground italic px-2">
                    "{quote}"
                  </p>
                  <Skull className="w-7 h-7 md:w-10 md:h-10 text-secondary flex-shrink-0 animate-pulse" />
                </>
              ) : (
                <>
                  <Skull className="w-7 h-7 md:w-10 md:h-10 text-secondary flex-shrink-0 animate-pulse opacity-50" />
                  <p className="text-lg md:text-2xl font-bold text-center text-muted-foreground/50 italic">
                    ...
                  </p>
                  <Skull className="w-7 h-7 md:w-10 md:h-10 text-secondary flex-shrink-0 animate-pulse opacity-50" />
                </>
              )}
            </div>
          </Card>
        )}

        {savings && (
          <Card className="p-4 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-primary shadow-xl animate-fade-in">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t.savingsTitle}
              </h2>
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2 md:space-y-3 p-3 md:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-3xl md:text-4xl font-black text-destructive">
                    €{savings.money.toLocaleString()}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground font-medium">
                    {t.savingsMoney}
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3 p-3 md:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-3xl md:text-4xl font-black text-destructive">
                    {savings.time} {language === "el" ? "μήνες" : "months"}
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground font-medium">
                    {t.savingsTime}
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3 p-3 md:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-3xl md:text-4xl font-black text-destructive">
                    {savings.stress}% stress
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground font-medium">
                    {t.savingsStress}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>
      </div>
    </>
  );
};

export default Index;
