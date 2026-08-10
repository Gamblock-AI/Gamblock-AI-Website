import { ROUTES } from '@/routes';

export const SYSTEM_MISSION_COPY: Record<
  string,
  { labelKey: string; actionKey: string; href: string }
> = {
  active_protection_today: {
    labelKey: 'mission1',
    actionKey: 'mission1Action',
    href: ROUTES.DASHBOARD,
  },
  daily_check_in: {
    labelKey: 'mission2',
    actionKey: 'mission2Action',
    href: ROUTES.DASHBOARD,
  },
  education_section_today: {
    labelKey: 'mission3',
    actionKey: 'mission3Action',
    href: ROUTES.EDUCATION,
  },
  education_module_today: {
    labelKey: 'mission5',
    actionKey: 'mission5Action',
    href: ROUTES.EDUCATION,
  },
};
