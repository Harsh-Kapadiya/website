import { Resume } from '@/components/Resume';
import { CtaBanner } from '@/components/CtaBanner';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ResumePage() {
  usePageMeta({
    title: 'Resume',
    description: "Harsh Kapadiya's resume — experience, education and skills in design and full-stack web development. Download the PDF.",
  });
  return (
    <>
      <Resume />
      <CtaBanner heading="Want to work" accent="together?" />
    </>
  );
}
