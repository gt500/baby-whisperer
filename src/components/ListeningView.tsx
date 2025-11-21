import { motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface ListeningViewProps {
  onCancel: () => void;
}

const ListeningView = ({ onCancel }: ListeningViewProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
    >
      {/* Cancel Button */}
      <Button
        onClick={onCancel}
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 rounded-full w-12 h-12"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="w-full max-w-md space-y-12">
        {/* Animated Microphone */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Pulse rings */}
            <motion.div
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full bg-accent/30 blur-xl"
            />

            {/* Main icon */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Mic className="w-24 h-24 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold"
          >
            Listening...
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Hold your phone near your baby
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Analyzing cry pattern...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Visual Sound Waves */}
        <div className="flex justify-center items-center gap-2 h-20">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: ["20%", "100%", "20%"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
              className="w-2 bg-gradient-to-t from-primary to-accent rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ListeningView;
