import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, Baby, BookOpen, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListeningView from "@/components/ListeningView";
import ResultsView from "@/components/ResultsView";
import DatabaseView from "@/components/DatabaseView";
import ModelStatus from "@/components/ModelStatus";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { ConsentModal } from "@/components/ConsentModal";
import { CryType, cryDatabase } from "@/data/cryDatabase";
import { useConsent } from "@/hooks/useConsent";
import { useCryContributions } from "@/hooks/useCryContributions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type AppState = "home" | "listening" | "results" | "database" | "about";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("home");
  const [detectedCry, setDetectedCry] = useState<CryType | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingContributionId, setPendingContributionId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { hasConsent, isLoading: consentLoading, setConsent } = useConsent();
  const { uploadContribution, submitFeedback } = useCryContributions();

  // Model health check on mount
  useEffect(() => {
    const checkModelFiles = async () => {
      try {
        const response = await fetch('/models/baby_cry_detector/model.json');
        console.log('[Index] Model file check - Status:', response.status);
        console.log('[Index] Content-Type:', response.headers.get('content-type'));
        
        if (response.ok) {
          const text = await response.text();
          try {
            JSON.parse(text);
            console.log('[Index] Model JSON is valid and accessible');
          } catch {
            console.error('[Index] Model file is not valid JSON. Content preview:', text.substring(0, 100));
          }
        } else {
          console.error('[Index] Model file not accessible:', response.status);
        }
      } catch (error) {
        console.error('[Index] Failed to check model file:', error);
      }
    };
    
    checkModelFiles();
  }, []);

  const startListening = () => {
    // If user is logged in and hasn't given consent yet, show the modal
    if (user && !hasConsent && !consentLoading) {
      setShowConsentModal(true);
    } else {
      setAppState("listening");
    }
  };

  const handleConsentAccept = async () => {
    await setConsent(true);
    setShowConsentModal(false);
    toast.success("Thank you for helping improve Baby Whisperer!");
    setAppState("listening");
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setAppState("listening");
  };

  const handleDetectionComplete = async (
    isCrying: boolean, 
    confidence: number, 
    cryType: string | null,
    audioBlob?: Blob,
    durationSeconds?: number
  ) => {
    if (!isCrying || !cryType) {
      setAppState("home");
      return;
    }

    // Find the detected cry type in our database
    const detectedCryData = cryDatabase.find(cry => cry.id === cryType);
    if (!detectedCryData) {
      setAppState("home");
      return;
    }

    // Upload contribution if user gave consent
    let contributionId: string | null = null;
    if (user && hasConsent && audioBlob && durationSeconds) {
      contributionId = await uploadContribution({
        audioBlob,
        detectedCryType: cryType,
        confidence,
        durationSeconds,
      });
      setPendingContributionId(contributionId);
    }

    setDetectedCry(detectedCryData);
    setAppState("results");
  };

  const handleFeedbackSubmit = async (isCorrect: boolean, correctedType?: string) => {
    if (pendingContributionId) {
      await submitFeedback({
        contributionId: pendingContributionId,
        isCorrect,
        userVerifiedType: correctedType,
      });
      toast.success("Feedback recorded. Thank you!");
    }
  };

  const resetToHome = () => {
    setAppState("home");
    setDetectedCry(null);
    setPendingContributionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      <AnimatePresence mode="wait">
        {appState === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-6 text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3 mb-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft">
                  <Baby className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Baby Whisperer
                </h1>
              </motion.div>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-lg mb-3"
              >
                Understand what your baby needs, instantly
              </motion.p>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <ModelStatus />
              </motion.div>
            </header>

            {/* Subscription Banner */}
            <div className="px-6 max-w-md mx-auto w-full">
              <SubscriptionBanner />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-md"
              >
                {/* Big Listen Button */}
                <div className="mb-12">
                  <Button
                    onClick={startListening}
                    className="w-64 h-64 rounded-full bg-gradient-to-br from-primary via-primary to-accent text-white shadow-glow hover:scale-105 transition-all duration-300 mx-auto flex flex-col items-center justify-center gap-4 border-8 border-white/20"
                    size="lg"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Mic className="w-24 h-24" />
                    </motion.div>
                    <span className="text-2xl font-bold">Start Listening</span>
                  </Button>
                </div>

                {/* Feature Cards */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => setAppState("database")}
                      variant="outline"
                      className="w-full h-auto py-6 justify-between bg-card hover:bg-secondary/50 border-border rounded-2xl shadow-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-accent" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">Browse Cry Database</div>
                          <div className="text-sm text-muted-foreground">17 cry types explained</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      onClick={() => setAppState("about")}
                      variant="outline"
                      className="w-full h-auto py-6 justify-between bg-card hover:bg-secondary/50 border-border rounded-2xl shadow-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Info className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">About This App</div>
                          <div className="text-sm text-muted-foreground">How it works & science</div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </main>
          </motion.div>
        )}

        {appState === "listening" && (
          <ListeningView 
            key="listening" 
            onCancel={resetToHome}
            onDetectionComplete={handleDetectionComplete}
            shouldSaveAudio={user !== null && hasConsent}
          />
        )}

        {appState === "results" && detectedCry && (
          <ResultsView
            key="results"
            cry={detectedCry}
            onListenAgain={startListening}
            onBack={resetToHome}
            contributionId={pendingContributionId}
            onFeedbackSubmit={handleFeedbackSubmit}
            showFeedback={!!pendingContributionId}
          />
        )}

        {appState === "database" && (
          <DatabaseView key="database" onBack={resetToHome} />
        )}

        {appState === "about" && (
          <motion.div
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-6"
          >
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={resetToHome}
                variant="ghost"
                className="mb-6"
              >
                ← Back
              </Button>
              
              <div className="bg-card rounded-3xl p-8 shadow-card space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Baby className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">About Baby Whisperer</h1>
                    <p className="text-muted-foreground">Science-backed cry detection</p>
                  </div>
                </div>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">How It Works</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This app uses machine learning trained on thousands of baby cry samples to identify 
                    17 different cry types. It analyzes audio patterns, intensity, and specific sound 
                    characteristics to determine what your baby needs.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">Dunstan Baby Language</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The first 5 sounds (Neh, Owh, Heh, Eairh, Eh) are based on the Dunstan Baby Language 
                    system - universal pre-cry sounds that all babies make in the first 3 months, 
                    regardless of culture or language.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">Accuracy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI model achieves 85-95% accuracy in controlled conditions. Real-world accuracy 
                    may vary based on background noise, baby's age, and individual variations. Always 
                    trust your parental instincts alongside the app's suggestions.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold">Privacy & Safety</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Audio is processed on-device when possible. No recordings are stored or shared 
                    without your explicit consent. You can opt-in to help improve our AI by contributing 
                    anonymized cry recordings. This app is a tool to help parents - always consult your 
                    pediatrician for medical concerns.
                  </p>
                  <div className="flex gap-4 pt-2">
                    <Link to="/privacy" className="text-primary hover:underline text-sm">
                      Privacy Policy
                    </Link>
                    <Link to="/terms" className="text-primary hover:underline text-sm">
                      Terms of Service
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
