import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const handPositions = [
  {
    id: "fists-clenched",
    name: "Fists Clenched Tight",
    image: "✊",
    meaning: "Hunger or stress",
    description: "Baby is hungry or feeling stressed. Tight fists often indicate the baby needs feeding or comfort.",
  },
  {
    id: "hands-open-relaxed",
    name: "Open & Relaxed Hands",
    image: "🖐️",
    meaning: "Content & satisfied",
    description: "Baby is calm, content, and feels secure. This is a sign of a happy, relaxed baby.",
  },
  {
    id: "fingers-splayed",
    name: "Fingers Splayed Wide",
    image: "🖐️",
    meaning: "Overstimulated",
    description: "Baby may be overwhelmed. Too much activity or stimulation. Consider a calmer environment.",
  },
  {
    id: "hands-to-mouth",
    name: "Hands to Mouth",
    image: "👶",
    meaning: "Self-soothing or hungry",
    description: "Baby is either self-soothing or showing early hunger cues. Watch for other hunger signs.",
  },
  {
    id: "grabbing-ears",
    name: "Grabbing Ears",
    image: "👂",
    meaning: "Tired or ear discomfort",
    description: "Often a sign of tiredness. If persistent with crying, could indicate ear discomfort.",
  },
  {
    id: "rubbing-eyes",
    name: "Rubbing Eyes/Face",
    image: "😴",
    meaning: "Sleepy",
    description: "Classic sign of tiredness. Baby is ready for sleep or a nap.",
  },
  {
    id: "arms-flailing",
    name: "Arms Flailing",
    image: "🙌",
    meaning: "Excitement or distress",
    description: "Could be excitement during play, or distress if accompanied by crying. Context matters.",
  },
  {
    id: "hands-behind-head",
    name: "Hands Behind Head",
    image: "🧘",
    meaning: "Very relaxed",
    description: "Baby is extremely comfortable and content. A sign of deep relaxation.",
  },
];

export const BabyHandPositions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Tab trigger - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary/90 hover:bg-primary text-primary-foreground px-2 py-4 rounded-l-lg shadow-lg transition-all duration-300 flex flex-col items-center gap-2"
        aria-label="Toggle hand positions guide"
      >
        <Hand className="h-5 w-5" />
        <span className="writing-mode-vertical text-xs font-medium tracking-wider">
          Hand Guide
        </span>
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Sliding panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-2xl z-50"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Hand className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Baby Hand Positions</h2>
                      <p className="text-xs text-muted-foreground">What baby's hands are telling you</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {handPositions.map((position) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{position.image}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground">
                              {position.name}
                            </h3>
                            <p className="text-xs font-medium text-primary mt-0.5">
                              {position.meaning}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {position.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 border-t border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground text-center">
                    Always consider context and other cues
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </>
  );
};
