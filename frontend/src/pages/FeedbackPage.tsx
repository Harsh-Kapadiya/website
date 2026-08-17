import { PageHeader } from '@/components/PageHeader';
import { FeedbackForm } from '@/components/FeedbackForm';

export function FeedbackPage() {
  return (
    <>
      <PageHeader eyebrow="YOUR EXPERIENCE" title="Leave feedback" />
      <div className="bg-[#0a0a0a] px-8 md:px-12 pb-32">
        <div className="max-w-[560px] mx-auto">
          <p className="text-white/40 leading-relaxed mb-10" style={{ fontSize: '0.9375rem' }}>
            Worked with me on a project? I'd love to hear how it went — your feedback
            gets reviewed and, once approved, shown on the site.
          </p>
          <FeedbackForm />
        </div>
      </div>
    </>
  );
}
