import React from 'react';
import AIGuidelinesManager from '@/components/admin/AIGuidelinesManager';

const AIGuidelinesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Content Guidelines</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage AI content generation guidelines to ensure appropriate and compliant content creation.
        </p>
      </div>
      
      <AIGuidelinesManager />
    </div>
  );
};

export default AIGuidelinesPage;
