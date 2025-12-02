import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cryDatabase } from "@/data/cryDatabase";

interface FeedbackPromptProps {
  detectedCryType: string;
  onSubmit: (isCorrect: boolean, correctedType?: string) => void;
  onSkip: () => void;
}

export const FeedbackPrompt = ({ detectedCryType, onSubmit, onSkip }: FeedbackPromptProps) => {
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const handleCorrect = () => {
    onSubmit(true);
  };

  const handleIncorrect = () => {
    setShowCorrection(true);
  };

  const handleSubmitCorrection = () => {
    if (selectedType) {
      onSubmit(false, selectedType);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/10 rounded-2xl p-5 border border-accent/20"
    >
      <p className="font-semibold mb-3">Was this detection correct?</p>
      
      {!showCorrection ? (
        <div className="flex gap-3">
          <Button
            onClick={handleCorrect}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-success/50 hover:bg-success/10"
          >
            <ThumbsUp className="w-5 h-5 mr-2 text-success" />
            Yes, correct
          </Button>
          <Button
            onClick={handleIncorrect}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-destructive/50 hover:bg-destructive/10"
          >
            <ThumbsDown className="w-5 h-5 mr-2 text-destructive" />
            Not quite
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">What cry type was it?</p>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select the correct cry type" />
            </SelectTrigger>
            <SelectContent>
              {cryDatabase.map((cry) => (
                <SelectItem key={cry.id} value={cry.id}>
                  {cry.name}
                </SelectItem>
              ))}
              <SelectItem value="not-a-cry">Not a baby cry</SelectItem>
              <SelectItem value="unknown">I'm not sure</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCorrection(false)}
              variant="ghost"
              className="flex-1 h-10 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitCorrection}
              disabled={!selectedType}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              Submit
            </Button>
          </div>
        </div>
      )}
      
      <button
        onClick={onSkip}
        className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip feedback
      </button>
    </motion.div>
  );
};
