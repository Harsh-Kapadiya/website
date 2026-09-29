import { About } from '@/components/About';
import { Testimonials } from '@/components/Testimonials';
import { CtaBanner } from '@/components/CtaBanner';
import { usePageMeta } from '@/hooks/usePageMeta';

export function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'About Harsh Kapadiya — a multidisciplinary designer and full-stack developer working at the intersection of aesthetics and engineering.',
  });
  return (
    <>
      <About />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
