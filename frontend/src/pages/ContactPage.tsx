import { Contact } from '@/components/Contact';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Start a project with Harsh Kapadiya. Send a message about your website, product or brand — I reply within 24 hours.',
  });
  return <Contact />;
}
