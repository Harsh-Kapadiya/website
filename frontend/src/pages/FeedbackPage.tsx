import { PageHeader } from '@/components/PageHeader';
import { FeedbackForm } from '@/components/FeedbackForm';
import { usePageMeta } from '@/hooks/usePageMeta';

export function FeedbackPage() {
  usePageMeta({
    title: 'Leave a review',
    description: 'Worked with Harsh Kapadiya? Share your experience — reviews are checked before they appear on the site.',
  });
  return (
    <>
      <PageHeader eyebrow="YOUR EXPERIENCE" title="Leave a review" intro="Worked with me on a project? I'd love to hear how it went. Every review is read before it appears on the site." />
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[560px]">
            <FeedbackForm />
          </div>
        </div>
      </section>
    </>
  );
}
