import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    sessionStorage.setItem("hasVisitedFromLanding", "true");
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-12 md:space-y-16">
        <div className="space-y-8 md:space-y-12 animate-fade-in">
          <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-foreground/80 font-light tracking-tight">
            So, you think today's the day you crack the code.
          </p>
          <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-foreground/80 font-light tracking-tight">
            The app, the product, the genius idea that'll make you rich and allow you to quit your job.
          </p>
          <p className="text-xl md:text-3xl lg:text-4xl leading-relaxed text-foreground/80 font-light tracking-tight">
            You're feeling it, huh? The confidence, the vision, the glow.
          </p>
        </div>
        
        <div className="flex justify-center pt-4 md:pt-8 animate-scale-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          <Button
            onClick={handleContinue}
            size="lg"
            className="text-3xl md:text-5xl lg:text-6xl font-light px-12 md:px-20 py-5 md:py-8 h-auto hover:scale-110 transition-all duration-300 hover:shadow-lg tracking-tight"
          >
            Really?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
