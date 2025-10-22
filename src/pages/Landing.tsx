import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-3xl text-center space-y-8">
        <p className="text-2xl md:text-4xl leading-relaxed text-foreground/90">
          So, you think today's the day you crack the code.
        </p>
        <p className="text-2xl md:text-4xl leading-relaxed text-foreground/90">
          The app, the product, the genius idea that'll make you rich and allow you to quit your job.
        </p>
        <p className="text-2xl md:text-4xl leading-relaxed text-foreground/90">
          You're feeling it, huh? The confidence, the vision, the glow.
        </p>
        
        <div className="pt-8">
          <Button
            onClick={() => navigate("/app")}
            size="lg"
            className="text-3xl md:text-5xl font-bold px-12 py-8 h-auto hover:scale-105 transition-transform"
          >
            Really?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
