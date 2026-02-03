import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <Terminal className="h-16 w-16 text-primary mx-auto mb-6 animate-glow-pulse" />
        <h1 className="text-6xl font-bold font-mono mb-4">
          <span className="text-primary">404</span>
        </h1>
        <p className="text-xl text-muted-foreground font-mono mb-2">
          <span className="text-destructive">[ERROR]</span> Page not found
        </p>
        <p className="text-muted-foreground font-mono mb-8">
          The requested resource does not exist.
        </p>
        <Link to="/dashboard">
          <Button className="font-mono cyber-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
