import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Soccer Near Me",
  description: "Terms of service for Soccer Near Me — rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary mb-8">Terms of Service</h1>
      <div className="prose prose-sm text-gray-600 space-y-6">
        <p className="text-muted text-sm">Last updated: March 5, 2026</p>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using Soccer Near Me (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">2. Use of the Platform</h2>
          <p>Soccer Near Me is a directory platform that connects youth soccer players, parents, coaches, and organizations. You agree to use the Platform only for lawful purposes and in accordance with these Terms.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree not to submit false, misleading, or fraudulent information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">3. Listings</h2>
          <p>By creating a listing on the Platform, you represent that:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>You have the authority to create the listing on behalf of the organization or business.</li>
            <li>All information provided is accurate and up to date.</li>
            <li>You will keep your listing information current.</li>
          </ul>
          <p className="mt-2">We reserve the right to remove or modify any listing that violates these Terms or is deemed inappropriate.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">4. Donations & Payments</h2>
          <p>Donations made through the Platform are processed by Stripe. By making a donation:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>You acknowledge that a 10% platform fee is deducted from each donation.</li>
            <li>Donations are non-refundable unless required by law.</li>
            <li>Soccer Near Me is not responsible for how fundraiser organizers use the funds received.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">5. User Content</h2>
          <p>You retain ownership of content you submit to the Platform (photos, descriptions, etc.). By submitting content, you grant Soccer Near Me a non-exclusive, worldwide license to display and distribute that content in connection with the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">6. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Impersonating another person or organization.</li>
            <li>Posting spam, malware, or harmful content.</li>
            <li>Scraping or automated data collection without permission.</li>
            <li>Harassing, threatening, or abusing other users.</li>
            <li>Using the Platform for any illegal activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">7. Disclaimer of Warranties</h2>
          <p>The Platform is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy of listing information, the quality of services offered by listed organizations, or uninterrupted access to the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">8. Limitation of Liability</h2>
          <p>Soccer Near Me shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">9. Termination</h2>
          <p>We may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time through your dashboard.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">10. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary mt-8 mb-3">11. Contact</h2>
          <p>For questions about these Terms, please <a href="/contact" className="text-accent hover:underline">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}
