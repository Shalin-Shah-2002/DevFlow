import { CtaSection } from './components/CtaSection';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { Navbar } from './components/Navbar';
import { StatsSection } from './components/StatsSection';
import type { LandingPageData } from '../models/landing.model';

type LandingPageViewProps = {
  data: LandingPageData;
};

export const LandingPageView = ({ data }: LandingPageViewProps) => {
  return (
    <div className="landing-page">
      <Navbar nav={data.nav} />
      <HeroSection hero={data.hero} />
      <FeaturesSection features={data.features} />
      <HowItWorksSection steps={data.steps} />
      <StatsSection stats={data.stats} />
      <CtaSection cta={data.cta} />
      <Footer footer={data.footer} />
    </div>
  );
};
