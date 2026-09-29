import { Work } from '@/components/Work';
import { CtaBanner } from '@/components/CtaBanner';
import { usePageMeta } from '@/hooks/usePageMeta';

export function WorkPage() {
  usePageMeta({
    title: 'Work & case studies',
    description: 'Selected projects by Harsh Kapadiya — brand identity, web design, product design and web apps, each with a case study on the challenge, solution and results.',
  });
  return (
    <>
      <Work page />
      <CtaBanner heading="Like what you see?" accent="Let's build yours." />
    </>
  );
}
