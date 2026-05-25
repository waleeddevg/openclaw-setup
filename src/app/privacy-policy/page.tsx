import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Privacy Policy</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you make a purchase or contact us for support. This includes your email address, payment status (processed securely via Gumroad), and the VPS credentials necessary to perform the automated deployment.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
        <p>We use the information we collect strictly to provide and maintain our automated setup services, process transactions, and send related technical information or support responses.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">3. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access. VPS credentials provided to us are used strictly for the automated deployment script and are not stored permanently after the successful completion of the setup.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">4. Third-Party Services</h2>
        <p>We use Gumroad as our Merchant of Record. All payment processing is securely handled by Gumroad, and we do not store your credit card information on our servers. Please review Gumroad's privacy policy for details on how they handle your payment data.</p>
      </div>
    </div>
  );
}
