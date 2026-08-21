import { PageHeader } from '@/components/PageHeader';
import { Services } from '@/components/Services';

export function ServicesPage() {
  return (
    <>
      <PageHeader eyebrow="WHAT I DO" title="Services & expertise" />
      <Services />
    </>
  );
}
