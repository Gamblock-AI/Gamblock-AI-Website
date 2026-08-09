import { Suspense } from 'react';
import { EducationLibraryClient } from './_components/education-library-client';

export default function EducationPage() {
  return (
    <Suspense fallback={null}>
      <EducationLibraryClient />
    </Suspense>
  );
}
