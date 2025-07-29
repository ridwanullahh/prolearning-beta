import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/about/HeroSection';
import Philosophy from '@/components/about/Philosophy';
import Technology from '@/components/about/Technology';
import Commitment from '@/components/about/Commitment';
import JoinMovement from '@/components/about/JoinMovement';

const AboutPage = () => {
  return (
    <div className="bg-white dark:bg-gray-950">
      <Header />
      <main>
        <HeroSection />
        <Philosophy />
        <Technology />
        <Commitment />
        <JoinMovement />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;