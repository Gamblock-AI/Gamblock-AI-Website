'use client';

import { useState } from 'react';
import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import type {
  EducationCheckResult,
  EducationKnowledgeCheck,
} from '@/hooks/use-education';
import { Button } from '@/components/ui/button';

export function KnowledgeCheck({
  check,
  completed,
  labels,
  onAnswer,
}: {
  check: EducationKnowledgeCheck;
  completed: boolean;
  labels: {
    eyebrow: string;
    submit: string;
    correct: string;
    incorrect: string;
    completed: string;
  };
  onAnswer: (choiceID: string) => Promise<EducationCheckResult>;
}) {
  const [choice, setChoice] = useState('');
  const [result, setResult] = useState<EducationCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <aside className="mt-7 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-blue-700 uppercase">
        <CircleHelp className="size-4" aria-hidden="true" />
        {labels.eyebrow}
      </p>
      <h3 className="text-navy mt-3 text-base leading-7 font-bold">
        {check.question}
      </h3>
      <fieldset className="mt-4 space-y-2" disabled={completed || submitting}>
        <legend className="sr-only">{check.question}</legend>
        {check.choices.map((option) => (
          <label
            key={option.id}
            className="border-border bg-card text-navy flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 has-checked:border-blue-600 has-checked:ring-2 has-checked:ring-blue-600/15"
          >
            <input
              type="radio"
              name={check.id}
              value={option.id}
              checked={choice === option.id}
              onChange={(event) => setChoice(event.target.value)}
              className="mt-1 accent-blue-700"
            />
            {option.text}
          </label>
        ))}
      </fieldset>
      {result ? (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${result.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}
          role="status"
        >
          {result.correct ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <div>
            <strong>
              {result.correct ? labels.correct : labels.incorrect}
            </strong>
            {result.explanation ? (
              <p className="mt-1 leading-6">{result.explanation}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      {completed ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="size-4" />
          {labels.completed}
        </p>
      ) : (
        <Button
          type="button"
          className="mt-4 min-h-11"
          disabled={!choice || submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              setResult(await onAnswer(choice));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {labels.submit}
        </Button>
      )}
    </aside>
  );
}
