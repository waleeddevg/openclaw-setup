import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Terms of Service</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
        <p>By accessing and using ClawSetup AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">2. Service Description</h2>
        <p>ClawSetup AI provides automated VPS deployment and AI setup services. We execute scripts to install required software on the server details provided by you. We are not responsible for the content hosted on your VPS after the deployment is completed.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">3. User Responsibilities</h2>
        <p>You must provide accurate and valid VPS credentials for the deployment to succeed. You are solely responsible for maintaining the security of your server post-deployment and ensuring your server meets the minimum requirements.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">4. Modifications to Service</h2>
        <p>We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.</p>
      </div>
    </div>
  );
}
