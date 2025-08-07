import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import ValueProposition from '@/components/landing/ValueProposition';
import HowItWorks from '@/components/landing/HowItWorks';
import PersonalizedLearning from '@/components/landing/PersonalizedLearning';
import Toolkit from '@/components/landing/Toolkit';
import BeyondMemorization from '@/components/landing/BeyondMemorization';
import ForEveryLearner from '@/components/landing/ForEveryLearner';
import Commitment from '@/components/landing/Commitment';
import CTA from '@/components/landing/CTA';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';

const LandingPage: React.FC = () => {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
			<SmartHeader />
			<main className="flex-1">
				<HeroSection />
				<ValueProposition />
				<HowItWorks />
				<PersonalizedLearning />
				<Toolkit />
				<BeyondMemorization />
				<ForEveryLearner />
				<Commitment />
				<CTA />
			</main>
			<Footer />
		</div>
	);
};

export default LandingPage;
