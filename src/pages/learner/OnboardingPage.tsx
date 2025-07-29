import React from 'react';
import OnboardingForm from '../../components/learner/OnboardingForm';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const LearnerOnboardingPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'learner' || user.onboardingCompleted) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Pro-Learning!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Let's personalize your learning experience.
      </p>
      <OnboardingForm />
    </div>
  );
};

export default LearnerOnboardingPage;