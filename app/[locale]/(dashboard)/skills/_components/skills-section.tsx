import { useTranslations } from 'next-intl';
import { recoverySkills } from './skills';
import { SkillPractice } from './skill-practice';

export function SkillsSection() {
  const t = useTranslations('recoveryHub');
  const recoveryT = useTranslations('recoveryDashboard');

  return (
    <section aria-labelledby="recovery-skills-title">
      <div>
        <h2
          id="recovery-skills-title"
          className="text-navy text-2xl font-bold tracking-tight"
        >
          {t('skillsTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t('skillsDescription')}
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recoverySkills.map((skill) => (
          <SkillPractice
            key={skill.id}
            title={recoveryT(skill.title)}
            summary={recoveryT(skill.summary)}
            practice={recoveryT(skill.practice)}
            minutes={skill.minutes}
          />
        ))}
      </div>
    </section>
  );
}
