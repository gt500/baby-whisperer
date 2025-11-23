import { motion } from "framer-motion";
import { Mic, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { recordAudio, audioBufferToFloat32Array, normalizeAudio, hasSignificantAudio } from "@/lib/audioProcessing";
import { useCryDetection } from "@/hooks/useCryDetection";
import { toast } from "sonner";

interface ListeningViewProps {
  onCancel: () => void;
  onDetectionComplete: (isCrying: boolean, confidence: number, cryType: string | null) => void;
}

const ListeningView = ({ onCancel, onDetectionComplete }: ListeningViewProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("Initializing...");
  const [isProcessing, setIsProcessing] = useState(false);
  const { detectCry, loadModel } = useCryDetection();

  useEffect(() => {
    startDetection();
  }, []);

  const startDetection = async () => {
    try {
      // Phase 1: Load model
      setStatus("Loading AI model...");
      setProgress(10);
      await loadModel();
      
      // Phase 2: Request microphone access
      setStatus("Accessing microphone...");
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Phase 3: Start recording
      setStatus("Listening to baby...");
      setProgress(30);
      
      const recording = await recordAudio(4000); // 4 seconds
      
      // Simulate progress during recording
      const recordingInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 70) {
            clearInterval(recordingInterval);
            return 70;
          }
          return prev + 2;
        });
      }, 50);
      
      // Wait for recording to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      clearInterval(recordingInterval);
      
      // Phase 4: Process audio
      setStatus("Processing audio...");
      setProgress(75);
      setIsProcessing(true);
      
      const audioData = audioBufferToFloat32Array(recording.audioBuffer);
      const normalizedAudio = normalizeAudio(audioData);
      
      // Check if audio has significant content
      if (!hasSignificantAudio(normalizedAudio)) {
        toast.error("No audio detected. Please try again in a quieter environment.");
        onCancel();
        return;
      }
      
      // Phase 5: Run ML inference
      setStatus("Analyzing cry pattern...");
      setProgress(85);
      
      const result = await detectCry(normalizedAudio);
      
      if (!result) {
        // Detection was blocked (e.g., subscription limit)
        onCancel();
        return;
      }
      
      // Phase 6: Complete
      setProgress(100);
      setStatus("Analysis complete!");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return results
      onDetectionComplete(result.isCrying, result.confidence, result.cryType);
      
    } catch (error: any) {
      console.error('Detection error:', error);
      
      if (error.message?.includes('microphone') || error.message?.includes('permission')) {
        toast.error("Microphone access denied. Please enable microphone permissions in your browser settings.");
      } else {
        toast.error("Failed to analyze audio. Please try again.");
      }
      
      onCancel();
    }
  };

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
            {isProcessing ? "Analyzing..." : "Listening..."}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            {status}
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{status}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Microphone Permission Info */}
        {progress < 30 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-accent/10 rounded-xl p-4 border border-accent/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Microphone Access Required</p>
              <p>Please allow microphone access when prompted by your browser.</p>
            </div>
          </motion.div>
        )}

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
