import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Refund Policy</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">1. Digital Services Nature</h2>
        <p>Since ClawSetup AI provides digital and automated setup services (execution of deployment scripts), our refund policy is strictly defined. Once a deployment has been successfully completed on your VPS, we generally do not offer refunds due to the irreversible nature of server configuration work.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">2. Eligible Refunds (Failed Deployments)</h2>
        <p>If our automated system fails to deploy the software on your provided VPS due to an error on our end or a bug in our script, and our support team cannot resolve it within 48 hours, you are entitled to a full refund.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">3. Non-Refundable Situations (User Errors)</h2>
        <p>Refunds will not be issued under the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The deployment fails due to incorrect VPS credentials provided by the user.</li>
          <li>The provided server does not meet the minimum hardware or OS requirements.</li>
          <li>The user decides to cancel the service after the deployment process has already initiated or completed.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-white mt-8">4. How to Request a Refund</h2>
        <p>To request a refund under the eligible conditions, please contact our support team. Make sure to provide your Gumroad purchase receipt and the exact error or issue you are facing.</p>
      </div>
    </div>
  );
}
