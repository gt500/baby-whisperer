import { useNavigate } from "react-router-dom";
import { Sparkles, Crown, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
export const SubscriptionBanner = () => {
  const {
    user,
    subscription
  } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Get Started Free!</p>
              <p className="text-sm text-muted-foreground">Create an account for 5 free detections daily</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-accent text-white">
            Sign Up
          </Button>
        </div>
      </div>;
  }
  if (subscription?.plan_type === 'free') {
    const remaining = (subscription.daily_detections_limit || 10) - (subscription.daily_detections_used || 0);
    const isLow = remaining <= 3;
    return <div className={`rounded-2xl p-4 mb-6 ${isLow ? 'bg-warning/10 border border-warning/30' : 'bg-secondary/50 border border-border'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isLow ? <AlertCircle className="w-6 h-6 text-warning" /> : <Sparkles className="w-6 h-6 text-primary" />}
            <div>
              <p className="font-semibold text-foreground">
                {remaining} Free Detections Left Today
              </p>
              <p className="text-sm text-muted-foreground">
                {isLow ? "Upgrade for unlimited detections!" : "Resets daily at midnight"}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/pricing")} variant={isLow ? "default" : "outline"} className={isLow ? "bg-gradient-to-r from-warning to-primary text-white" : ""}>
            Upgrade
          </Button>
        </div>
      </div>;
  }
  if (subscription?.plan_type === 'lifetime') {
    return <div className="bg-gradient-to-r from-warning/10 to-primary/10 border border-warning/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-warning" />
          <div>
            <p className="font-semibold text-foreground">Lifetime Access</p>
            <p className="text-sm text-muted-foreground">
              Unlimited detections forever • Thank you for your support!
            </p>
          </div>
        </div>
      </div>;
  }
  if (subscription?.plan_type === 'premium_monthly') {
    return <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent" />
            <div>
              <p className="font-semibold text-foreground">Premium Active</p>
              <p className="text-sm text-muted-foreground">
                Unlimited detections • Renews {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'monthly'}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/pricing")} variant="outline">
            Manage
          </Button>
        </div>
      </div>;
  }
  return null;
};