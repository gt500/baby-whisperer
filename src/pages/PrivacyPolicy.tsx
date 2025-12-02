import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        <p className="text-muted-foreground">Last updated: December 2, 2024</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Baby Whisperer ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">2. Information We Collect</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p><strong className="text-foreground">Account Information:</strong> Email address, name (if provided), and authentication credentials.</p>
            <p><strong className="text-foreground">Usage Data:</strong> App interactions, cry detection history, and feature usage statistics.</p>
            <p><strong className="text-foreground">Device Information:</strong> Device type, operating system, and app version.</p>
          </div>
        </section>

        <section className="space-y-4 bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h2 className="text-lg font-semibold text-primary">3. Audio Data Collection & Use</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Opt-In Audio Contributions:</strong> If you choose to participate in our "Help Improve Baby Whisperer" program, you consent to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We may collect and store audio recordings of baby cries captured during the app's listening feature.</li>
              <li>Recordings are anonymized and stripped of any identifying metadata before storage.</li>
              <li>Audio data is used exclusively to improve Baby Whisperer's cry detection accuracy and is never shared with third parties.</li>
              <li>You may withdraw consent at any time through the app's Settings, and all your contributed audio will be deleted within 30 days.</li>
            </ul>
            <p>
              <strong className="text-foreground">Data Processing:</strong> Audio recordings are processed to extract acoustic features for machine learning model training. The original audio files are stored securely and encrypted at rest.
            </p>
            <p>
              <strong className="text-foreground">Retention:</strong> Contributed audio recordings are retained for up to 3 years for model training purposes, unless you request earlier deletion.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">4. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
            <li>To provide and maintain the Baby Whisperer service</li>
            <li>To process your subscription and payments</li>
            <li>To improve our cry detection algorithms (with consent)</li>
            <li>To send service-related communications</li>
            <li>To provide customer support</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">5. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including encryption in transit (TLS) and at rest, secure authentication, and regular security audits. Access to audio data is strictly limited to authorized personnel for model training purposes only.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">6. Your Rights</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for audio collection at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Baby Whisperer is designed for use by parents and caregivers. We do not knowingly collect personal information from children under 13. Audio recordings of babies are collected only with explicit parental consent and are used solely for improving cry detection accuracy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">8. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at privacy@babywhisperer.app
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
