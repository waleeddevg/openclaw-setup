import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Refund Policy</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">1. Free Public Beta</h2>
        <p>ClawSetup AI is currently in a 100% Free Public Beta. No payment is required to use the service. As there are no charges, traditional monetary refunds are not applicable during this period.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">2. Failed Deployments</h2>
        <p>If our automated system fails to deploy OpenClaw on your provided VPS due to a bug in our script or an error on our end, and our support team cannot resolve it within 48 hours, we will prioritize re-running your deployment at no cost.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8">3. User Errors</h2>
        <p>Support assistance cannot be guaranteed under the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The deployment fails due to incorrect VPS credentials provided by the user.</li>
          <li>The provided server does not meet the minimum hardware or OS requirements (Ubuntu 22.04+, 2 vCPU, 2GB RAM).</li>
          <li>The user's VPS provider blocks outbound connections required during installation.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-white mt-8">4. How to Get Support</h2>
        <p>If your deployment fails or you have an issue, please contact our support team with your registered email address and the deployment log output from your dashboard. We'll investigate and re-run the deployment if necessary.</p>
      </div>
    </div>
  );
}
