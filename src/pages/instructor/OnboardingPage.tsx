import React from 'react';
import OnboardingForm from '../../components/instructor/OnboardingForm';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const InstructorOnboardingPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'instructor' || user.onboardingCompleted) {
    return <Navigate to="/instruct" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Instructor Onboarding</h1>
      <p className="text-lg text-gray-600 mb-8">
        Complete your profile to start teaching on our platform.
      </p>
      <OnboardingForm />
    </div>
  );
};

export default InstructorOnboardingPage;