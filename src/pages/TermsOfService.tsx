import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        <p className="text-muted-foreground">Last updated: December 2, 2024</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using Baby Whisperer ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Baby Whisperer is an application that uses machine learning to analyze and identify different types of baby cries. The Service provides suggestions based on audio analysis and is intended as a parenting aid, not a substitute for professional medical advice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">3. Medical Disclaimer</h2>
          <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> Baby Whisperer is NOT a medical device and should not be used to diagnose medical conditions. Always consult a healthcare professional if you have concerns about your baby's health. The cry detection results are suggestions only and may not always be accurate.
            </p>
          </div>
        </section>

        <section className="space-y-4 bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h2 className="text-lg font-semibold text-primary">4. Audio Data Collection & Contribution</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Voluntary Contribution Program:</strong> You may opt-in to contribute audio recordings to help improve Baby Whisperer's cry detection capabilities.
            </p>
            <p>By participating in the audio contribution program, you:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Grant Baby Whisperer a non-exclusive, royalty-free, worldwide license to use, process, and analyze contributed audio recordings solely for the purpose of improving our cry detection algorithms.</li>
              <li>Confirm that you have the legal authority to consent to recording and sharing audio of the baby in question (e.g., you are the parent or legal guardian).</li>
              <li>Understand that contributed audio will be anonymized and may be used to train machine learning models.</li>
              <li>Acknowledge that this license survives termination of your account, though you may request deletion of your contributions at any time.</li>
            </ul>
            <p>
              <strong className="text-foreground">Use Restrictions:</strong> We will ONLY use contributed audio data within the Baby Whisperer application ecosystem. Audio data will never be sold, shared with third parties, or used for any purpose other than improving cry detection accuracy.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">5. User Accounts</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p>To use certain features, you must create an account. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">6. Subscriptions & Payments</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p><strong className="text-foreground">Free Tier:</strong> Limited to 5 cry detections per day.</p>
            <p><strong className="text-foreground">Premium Monthly:</strong> Unlimited detections for $4.99/month, billed monthly. You may cancel at any time.</p>
            <p><strong className="text-foreground">Lifetime Access:</strong> One-time payment of $19.99 for unlimited lifetime access.</p>
            <p>Refunds are handled in accordance with applicable app store policies.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">7. Prohibited Uses</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
            <li>Using the Service for any illegal purpose</li>
            <li>Attempting to reverse engineer, decompile, or extract the machine learning models</li>
            <li>Uploading malicious content or audio designed to manipulate the system</li>
            <li>Sharing account access with others</li>
            <li>Using automated systems to access the Service</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">8. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content, features, and functionality of Baby Whisperer, including but not limited to the machine learning models, cry database, user interface, and documentation, are owned by Baby Whisperer and protected by international copyright and trademark laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Baby Whisperer shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">10. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time. Upon termination, your right to use the Service ceases immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">11. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">12. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms, please contact us at legal@babywhisperer.app
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
