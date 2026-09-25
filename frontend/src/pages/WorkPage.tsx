import { PageHeader } from '@/components/PageHeader';
import { Work } from '@/components/Work';

export function WorkPage() {
  return (
    <>
      <PageHeader eyebrow="SELECTED WORK" title="Projects I'm proud of" />
      <Work />
    </>
  );
}
