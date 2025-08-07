import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/instructor/apply/HeroSection';
import WhyProLearning from '@/components/instructor/apply/WhyProLearning';
import Monetize from '@/components/instructor/apply/Monetize';
import WhoWeWant from '@/components/instructor/apply/WhoWeWant';
import PartnershipPath from '@/components/instructor/apply/PartnershipPath';
import Toolkit from '@/components/instructor/apply/Toolkit';
import GrowthPartnership from '@/components/instructor/apply/GrowthPartnership';
import Community from '@/components/instructor/apply/Community';
import FAQ from '@/components/instructor/apply/FAQ';
import FinalCTA from '@/components/instructor/apply/FinalCTA';

const BecomeInstructorPage = () => {
  return (
    <div className="bg-white dark:bg-gray-950">
      <SmartHeader />
      <main>
        <HeroSection />
        <WhyProLearning />
        <Monetize />
        <WhoWeWant />
        <PartnershipPath />
        <Toolkit />
        <GrowthPartnership />
        <Community />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default BecomeInstructorPage;