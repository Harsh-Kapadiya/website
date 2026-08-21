import { Hero } from '@/components/Hero';
import { Work } from '@/components/Work';
import { Services } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { Skills } from '@/components/Skills';
import { CtaBanner } from '@/components/CtaBanner';

export function HomePage() {
  return (
    <>
      <Hero />
      <Work compact />
      <Services compact />
      <Testimonials />
      <Skills />
      <CtaBanner />
    </>
  );
}
