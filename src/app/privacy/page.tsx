import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Soccer Near Me",
  description: "Privacy policy for Soccer Near Me — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary mb-8">Privacy Policy</h1>
      <div className="prose prose-sm text-gray-600 space-y-6">
        <p className="text-muted text-sm">Last updated: March 5, 2026</p>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">1. Information We Collect</h2>
          <p>When you use Soccer Near Me, we may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
            <li><strong>Listing Information:</strong> Details you provide when creating or managing a listing, including club name, location, contact information, photos, and videos.</li>
            <li><strong>Payment Information:</strong> When making donations through our platform, payment details are processed securely by Stripe. We do not store credit card numbers.</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, and other interactions with our platform.</li>
            <li><strong>Communications:</strong> Messages sent through contact forms on the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide, maintain, and improve our services.</li>
            <li>To process transactions and send related information.</li>
            <li>To send notifications related to your account or listings.</li>
            <li>To respond to your comments, questions, and requests.</li>
            <li>To monitor and analyze trends, usage, and activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., hosting, payment processing, email delivery).</li>
            <li><strong>Listing Contacts:</strong> When you submit a contact form on a listing, your name, email, and message are shared with the listing owner.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">4. Cookies</h2>
          <p>We use cookies and similar technologies to maintain your session, remember your preferences, and understand how you use our platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">6. Your Rights</h2>
          <p>You may access, update, or delete your account information at any time through your dashboard. To request deletion of your data, please contact us.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">7. Children&apos;s Privacy</h2>
          <p>Our platform is designed for use by parents, coaches, and club administrators. We do not knowingly collect personal information from children under 13 without parental consent.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">9. Contact Us</h2>
          <p>If you have questions about this privacy policy, please <a href="/contact" className="text-accent hover:underline">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}
