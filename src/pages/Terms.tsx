import React from 'react';
import { LegalLayout } from '../components/LegalLayout';

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <div className="prose max-w-none">
        <p className="text-sm text-gray-500 mb-6">Effective Date: February 22, 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to Boomlify.com. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). 
          If you do not agree with any part of these Terms, please do not use our service.
        </p>

        <h2>2. Use of Service</h2>
        <h3>Permitted Use</h3>
        <p>
          Boomlify.com provides a free, temporary email service designed solely for receiving emails. Each disposable email address is valid for up to 2 months.
        </p>
        <h3>Prohibited Use</h3>
        <p>You agree to refrain from:</p>
        <ul>
          <li>Sending unsolicited or spam emails</li>
          <li>Engaging in any illegal or unauthorized activities</li>
          <li>Attempting to compromise the security or integrity of our service</li>
          <li>Interfering with the use or enjoyment of our service by other users</li>
        </ul>

        <h2>3. Termination</h2>
        <p>
          We reserve the right, in our sole discretion, to suspend or terminate your access to the service for any breach of these Terms without prior notice. 
          Inactive accounts may be removed after extended periods.
        </p>

        <h2>4. Limitation of Liability</h2>
        <p>
          Our service is provided on an "as is" and "as available" basis without any warranties, either express or implied. 
          Boomlify.com shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, 
          including but not limited to data loss, service interruptions, or misuse of the service.
        </p>

        <h2>5. Modifications to the Terms</h2>
        <p>
          We may update these Terms at any time. All changes will be posted on this page with an updated effective date. 
          Your continued use of the service following the posting of any changes constitutes your acceptance of the revised Terms.
        </p>

        <h2>6. Refund Policy</h2>
        <p>
          At <strong>Boomlify.com</strong>, we strive to provide high-quality services and customer satisfaction. If you are not satisfied with your purchase, 
          we offer a fair and transparent refund policy under the following conditions:
        </p>

        <h3>6.1 Eligibility for Refund</h3>
        <p>You may request a refund under the following circumstances:</p>
        <ul>
          <li><strong>Service Malfunction:</strong> If our service fails to function as described and our support team is unable to resolve the issue.</li>
          <li><strong>Billing Errors:</strong> If you were mistakenly charged due to a system error or duplicate transaction.</li>
          <li><strong>Cancellation within Trial or Initial Period:</strong> If applicable, refunds may be granted if a cancellation request is made within the first <strong>14 days</strong> of the subscription.</li>
        </ul>

        <h3>6.2 Non-Refundable Cases</h3>
        <p>We do not provide refunds in the following situations:</p>
        <ul>
          <li><strong>User Error:</strong> If the service was purchased by mistake, or you changed your mind after purchase.</li>
          <li><strong>Violation of Terms of Service:</strong> If your account was suspended or terminated due to a violation of our Terms & Conditions.</li>
          <li><strong>Used Subscription:</strong> If a substantial portion of the service period has already been utilized.</li>
        </ul>

        <h3>6.3 How to Request a Refund</h3>
        <p>
          To request a refund, please contact our support team at <a href="mailto:support@boomlify.com" className="text-[#4A90E2]">support@boomlify.com</a> with:
        </p>
        <ul>
          <li>Your order ID</li>
          <li>A brief explanation of the issue</li>
          <li>Any relevant screenshots or proof of the issue</li>
        </ul>
        <p>Refund requests will be reviewed within <strong>5-7 business days</strong>, and if approved, the refund will be processed to the original payment method within <strong>10 business days</strong>.</p>

        <h3>6.4 Subscription Cancellations</h3>
        <p>
          If you no longer wish to continue using our service, you may cancel your subscription at any time. 
          However, cancellation does not automatically qualify for a refund unless it meets the conditions outlined above.
        </p>

        <h2>7. Company Information</h2>
        <p>
          This website is operated by <strong>Jesmin LLC</strong>.
          <br />
          <strong>Registered Office Address:</strong>
          <br />
          5900 Balcones Dr, Ste 13356,
          <br />
          Austin, TX 78731.
        </p>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            For any inquiries regarding these Terms, please contact us at{' '}
            <a href="mailto:legal@boomlify.com" className="text-[#4A90E2]">
              support@boomlify.com
            </a>.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
