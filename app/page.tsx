import { auth } from '@/lib/auth/auth/auth';
import { SiteHeader } from '@/components/homepage/siteHeader/SiteHeader';
import { HeroSection } from '@/components/homepage/sections/HeroSection';
import { TrustedStrip } from '@/components/homepage/sections/TrustedStrip';
import { FeaturesSection } from '@/components/homepage/sections/FeaturesSection';
import { AiSection } from '@/components/homepage/sections/AiSection';
import { PricingSection } from '@/components/homepage/sections/PricingSection';
import { CtaSection } from '@/components/homepage/sections/CtaSection';
import { Footer } from '@/components/homepage/sections/Footer';

export const metadata = {
  title: 'DevStash: Stop Losing Your Developer Knowledge',
  description:
    'DevStash is the developer knowledge hub for code snippets, AI prompts, commands, notes, files, images, and links. Stop scattering, start organizing.',
};

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative">
      <main className="relative z-10">
        <SiteHeader isAuthenticated={!!session?.user} />
        <HeroSection />
        <TrustedStrip />
        <FeaturesSection />
        <AiSection />
        <PricingSection />
        <CtaSection />
        <Footer />
      </main>
    </div>
  );
}
