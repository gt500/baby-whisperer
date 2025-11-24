import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      
      // Update subscription record
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active'
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_type: 'free',
        daily_detections_remaining: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let planType = 'free';
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;
    let stripePriceId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      stripeSubscriptionId = subscription.id;
      stripePriceId = subscription.items.data[0].price.id;
      planType = 'premium_monthly';
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
    } else {
      // Check for one-time lifetime purchases
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100
      });
      
      const lifetimePayment = payments.data.find((payment: any) => 
        payment.status === 'succeeded' && 
        payment.metadata?.product_type === 'lifetime'
      );
      
      if (lifetimePayment) {
        planType = 'lifetime';
        logStep("Found lifetime purchase");
      }
    }

    // Update subscription in database
    await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: stripePriceId,
        plan_type: planType,
        status: 'active',
        current_period_start: hasActiveSub ? new Date(subscriptions.data[0].current_period_start * 1000).toISOString() : null,
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    // Get daily detection count
    const { data: canDetect } = await supabaseClient.rpc('can_detect_cry', { _user_id: user.id });
    const { data: dailyCount } = await supabaseClient.rpc('get_daily_detection_count', { _user_id: user.id });

    return new Response(JSON.stringify({
      subscribed: planType !== 'free',
      plan_type: planType,
      subscription_end: subscriptionEnd,
      can_detect: canDetect,
      daily_detections_used: dailyCount || 0,
      daily_detections_limit: planType === 'free' ? 5 : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
