import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, ThumbsDown, MessageSquare, Sparkles, Cat, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Motion } from "@capacitor/motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { App as CapacitorApp } from "@capacitor/app";
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
  const navigate = useNavigate();
  const [thought, setThought] = useState("");
  const [demotivation, setDemotivation] = useState("");
  const [excuses, setExcuses] = useState("");
  const [quote, setQuote] = useState("");
  const [eightBallAnswer, setEightBallAnswer] = useState("");
  const [timeMachineStory, setTimeMachineStory] = useState("");
  const [catImage, setCatImage] = useState("");
  const [savings, setSavings] = useState<{ 
    money: number; 
    time: number; 
    stress: number;
    breakdown?: {
      equipment: number;
      travel: number;
      software: number;
      marketing: number;
      other: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | "quote" | "timeMachine" | "test" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"demotivate" | "excuses" | "8ball" | "distraction" | "timeMachine" | "test" | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [language, setLanguage] = useState<"el" | "en">("en");
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState<"cat" | "dog" | null>(null);
  const [testProcessed, setTestProcessed] = useState(false);
  const [testClickCount, setTestClickCount] = useState(0);
  const [showTestResult, setShowTestResult] = useState(false);
  const [testGoal, setTestGoal] = useState("");
  const [testStep, setTestStep] = useState<1 | 2 | 3>(1); // 1: goal input, 2: test, 3: result
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [isWaitingForShake, setIsWaitingForShake] = useState(false);
  const { toast } = useToast();
  const lastShakeRef = useRef<number>(0);

  // Check if user came from landing page
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisitedFromLanding");
    if (!hasVisited) {
      navigate("/");
    }
  }, [navigate]);

  // Handle hardware back button
  useEffect(() => {
    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If user is in a specific mode (showInput is true), go back to main menu
      if (showInput) {
        handleBack();
      } else {
        // If on main menu, minimize the app instead of closing it
        CapacitorApp.minimizeApp();
      }
    });

    return () => {
      handleBackButton.then(listener => listener.remove());
    };
  }, [showInput]);

  // Shake detection for 8ball
  useEffect(() => {
    let accelHandler: any = null;
    let webHandler: ((ev: DeviceMotionEvent) => void) | null = null;

    const handleShakeMagnitude = async (magnitude: number) => {
      if (magnitude > 20) {
        const now = Date.now();
        if (now - lastShakeRef.current < 1200) return; // throttle repeated triggers
        lastShakeRef.current = now;
        setIsWaitingForShake(false);
        
        // Trigger haptic feedback
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {
          // Haptics not available on this device
          console.log("Haptics not supported");
        }
        
        handle8Ball();
      }
    };

    const setupCapacitor = async () => {
      try {
        accelHandler = await Motion.addListener("accel", (event) => {
          const { x, y, z } = event.acceleration;
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          handleShakeMagnitude(magnitude);
        });
        return true;
      } catch (e) {
        return false;
      }
    };

    const setupWeb = async () => {
      // iOS Safari needs explicit permission
      const DM: any = (window as any).DeviceMotionEvent;
      const needsPermission = DM && typeof DM.requestPermission === "function";
      if (needsPermission) {
        try {
          const status = await DM.requestPermission();
          if (status !== "granted") {
            toast({
              title: "Απαιτείται άδεια κίνησης",
              description: "Επίτρεψε πρόσβαση στους αισθητήρες για να λειτουργήσει το κούνημα",
              variant: "destructive",
            });
            return false;
          }
        } catch (err) {
          console.error("DeviceMotion permission error:", err);
          return false;
        }
      }

      webHandler = (ev: DeviceMotionEvent) => {
        const acc = ev.accelerationIncludingGravity || ev.acceleration;
        if (!acc) return;
        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        handleShakeMagnitude(magnitude);
      };
      window.addEventListener("devicemotion", webHandler, true);
      return true;
    };

    const init = async () => {
      if (!(selectedMode === "8ball" && thought.trim())) return;

      const capOk = await setupCapacitor();
      if (!capOk) {
        if ("DeviceMotionEvent" in window) {
          const webOk = await setupWeb();
          if (!webOk) {
            toast({
              title: "Motion not available",
              description: "Η συσκευή/περιηγητής δεν υποστηρίζει κίνηση",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Motion not available",
            description: "Η συσκευή/περιηγητής δεν υποστηρίζει κίνηση",
            variant: "destructive",
          });
        }
      }
    };

    init();

    return () => {
      if (accelHandler) accelHandler.remove();
      if (webHandler) window.removeEventListener("devicemotion", webHandler, true);
    };
  }, [selectedMode, thought]);

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
      title: "Really?",
      subtitle: "Έχεις όνειρα; Τέλεια! Ας τα θεραπεύσουμε πριν εξαπλωθούν!",
      demotivateTitle: "Αποθάρρυνε με",
      demotivateDesc: "Πείσε με γιατί δεν πρέπει να το κάνω",
      excusesTitle: "Γεννήτρια Δικαιολογιών",
      excusesDesc: "Πείσε κάποιον άλλον γιατί δεν πρέπει να το κάνω",
      eightBallTitle: "8Ball",
      eightBallDesc: "Άσε τη μοίρα να αποφασίσει αν πρέπει να το κάνω",
      distractionTitle: "Περισπασμός",
      distractionDesc: "Περίσπασέ με για να μην το κάνω",
      timeMachineTitle: "Χρονομηχανή",
      timeMachineDesc: "Δείξε μου τι θα συμβεί αν το κάνω",
      timeMachineLabel: "Θέλεις να δεις το μέλλον;",
      timeMachinePlaceholder: "Γράψε την ιδέα σου εδώ και ταξίδεψε μπροστά στο χρόνο για να δεις το αποτέλεσμα",
      timeMachineResultTitle: "Το Μέλλον Ήρθε...",
      emptyTimeMachine: "Πώς να σε δείξω το μέλλον αν δεν μου πεις την ιδέα σου;",
      testTitle: "Αυτοαξιολόγηση",
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
      shakeToReveal: "Κούνησε το κινητό για να πάρεις την απάντησή σου",
    },
    en: {
      title: "Really?",
      subtitle: "Got dreams? Great! Let's treat them before they spread!",
      demotivateTitle: "Demotivate me",
      demotivateDesc: "Convince me why I shouldn't do it",
      excusesTitle: "Excuse generator",
      excusesDesc: "Convince someone else why I shouldn't do it",
      eightBallTitle: "8Ball",
      eightBallDesc: "Let faith decide if I should do it",
      distractionTitle: "Distraction",
      distractionDesc: "Distract me so I don't do it",
      timeMachineTitle: "Time Machine",
      timeMachineDesc: "Show me what happens if I do it",
      timeMachineLabel: "Want to see the future?",
      timeMachinePlaceholder: "Write your idea here and travel forward in time to see the outcome",
      timeMachineResultTitle: "The Future Has Arrived...",
      emptyTimeMachine: "How can I show you the future if you don't tell me your idea?",
      testTitle: "Self assessment",
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
      shakeToReveal: "Shake your phone to get your answer",
    }
  };

  const t = translations[language];

  // Refs and dynamic fitting for 8ball triangle text
  const textRef = useRef<HTMLParagraphElement>(null);
  const triangleRef = useRef<HTMLDivElement>(null);
  const [triangleFontSize, setTriangleFontSize] = useState<number>(14);

  useEffect(() => {
    if (selectedMode !== "8ball") return;
    const textEl = textRef.current;
    const container = triangleRef.current;
    if (!textEl || !container) return;

    const fit = () => {
      if (!textEl || !container) return;

      // Base typography for dense packing
      textEl.style.whiteSpace = "normal";
      textEl.style.wordBreak = "break-word";
      textEl.style.hyphens = "auto";
      textEl.style.width = "80%"; // keep away from triangle sides
      textEl.style.maxWidth = "80%";

      // Start large then shrink to fit
      let size = Math.round(Math.min(container.clientWidth, container.clientHeight) / 3.2);
      size = Math.min(size, 15); // cap max to avoid hitting the 8
      size = Math.max(size, 9);

      const applySize = (s: number) => {
        textEl.style.fontSize = `${s}px`;
        const lh = s >= 16 ? 1.15 : s >= 13 ? 1.12 : 1.08;
        textEl.style.lineHeight = String(lh);
        textEl.style.letterSpacing = "-0.01em";
      };

      applySize(size);

      // Use only the lower, wider portion of the triangle
      const availH = container.clientHeight * 0.62;
      const availW = container.clientWidth * 0.76;

      for (let i = 0; i < 100; i++) {
        const fitsH = textEl.scrollHeight <= availH;
        const fitsW = textEl.scrollWidth <= availW;
        if (fitsH && fitsW) break;
        size -= 1;
        if (size <= 8) break;
        applySize(size);
      }

      setTriangleFontSize(size);
    };

    // initial fit (after next paint)
    requestAnimationFrame(fit);

    // Re-fit on container resize/orientation changes (mobile)
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, [eightBallAnswer, selectedMode]);

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
    setIsWaitingForShake(false);
    setShowInput(true);
    
    if (newMode === "distraction") {
      if (selectedPet) {
        handleDistraction(selectedPet);
      } else {
        setShowPetDialog(true);
      }
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
    setSelectedPet(null);
    setIsWaitingForShake(false);
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
    if (!thought.trim()) {
      toast({
        title: t.emptyError,
        description: t.emptyExcuses,
        variant: "destructive",
      });
      return;
    }
    
    setMode("8ball");
    const answers = eightBallAnswers[language];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    setEightBallAnswer(randomAnswer);
    setMode(null);
  };

  const handleDistraction = async (petType: "cat" | "dog") => {
    setShowPetDialog(false);
    setSelectedPet(petType);
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

  const handleGoalSubmit = async () => {
    if (!testGoal.trim()) {
      toast({
        title: t.emptyError,
        description: t.emptyTestGoal,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-goal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ goal: testGoal, language }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process goal");
      }

      const data = await response.json();
      setTestGoal(data.processedGoal);
      setTestStep(2);
      setTestStartTime(Date.now());
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.errorDesc,
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {selectedMode 
                ? selectedMode === "demotivate" 
                  ? t.demotivateTitle
                  : selectedMode === "excuses"
                  ? t.excusesTitle
                  : selectedMode === "8ball"
                  ? t.eightBallTitle
                  : selectedMode === "distraction"
                  ? t.distractionTitle
                  : selectedMode === "timeMachine"
                  ? t.timeMachineTitle
                  : t.testTitle
                : t.title
              }
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            {selectedMode 
              ? selectedMode === "demotivate" 
                ? t.demotivateDesc
                : selectedMode === "excuses"
                ? t.excusesDesc
                : selectedMode === "8ball"
                ? t.eightBallDesc
                : selectedMode === "distraction"
                ? t.distractionDesc
                : selectedMode === "timeMachine"
                ? t.timeMachineDesc
                : t.testDesc
              : t.subtitle
            }
          </p>
        </header>

        {!showInput ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:gap-4 auto-rows-fr">
              <Card 
                onClick={() => handleModeSelection("demotivate")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.demotivateTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <ThumbsDown className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.demotivateDesc}</p>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("excuses")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.excusesTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.excusesDesc}</p>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("timeMachine")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.timeMachineTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <Clock className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.timeMachineDesc}</p>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("test")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.testTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.testDesc}</p>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("8ball")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.eightBallTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <span className="text-[48px] md:text-[64px] font-semibold text-primary">8</span>
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.eightBallDesc}</p>
                </div>
              </Card>
              
              <Card 
                onClick={() => handleModeSelection("distraction")}
                className="group relative p-0 bg-card/50 backdrop-blur-sm border-2 border-destructive shadow-xl cursor-pointer transition-all hover:scale-105 hover:border-destructive hover:shadow-2xl overflow-hidden flex flex-col h-full"
              >
                <div className="bg-destructive p-2 md:p-3 min-h-[44px] md:min-h-[52px] flex items-center justify-center">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-destructive-foreground text-center">{t.distractionTitle}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-3 md:p-4">
                  <Cat className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="p-2 md:p-3 min-h-[56px] md:min-h-[64px] flex items-center justify-center">
                  <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug line-clamp-2">{t.distractionDesc}</p>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="p-4 md:p-8 space-y-4 md:space-y-6 bg-card/50 backdrop-blur-sm border-2 border-border shadow-xl">
            {selectedMode === "8ball" && eightBallAnswer ? (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-2xl font-bold text-foreground text-center px-2">
                  {t.shouldI} {thought}
                </h2>
                <div className="flex items-center justify-center py-6 md:py-8">
                  <div className="relative w-[75vw] h-[75vw] max-w-[22rem] max-h-[22rem] md:w-96 md:h-96">
                    {/* Main 8ball sphere with 3D effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 via-black to-black shadow-[0_25px_80px_rgba(0,0,0,0.9),inset_0_-20px_40px_rgba(0,0,0,0.6)] border-4 border-black/50">
                      {/* Glossy highlight - top left */}
                      <div className="absolute top-12 left-16 md:top-16 md:left-20 w-16 h-16 md:w-24 md:h-24 bg-white/40 rounded-full blur-xl"></div>
                      <div className="absolute top-8 left-12 md:top-12 md:left-16 w-12 h-12 md:w-16 md:h-16 bg-white/60 rounded-full blur-lg"></div>
                      
                      {/* Number 8 badge - clean and prominent */}
                      <div className="absolute z-20 top-12 md:top-16 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-gray-200">
                        <span className="text-4xl md:text-5xl font-black text-black">8</span>
                      </div>
                      
                      {/* Answer window container - centered in bottom half */}
                      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 w-[82%] h-[62%] md:w-56 md:h-48 flex items-center justify-center z-10">
                        {/* Blue triangular window */}
                        <div className="relative w-full h-full overflow-hidden" ref={triangleRef}>
                          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                            <defs>
                              <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#1e3a8a', stopOpacity: 1}} />
                                <stop offset="50%" style={{stopColor: '#1e40af', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#1e3a8a', stopOpacity: 1}} />
                              </linearGradient>
                            </defs>
                            <polygon 
                              points="50,20 8,92 92,92" 
                              fill="url(#triangleGradient)"
                              stroke="#1e293b"
                              strokeWidth="3"
                              strokeLinejoin="round"
                            />
                          </svg>
                          
                          {/* Answer text - clipped inside triangle */}
                          <div className="absolute inset-0 flex items-end justify-center px-3 pb-6 md:pb-7" style={{clipPath: 'polygon(50% 20%, 12% 89%, 88% 89%)'}}>
                            <p ref={textRef} className="w-[80%] md:w-[78%] whitespace-normal font-semibold tracking-tight text-center text-white break-words" style={{ fontSize: `${triangleFontSize}px`, lineHeight: '1.08', hyphens: 'auto', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {eightBallAnswer}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom shadow for depth */}
                      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent rounded-full"></div>
                    </div>
                    
                    {/* Shadow beneath the ball */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-56 h-8 md:w-72 md:h-10 bg-black/40 rounded-full blur-2xl"></div>
                  </div>
                </div>
                {isWaitingForShake ? (
                  <p className="text-center text-base md:text-lg font-semibold text-muted-foreground animate-pulse">
                    {t.shakeToReveal}
                  </p>
                ) : (
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
                      onClick={() => {
                        setEightBallAnswer("");
                        setIsWaitingForShake(true);
                      }}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold transition-all hover:scale-105 h-11 md:h-12 text-sm md:text-base"
                      size="lg"
                    >
                      {t.btnShakeBallAgain}
                    </Button>
                  </div>
                )}
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
                <div className="flex flex-col gap-3 md:gap-4">
                  <Button
                    onClick={() => selectedPet && handleDistraction(selectedPet)}
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all hover:scale-105 h-14 md:h-16 text-base md:text-lg"
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
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="font-bold h-9 md:h-10 text-xs md:text-sm"
                    size="sm"
                  >
                    {t.btnBack}
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
                        <div className="flex flex-col gap-3 md:gap-4">
                          <Button
                            onClick={handleGoalSubmit}
                            disabled={!testGoal.trim()}
                            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold h-14 md:h-16 text-base md:text-lg transition-all hover:scale-105"
                            size="lg"
                          >
                            {t.testContinue}
                          </Button>
                          <Button
                            onClick={handleBack}
                            variant="outline"
                            className="font-bold h-9 md:h-10 text-xs md:text-sm"
                            size="sm"
                          >
                            {t.btnBack}
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
                                <>
                                  <Textarea
                                    value={thought}
                                    onChange={(e) => {
                                      setThought(e.target.value);
                                      if (selectedMode === "8ball" && e.target.value.trim()) {
                                        setIsWaitingForShake(true);
                                      } else if (selectedMode === "8ball" && !e.target.value.trim()) {
                                        setIsWaitingForShake(false);
                                      }
                                    }}
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
                                  {selectedMode === "8ball" && thought.trim() && (
                                    <p className="text-center text-base md:text-lg font-semibold text-muted-foreground animate-pulse">
                                      {t.shakeToReveal}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>

                            {selectedMode !== "test" && selectedMode !== "8ball" && (
                              <div className="flex flex-col gap-3 md:gap-4">
                                <Button
                                  onClick={() => {
                                    if (selectedMode === "demotivate") handleDemotivate();
                                    else if (selectedMode === "excuses") handleGenerateExcuses();
                                    else if (selectedMode === "timeMachine") handleTimeMachine();
                                  }}
                                  disabled={isLoading || !thought.trim()}
                                  className={`w-full font-bold h-14 md:h-16 text-base md:text-lg transition-all hover:scale-105 ${
                                    selectedMode === "demotivate"
                                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
                                    t.btnSubmit
                                  )}
                                </Button>
                                <Button
                                  onClick={handleBack}
                                  disabled={isLoading}
                                  variant="outline"
                                  className="font-bold h-9 md:h-10 text-xs md:text-sm"
                                  size="sm"
                                >
                                  {t.btnBack}
                                </Button>
                              </div>
                            )}
                            
                            {selectedMode === "8ball" && !eightBallAnswer && (
                              <Button
                                onClick={handleBack}
                                disabled={isLoading}
                                variant="outline"
                                className="font-bold h-9 md:h-10 text-xs md:text-sm w-full"
                                size="sm"
                              >
                                {t.btnBack}
                              </Button>
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
                <p className="text-base md:text-2xl font-bold text-center text-foreground italic px-2">
                  "{quote}"
                </p>
              ) : (
                <p className="text-lg md:text-2xl font-bold text-center text-muted-foreground/50 italic">
                  ...
                </p>
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
                  {savings.breakdown && (
                    <div className="mt-3 pt-3 border-t border-destructive/20 space-y-1">
                      {savings.breakdown.equipment > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{language === "el" ? "Εξοπλισμός" : "Equipment"}</span>
                          <span>€{savings.breakdown.equipment.toLocaleString()}</span>
                        </div>
                      )}
                      {savings.breakdown.travel > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{language === "el" ? "Ταξίδια" : "Travel"}</span>
                          <span>€{savings.breakdown.travel.toLocaleString()}</span>
                        </div>
                      )}
                      {savings.breakdown.software > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{language === "el" ? "Λογισμικό" : "Software"}</span>
                          <span>€{savings.breakdown.software.toLocaleString()}</span>
                        </div>
                      )}
                      {savings.breakdown.marketing > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{language === "el" ? "Μάρκετινγκ" : "Marketing"}</span>
                          <span>€{savings.breakdown.marketing.toLocaleString()}</span>
                        </div>
                      )}
                      {savings.breakdown.other > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{language === "el" ? "Άλλα" : "Other"}</span>
                          <span>€{savings.breakdown.other.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
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
