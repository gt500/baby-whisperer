import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STRIPE_PRICES = {
  premium_monthly: "price_1SWaDg1hxp3x6dVcZgPzzHBR",
  lifetime: "price_1SWaDx1hxp3x6dVcR3HF6PCC"
};

const Pricing = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planType: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, planType }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = subscription?.plan_type || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Start understanding your baby better today
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-card rounded-3xl p-8 shadow-card ${currentPlan === 'free' ? 'ring-2 ring-primary' : ''}`}
          >
            <Sparkles className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-6">
              $0
              <span className="text-lg text-muted-foreground">/forever</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>10 detections per day</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>Access to cry database</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>Basic support</span>
              </li>
            </ul>

            {currentPlan === 'free' && (
              <div className="text-center text-primary font-semibold">
                Current Plan
              </div>
            )}
          </motion.div>

          {/* Premium Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-card rounded-3xl p-8 shadow-card relative ${currentPlan === 'premium_monthly' ? 'ring-2 ring-accent' : ''}`}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>
            <Zap className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-4xl font-bold mb-6">
              $4.99
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span className="font-semibold">Unlimited detections</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>All 17 cry types</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>No ads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            {currentPlan === 'premium_monthly' ? (
              <div className="text-center text-accent font-semibold">
                Current Plan
              </div>
            ) : (
              <Button
                onClick={() => handleSubscribe(STRIPE_PRICES.premium_monthly, 'premium_monthly')}
                disabled={loading !== null}
                className="w-full h-12 bg-gradient-to-r from-accent to-primary text-white"
              >
                {loading === 'premium_monthly' ? 'Loading...' : 'Subscribe'}
              </Button>
            )}
          </motion.div>

          {/* Lifetime */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-card rounded-3xl p-8 shadow-card ${currentPlan === 'lifetime' ? 'ring-2 ring-primary' : ''}`}
          >
            <Crown className="w-12 h-12 text-warning mb-4" />
            <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
            <div className="text-4xl font-bold mb-6">
              $19.99
              <span className="text-lg text-muted-foreground">/forever</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span className="font-semibold">Everything in Premium</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span className="font-semibold">One-time payment</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>Lifetime access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>All future updates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-success mt-0.5" />
                <span>VIP support</span>
              </li>
            </ul>

            {currentPlan === 'lifetime' ? (
              <div className="text-center text-warning font-semibold">
                Current Plan
              </div>
            ) : (
              <Button
                onClick={() => handleSubscribe(STRIPE_PRICES.lifetime, 'lifetime')}
                disabled={loading !== null}
                className="w-full h-12 bg-gradient-to-r from-warning to-primary text-white"
              >
                {loading === 'lifetime' ? 'Loading...' : 'Buy Lifetime'}
              </Button>
            )}
          </motion.div>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
