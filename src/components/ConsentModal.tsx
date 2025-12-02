import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal = ({ isOpen, onAccept, onDecline }: ConsentModalProps) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-3xl p-8 max-w-lg w-full shadow-card relative"
          >
            <button
              onClick={onDecline}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Help Improve Baby Whisperer</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your contributions help us build a better cry detection system for all parents.
            </p>

            <div className="bg-secondary/50 rounded-2xl p-5 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Privacy Protected</p>
                  <p className="text-sm text-muted-foreground">
                    Audio recordings are anonymized and used only to improve our AI model.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Help Other Parents</p>
                  <p className="text-sm text-muted-foreground">
                    Your contributions help us better understand baby cries and help families everywhere.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <Checkbox
                id="consent"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                I agree to contribute anonymized cry recordings to help improve Baby Whisperer. 
                I understand I can withdraw consent at any time in Settings.
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onDecline}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Not Now
              </Button>
              <Button
                onClick={onAccept}
                disabled={!agreed}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent"
              >
                Contribute
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
