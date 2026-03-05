import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundraiser Terms & Conditions | Soccer Near Me",
  description: "Terms and conditions for creating and donating to fundraisers on Soccer Near Me.",
};

export default function FundraiserTermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary mb-2">
        Fundraiser Terms &amp; Conditions
      </h1>
      <p className="text-muted text-sm mb-8">Last updated: March 4, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-primary/90">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">1. Overview</h2>
          <p>
            Soccer Near Me (&ldquo;Platform&rdquo;), operated by Anytime Soccer Training LLC, provides a fundraising feature
            that allows registered users (&ldquo;Fundraiser Creators&rdquo;) to create fundraising pages and accept donations
            from supporters (&ldquo;Donors&rdquo;). By creating a fundraiser or making a donation, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">2. Platform Role</h2>
          <p>
            Soccer Near Me acts solely as a technology platform that facilitates fundraising. We are not the organizer,
            beneficiary, or guarantor of any fundraiser. We do not verify how funds are ultimately used by Fundraiser Creators.
            All donations are made at the Donor&rsquo;s own discretion and risk.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">3. Payment Processing &amp; Fees</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All donations are processed securely through <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover">Stripe</a>, a PCI-compliant payment processor.</li>
            <li>A <strong>10% platform fee</strong> is deducted from each donation. The remaining 90% is distributed to the Fundraiser Creator.</li>
            <li>Standard Stripe processing fees may also apply and are included in the donation amount.</li>
            <li>Donation amounts must be between <strong>$5 and $500</strong> per transaction.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">4. Tax Information</h2>
          <p>
            Donations made through Soccer Near Me are <strong>not tax-deductible</strong>. Soccer Near Me and Anytime Soccer
            Training LLC are not registered 501(c)(3) organizations. Fundraiser Creators are responsible for reporting any
            funds received as income in accordance with applicable tax laws. Donors should not claim donations as charitable
            contributions on their tax returns.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">5. Fundraiser Creator Responsibilities</h2>
          <p>By creating a fundraiser, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and truthful information about the purpose of your fundraiser.</li>
            <li>Use all funds received for the stated purpose of the fundraiser.</li>
            <li>Comply with all applicable local, state, and federal laws related to fundraising and the receipt of funds.</li>
            <li>Report any funds received as income as required by tax authorities.</li>
            <li>Not use the platform for fraudulent, illegal, or misleading fundraising activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">6. Donor Acknowledgment</h2>
          <p>By making a donation, you acknowledge and agree that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your donation is voluntary and made at your own discretion.</li>
            <li>You have no guarantee that funds will be used for the stated purpose.</li>
            <li>Donations are <strong>not tax-deductible</strong>.</li>
            <li>Your name and donation amount may be publicly displayed on the fundraiser page unless otherwise noted.</li>
            <li>Your email address will be used for donation confirmation and may be shared with the Fundraiser Creator.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">7. Refund Policy</h2>
          <p>
            Donations are generally <strong>non-refundable</strong>. In cases of suspected fraud or unauthorized charges,
            Donors may contact us at{" "}
            <a href="mailto:megan@anytime-soccer.com" className="text-accent hover:text-accent-hover">megan@anytime-soccer.com</a>{" "}
            and we will review the situation on a case-by-case basis. Donors may also dispute charges directly with their
            bank or credit card company.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">8. Prohibited Activities</h2>
          <p>The following activities are prohibited and may result in removal of your fundraiser and/or account:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Creating fraudulent or misleading fundraisers.</li>
            <li>Misrepresenting the intended use of funds.</li>
            <li>Using the platform for personal enrichment under false pretenses.</li>
            <li>Violating any applicable laws or regulations.</li>
            <li>Creating fundraisers for illegal activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">9. Privacy</h2>
          <p>
            We collect Donor names, email addresses, and donation amounts to process transactions and display supporter
            information on fundraiser pages. This data may be shared with the Fundraiser Creator. We do not sell personal
            information to third parties. Payment information is handled securely by Stripe and is never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">10. Limitation of Liability</h2>
          <p>
            Soccer Near Me and Anytime Soccer Training LLC shall not be liable for any disputes between Donors and Fundraiser
            Creators, the misuse of funds by Fundraiser Creators, any losses resulting from donations, or the accuracy of
            information provided by Fundraiser Creators. The Platform is provided &ldquo;as is&rdquo; without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">11. Right to Remove</h2>
          <p>
            We reserve the right to remove any fundraiser, withhold funds, or terminate any account at our sole discretion
            if we believe these terms have been violated or if a fundraiser appears fraudulent or harmful.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">12. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the fundraising feature after changes are posted
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mt-8 mb-3">13. Contact</h2>
          <p>
            For questions about these terms, fundraiser disputes, or refund requests, contact us at:{" "}
            <a href="mailto:megan@anytime-soccer.com" className="text-accent hover:text-accent-hover">megan@anytime-soccer.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
