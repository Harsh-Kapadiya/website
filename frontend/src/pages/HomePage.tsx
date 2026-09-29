import { Hero } from '@/components/Hero';
import { Work } from '@/components/Work';
import { Services } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { Skills } from '@/components/Skills';
import { CtaBanner } from '@/components/CtaBanner';
import { usePageMeta } from '@/hooks/usePageMeta';

export function HomePage() {
  usePageMeta({
    title: '',
    description: 'Harsh Kapadiya is a full-stack web developer and designer building fast, beautiful React, TypeScript and Node.js products. See case studies, services and get in touch.',
  });
  return (
    <>
      <Hero />
      <Work />
      <Services />
      <Testimonials />
      <Skills />
      <CtaBanner />
    </>
  );
}
