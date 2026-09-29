import { Services } from '@/components/Services';
import { Skills } from '@/components/Skills';
import { CtaBanner } from '@/components/CtaBanner';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ServicesPage() {
  usePageMeta({
    title: 'Services',
    description: 'Brand identity, web design, product design and motion work by Harsh Kapadiya — end-to-end design and development for startups and ambitious brands.',
  });
  return (
    <>
      <Services page />
      <Skills />
      <CtaBanner />
    </>
  );
}
