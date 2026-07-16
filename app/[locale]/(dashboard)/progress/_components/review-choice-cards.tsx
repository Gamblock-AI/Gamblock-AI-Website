import { CircleHelp, Footprints, Pause, TimerReset, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RadioCardOption } from '@/components/common/radio-card-option';
import { Card } from '@/components/ui/card';
import type {
  RecoveryIntention,
  WeeklyHelpfulAction,
} from '@/lib/recovery/types';
import type { IntentionChoice } from './review-utils';

interface ReviewChoiceCardsProps {
  activeIntention: RecoveryIntention | null;
  helpfulAction: WeeklyHelpfulAction | null;
  intentionChoice: IntentionChoice;
  onHelpfulActionChange: (value: WeeklyHelpfulAction) => void;
  onIntentionChoiceChange: (value: IntentionChoice) => void;
}

export function ReviewChoiceCards({
  activeIntention,
  helpfulAction,
  intentionChoice,
  onHelpfulActionChange,
  onIntentionChoiceChange,
}: ReviewChoiceCardsProps) {
  const t = useTranslations('weeklyReview');

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <fieldset>
          <legend className="text-navy text-lg font-bold tracking-tight">
            {t('helpfulTitle')}
          </legend>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('helpfulDescription')}
          </p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <RadioCardOption
              name="helpful-action"
              value="pause"
              selected={helpfulAction === 'pause'}
              label={t('helpfulPause')}
              icon={TimerReset}
              onSelect={onHelpfulActionChange}
            />
            <RadioCardOption
              name="helpful-action"
              value="trusted_person"
              selected={helpfulAction === 'trusted_person'}
              label={t('helpfulPartner')}
              icon={Users}
              onSelect={onHelpfulActionChange}
            />
            <RadioCardOption
              name="helpful-action"
              value="walk"
              selected={helpfulAction === 'walk'}
              label={t('helpfulWalk')}
              icon={Footprints}
              onSelect={onHelpfulActionChange}
            />
            <RadioCardOption
              name="helpful-action"
              value="unsure"
              selected={helpfulAction === 'unsure'}
              label={t('helpfulUnknown')}
              icon={CircleHelp}
              onSelect={onHelpfulActionChange}
            />
          </div>
          {helpfulAction === 'unsure' ? (
            <p className="text-muted-foreground mt-3 text-xs leading-5">
              {t('helpfulUnknownHint')}
            </p>
          ) : null}
        </fieldset>
      </Card>
      <Card className="p-5 sm:p-6">
        <fieldset>
          <legend className="text-navy text-lg font-bold tracking-tight">
            {t('intentionTitle')}
          </legend>
          {activeIntention ? (
            <p className="text-foreground mt-2 text-sm leading-6 font-semibold">
              {activeIntention.title}
            </p>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t('intentionEmpty')}
            </p>
          )}
          {activeIntention ? (
            <div className="mt-5 grid gap-2.5">
              <RadioCardOption
                name="intention-choice"
                value="keep"
                selected={intentionChoice === 'keep'}
                label={t('intentionKeep')}
                onSelect={onIntentionChoiceChange}
              />
              <RadioCardOption
                name="intention-choice"
                value="adjust"
                selected={intentionChoice === 'adjust'}
                label={t('intentionAdjust')}
                onSelect={onIntentionChoiceChange}
              />
              <RadioCardOption
                name="intention-choice"
                value="pause"
                selected={intentionChoice === 'pause'}
                label={t('intentionPause')}
                icon={Pause}
                onSelect={onIntentionChoiceChange}
              />
            </div>
          ) : null}
        </fieldset>
      </Card>
    </div>
  );
}
