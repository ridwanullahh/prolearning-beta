import React from 'react';
import OnboardingForm from '../../components/learner/OnboardingForm';

const SettingsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <OnboardingForm />
    </div>
  );
};

export default SettingsPage;