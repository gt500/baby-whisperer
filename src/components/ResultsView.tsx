import { motion } from "framer-motion";
import { CheckCircle2, Volume2, AlertCircle, Home, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryType } from "@/data/cryDatabase";
import { Badge } from "@/components/ui/badge";
import { FeedbackPrompt } from "./FeedbackPrompt";
import { BabyHandPositions } from "./BabyHandPositions";
import { useState } from "react";

interface ResultsViewProps {
  cry: CryType;
  onListenAgain: () => void;
  onBack: () => void;
  contributionId?: string | null;
  onFeedbackSubmit?: (isCorrect: boolean, correctedType?: string) => void;
  showFeedback?: boolean;
}

const intensityColors = {
  low: "bg-success/20 text-success-foreground border-success/30",
  medium: "bg-warning/20 text-warning-foreground border-warning/30",
  high: "bg-destructive/20 text-destructive-foreground border-destructive/30",
};

const categoryColors = {
  dunstan: "bg-accent/20 text-accent-foreground",
  hunger: "bg-warning/20 text-warning-foreground",
  pain: "bg-destructive/20 text-destructive-foreground",
  sleep: "bg-[hsl(260,50%,90%)] text-[hsl(260,50%,30%)]",
  fussy: "bg-[hsl(40,60%,90%)] text-[hsl(40,60%,30%)]",
  attention: "bg-[hsl(200,60%,90%)] text-[hsl(200,60%,30%)]",
  overstimulation: "bg-[hsl(30,60%,90%)] text-[hsl(30,60%,30%)]",
  fear: "bg-[hsl(0,60%,90%)] text-[hsl(0,60%,30%)]",
};

const ResultsView = ({ 
  cry, 
  onListenAgain, 
  onBack, 
  contributionId,
  onFeedbackSubmit,
  showFeedback = false 
}: ResultsViewProps) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = (isCorrect: boolean, correctedType?: string) => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(isCorrect, correctedType);
    }
    setFeedbackSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
            }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold">Cry Detected!</h2>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-8 shadow-card space-y-6"
        >
          {/* Cry Name & Category */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-3xl font-bold text-foreground">{cry.name}</h3>
              <Badge className={categoryColors[cry.category]}>
                {cry.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{cry.audioPattern}</span>
            </div>
            <Badge variant="outline" className={intensityColors[cry.intensity]}>
              {cry.intensity.toUpperCase()} intensity
            </Badge>
          </div>

          {/* Description */}
          <div className="bg-secondary/50 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground leading-relaxed">{cry.description}</p>
            </div>
          </div>

          {/* Age Range if available */}
          {cry.ageRange && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">Typical age range:</span> {cry.ageRange}
            </div>
          )}

          {/* Solutions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              What to do:
            </h4>
            <div className="space-y-3">
              {cry.solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 bg-accent/10 rounded-xl p-4 border border-accent/20"
                >
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-accent-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-foreground leading-relaxed pt-0.5">{solution}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feedback Prompt */}
        {showFeedback && contributionId && !feedbackSubmitted && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <FeedbackPrompt
              detectedCryType={cry.id}
              onSubmit={handleFeedback}
              onSkip={() => setFeedbackSubmitted(true)}
            />
          </motion.div>
        )}

        {feedbackSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-success/10 rounded-2xl p-4 text-center border border-success/20"
          >
            <p className="text-success font-medium">Thank you for your feedback!</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Button
            onClick={onListenAgain}
            className="flex-1 h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-soft"
          >
            <Mic className="w-5 h-5 mr-2" />
            Listen Again
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="h-14 px-6 rounded-2xl"
          >
            <Home className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      <BabyHandPositions />
    </motion.div>
  );
};

export default ResultsView;
