import { Suspense } from 'react';
import { SkillsHubClient } from './_components/skills-hub-client';

export default function SkillsPage() {
  return (
    <Suspense fallback={null}>
      <SkillsHubClient />
    </Suspense>
  );
}
