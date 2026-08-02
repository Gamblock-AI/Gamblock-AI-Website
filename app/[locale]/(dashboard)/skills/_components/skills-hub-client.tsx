'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Save,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/common/native-select';
import { SkillsSection } from './skills-section';
import { useLearningHub, type LearningItem } from '@/hooks/use-learning-hub';

const kindKeys: Record<LearningItem['kind'], string> = {
  course: 'kindCourse',
  certification: 'kindCertification',
  learning_path: 'kindPath',
  mini_project: 'kindProject',
  career_snapshot: 'kindCareer',
  toolkit: 'kindToolkit',
  opportunity: 'kindOpportunity',
};

const goalKeys: Record<string, string> = {
  basics: 'goalBasics',
  career: 'goalCareer',
  portfolio: 'goalPortfolio',
  certification: 'goalCertification',
  exploration: 'goalExploration',
};

const difficultyKeys: Record<string, string> = {
  beginner: 'difficultyBeginner',
  intermediate: 'difficultyIntermediate',
  advanced: 'difficultyAdvanced',
};

function ItemCard({
  item,
  saving,
  onStart,
  onSave,
  onComplete,
}: {
  item: LearningItem;
  saving: boolean;
  onStart: () => void;
  onSave: () => void;
  onComplete: () => void;
}) {
  const t = useTranslations('skillsHub');
  const completed = item.progress?.state === 'completed';
  const started = item.progress?.state === 'started';
  const saved = item.progress?.state === 'saved';
  return (
    <article className="border-border bg-card shadow-soft flex min-h-[220px] flex-col rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.12em] uppercase">
            {t(kindKeys[item.kind])}
          </p>
          <h3 className="text-navy mt-2 text-base leading-6 font-bold">
            {item.title}
          </h3>
        </div>
        {completed ? (
          <CheckCircle2
            className="text-sage size-5 shrink-0"
            aria-label={t('completed')}
          />
        ) : null}
      </div>
      <p className="text-muted-foreground mt-3 flex-1 text-sm leading-6">
        {item.summary}
      </p>
      {item.outcomes?.[0] ? (
        <p className="text-navy/80 mt-3 text-xs leading-5">
          {item.outcomes[0]}
        </p>
      ) : null}
      <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {item.provider ? <span>{item.provider}</span> : null}
        {item.duration_minutes ? (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {item.duration_minutes} {t('minutes')}
          </span>
        ) : null}
        {item.cost ? (
          <span>
            {item.cost === 'free_or_audit'
              ? t('freeOrAudit')
              : item.cost === 'learning_free_exam_may_cost'
                ? t('learningFreeExamMayCost')
                : item.cost}
          </span>
        ) : null}
        {item.difficulty ? (
          <span>
            {t('difficulty')}:{' '}
            {t(difficultyKeys[item.difficulty] ?? 'difficultyIntermediate')}
          </span>
        ) : null}
        {item.language?.length ? (
          <span>
            {item.language
              .map((language) =>
                language === 'id'
                  ? t('languageID')
                  : language === 'en'
                    ? t('languageEN')
                    : language
              )
              .join(' / ')}
          </span>
        ) : null}
        {item.certificate ? (
          <span>
            {t('certificate')}:{' '}
            {item.certificate === 'provider_dependent'
              ? t('providerDependent')
              : item.certificate}
          </span>
        ) : null}
        {item.reviewed_at ? (
          <span>
            {t('reviewed')}: {item.reviewed_at}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!completed ? (
          <Button type="button" size="sm" disabled={saving} onClick={onStart}>
            {started ? t('continue') : t('start')}{' '}
            <ArrowRight className="size-3.5" />
          </Button>
        ) : null}
        {item.kind === 'mini_project' ||
        item.kind === 'course' ||
        item.kind === 'certification' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving || completed}
            onClick={onComplete}
          >
            {completed ? t('completed') : t('checkpoint')}{' '}
            <CheckCircle2 className="size-3.5" />
          </Button>
        ) : null}
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="border-border text-navy hover:bg-muted inline-flex min-h-9 items-center gap-1 rounded-md border px-3 text-xs font-semibold"
          >
            {t('openSource')}{' '}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{t('opensNewTab')}</span>
          </a>
        ) : null}
        {!completed && !started ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={saving || saved}
            onClick={onSave}
          >
            <Save className="size-3.5" />
            {saved ? t('saved') : t('save')}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function SkillsHubClient() {
  const t = useTranslations('skillsHub');
  const locale = useLocale();
  const hub = useLearningHub(locale);
  const [programSlug, setProgramSlug] = useState('');
  const [goal, setGoal] = useState('basics');
  const [kindFilter, setKindFilter] = useState<'all' | LearningItem['kind']>(
    'all'
  );
  const [timeFilter, setTimeFilter] = useState<'all' | '30' | '60' | '120'>(
    'all'
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'id' | 'en'>(
    'all'
  );
  const [costFilter, setCostFilter] = useState<
    'all' | 'free_or_audit' | 'learning_free_exam_may_cost'
  >('all');
  const [checkpointItem, setCheckpointItem] = useState<LearningItem | null>(
    null
  );
  const [checkpointNote, setCheckpointNote] = useState('');

  const selectedProgram = hub.catalog?.programs.find(
    (program) => program.slug === programSlug
  );
  const selectedGoal = t(goalKeys[goal] ?? goalKeys.basics);
  const visibleItems = useMemo(() => {
    if (!hub.catalog || !selectedProgram) return [];
    const goalOrder: Record<string, LearningItem['kind'][]> = {
      basics: [
        'learning_path',
        'course',
        'toolkit',
        'mini_project',
        'certification',
        'career_snapshot',
        'opportunity',
      ],
      career: [
        'career_snapshot',
        'certification',
        'learning_path',
        'course',
        'mini_project',
        'toolkit',
        'opportunity',
      ],
      portfolio: [
        'mini_project',
        'toolkit',
        'learning_path',
        'course',
        'certification',
        'career_snapshot',
        'opportunity',
      ],
      certification: [
        'certification',
        'course',
        'learning_path',
        'toolkit',
        'mini_project',
        'career_snapshot',
        'opportunity',
      ],
      exploration: [
        'career_snapshot',
        'learning_path',
        'course',
        'mini_project',
        'toolkit',
        'certification',
        'opportunity',
      ],
    };
    const order = goalOrder[goal] ?? goalOrder.basics;
    return [...hub.catalog.items]
      .filter((item) =>
        item.clusters?.includes(selectedProgram.primary_cluster_slug)
      )
      .filter((item) => kindFilter === 'all' || item.kind === kindFilter)
      .filter(
        (item) =>
          timeFilter === 'all' ||
          (item.duration_minutes ?? Number.POSITIVE_INFINITY) <=
            Number(timeFilter)
      )
      .filter(
        (item) =>
          difficultyFilter === 'all' || item.difficulty === difficultyFilter
      )
      .filter(
        (item) =>
          languageFilter === 'all' || item.language?.includes(languageFilter)
      )
      .filter((item) => costFilter === 'all' || item.cost === costFilter)
      .sort(
        (left, right) => order.indexOf(left.kind) - order.indexOf(right.kind)
      );
  }, [
    costFilter,
    difficultyFilter,
    goal,
    hub.catalog,
    kindFilter,
    languageFilter,
    selectedProgram,
    timeFilter,
  ]);

  const complete = async () => {
    if (!checkpointItem || !checkpointNote.trim()) return;
    await hub.checkpoint(
      checkpointItem.id,
      checkpointItem.kind === 'mini_project' ? '' : checkpointNote.trim(),
      checkpointItem.kind === 'mini_project' ? checkpointNote.trim() : ''
    );
    setCheckpointItem(null);
    setCheckpointNote('');
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={GraduationCap}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <SkillsSection />
      <section
        className="border-border bg-card shadow-soft rounded-2xl border p-5"
        aria-labelledby="learning-hub-selector-title"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="text-navy mt-1 size-5" aria-hidden="true" />
          <div>
            <h2
              id="learning-hub-selector-title"
              className="text-navy text-lg font-bold"
            >
              {t('selectorTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('selectorDescription')}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <NativeSelect
            aria-label={t('programLabel')}
            value={programSlug}
            onChange={(event) => setProgramSlug(event.target.value)}
          >
            <option value="" disabled>
              {t('programPlaceholder')}
            </option>
            {(hub.catalog?.programs ?? []).map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.degree} {program.name}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            aria-label={t('goalLabel')}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          >
            <option value="basics">{t('goalBasics')}</option>
            <option value="career">{t('goalCareer')}</option>
            <option value="portfolio">{t('goalPortfolio')}</option>
            <option value="certification">{t('goalCertification')}</option>
            <option value="exploration">{t('goalExploration')}</option>
          </NativeSelect>
          <NativeSelect
            aria-label={t('viewLabel')}
            value={kindFilter}
            onChange={(event) =>
              setKindFilter(event.target.value as typeof kindFilter)
            }
          >
            <option value="all">{t('viewAll')}</option>
            <option value="learning_path">{t('kindPath')}</option>
            <option value="course">{t('kindCourse')}</option>
            <option value="certification">{t('kindCertification')}</option>
            <option value="mini_project">{t('kindProject')}</option>
            <option value="career_snapshot">{t('kindCareer')}</option>
            <option value="toolkit">{t('kindToolkit')}</option>
          </NativeSelect>
          <NativeSelect
            aria-label={t('timeLabel')}
            value={timeFilter}
            onChange={(event) =>
              setTimeFilter(event.target.value as typeof timeFilter)
            }
          >
            <option value="all">{t('timeAll')}</option>
            <option value="30">{t('time30')}</option>
            <option value="60">{t('time60')}</option>
            <option value="120">{t('time120')}</option>
          </NativeSelect>
          <NativeSelect
            aria-label={t('difficultyLabel')}
            value={difficultyFilter}
            onChange={(event) =>
              setDifficultyFilter(event.target.value as typeof difficultyFilter)
            }
          >
            <option value="all">{t('difficultyAll')}</option>
            <option value="beginner">{t('difficultyBeginner')}</option>
            <option value="intermediate">{t('difficultyIntermediate')}</option>
            <option value="advanced">{t('difficultyAdvanced')}</option>
          </NativeSelect>
          <NativeSelect
            aria-label={t('languageLabel')}
            value={languageFilter}
            onChange={(event) =>
              setLanguageFilter(event.target.value as typeof languageFilter)
            }
          >
            <option value="all">{t('languageAll')}</option>
            <option value="id">{t('languageID')}</option>
            <option value="en">{t('languageEN')}</option>
          </NativeSelect>
          <NativeSelect
            aria-label={t('costLabel')}
            value={costFilter}
            onChange={(event) =>
              setCostFilter(event.target.value as typeof costFilter)
            }
          >
            <option value="all">{t('costAll')}</option>
            <option value="free_or_audit">{t('freeOrAudit')}</option>
            <option value="learning_free_exam_may_cost">
              {t('learningFreeExamMayCost')}
            </option>
          </NativeSelect>
        </div>
        {selectedProgram ? (
          <p className="text-muted-foreground mt-3 text-xs">
            {t('selectedProgram', {
              program: selectedProgram.name,
              goal: selectedGoal,
            })}
          </p>
        ) : null}
      </section>
      {hub.loading ? (
        <p className="text-muted-foreground text-sm">{t('loading')}</p>
      ) : null}
      {hub.error ? (
        <div className="border-amber/40 bg-amber/10 rounded-xl border p-4 text-sm">
          {t('error')}{' '}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => void hub.refetch()}
          >
            {t('retry')}
          </Button>
        </div>
      ) : null}
      {selectedProgram ? (
        <section aria-labelledby="learning-hub-results-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-bold tracking-[0.12em] uppercase">
                {t('resultsEyebrow')}
              </p>
              <h2
                id="learning-hub-results-title"
                className="text-navy mt-1 text-2xl font-bold"
              >
                {t('resultsTitle')}
              </h2>
            </div>
            <DashboardStatus tone="sage">
              {visibleItems.length} {t('items')}
            </DashboardStatus>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                saving={hub.savingID === item.id}
                onStart={() =>
                  void hub
                    .updateState(item.id, 'started')
                    .catch(() => undefined)
                }
                onSave={() =>
                  void hub.updateState(item.id, 'saved').catch(() => undefined)
                }
                onComplete={() => {
                  setCheckpointItem(item);
                  setCheckpointNote('');
                }}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="border-border bg-muted/30 text-muted-foreground rounded-2xl border p-6 text-center text-sm">
          {t('choosePrompt')}
        </div>
      )}
      <Dialog
        open={checkpointItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCheckpointItem(null);
            setCheckpointNote('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {t('checkpointTitle')}
            </DialogTitle>
            <p className="text-muted-foreground text-sm leading-6">
              {checkpointItem?.title ?? ''}
            </p>
          </DialogHeader>
          <label className="text-navy grid gap-2 text-sm font-semibold">
            {t('reflectionLabel')}
            <Textarea
              value={checkpointNote}
              onChange={(event) => setCheckpointNote(event.target.value)}
              maxLength={2000}
              placeholder={t('reflectionPrompt')}
            />
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCheckpointItem(null);
                setCheckpointNote('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              disabled={
                !checkpointNote.trim() || hub.savingID === checkpointItem?.id
              }
              onClick={() => void complete().catch(() => undefined)}
            >
              {t('completeCheckpoint')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}
