import React from 'react';

const PendingApprovalPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Application Pending Review</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your instructor application has been submitted and is currently under review. 
        You will receive an email notification once your application has been approved.
      </p>
    </div>
  );
};

export default PendingApprovalPage;