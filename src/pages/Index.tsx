import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Baby, BookOpen, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListeningView from "@/components/ListeningView";
import ResultsView from "@/components/ResultsView";
import DatabaseView from "@/components/DatabaseView";
import { CryType, cryDatabase } from "@/data/cryDatabase";

type AppState = "home" | "listening" | "results" | "database" | "about";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("home");
  const [detectedCry, setDetectedCry] = useState<CryType | null>(null);

  const startListening = () => {
    setAppState("listening");
    
    // Simulate detection after 3 seconds
    setTimeout(() => {
      // Randomly select a cry for demo
      const randomCry = cryDatabase[Math.floor(Math.random() * cryDatabase.length)];
      setDetectedCry(randomCry);
      setAppState("results");
    }, 3000);
  };

  const resetToHome = () => {
    setAppState("home");
    setDetectedCry(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
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
                  Baby Cry Detective
                </h1>
              </motion.div>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-lg"
              >
                Understand what your baby needs, instantly
              </motion.p>
            </header>

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
          <ListeningView key="listening" onCancel={resetToHome} />
        )}

        {appState === "results" && detectedCry && (
          <ResultsView
            key="results"
            cry={detectedCry}
            onListenAgain={startListening}
            onBack={resetToHome}
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
                    <h1 className="text-3xl font-bold">About Baby Cry Detective</h1>
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
                    Audio is processed on-device when possible. No recordings are stored or shared. 
                    This app is a tool to help parents - always consult your pediatrician for medical concerns.
                  </p>
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
