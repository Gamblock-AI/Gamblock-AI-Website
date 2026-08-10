export interface TourStep {
  /** The `data-tour` selector of the highlighted element. */
  target: string;
  titleKey: string;
  bodyKey: string;
}

/** Student dashboard tour on desktop (sidebar + top navbar visible). */
export const desktopTourSteps: TourStep[] = [
  { target: 'tour-welcome', titleKey: 'welcomeTitle', bodyKey: 'welcomeBody' },
  { target: 'tour-summary', titleKey: 'summaryTitle', bodyKey: 'summaryBody' },
  { target: 'tour-weekly', titleKey: 'weeklyTitle', bodyKey: 'weeklyBody' },
  {
    target: 'tour-protection',
    titleKey: 'protectionTitle',
    bodyKey: 'protectionBody',
  },
  { target: 'tour-fab', titleKey: 'fabTitle', bodyKey: 'fabBody' },
  {
    target: 'tour-sidebar-today',
    titleKey: 'sidebarTodayTitle',
    bodyKey: 'sidebarTodayBody',
  },
  {
    target: 'tour-sidebar-support',
    titleKey: 'sidebarSupportTitle',
    bodyKey: 'sidebarSupportBody',
  },
  { target: 'tour-search', titleKey: 'searchTitle', bodyKey: 'searchBody' },
  {
    target: 'tour-navbar-extra',
    titleKey: 'navbarExtraTitle',
    bodyKey: 'navbarExtraBody',
  },
  {
    target: 'tour-profile',
    titleKey: 'profileTitle',
    bodyKey: 'profileBody',
  },
];

/** Student dashboard tour on small screens (bottom navigation instead of sidebar). */
export const mobileTourSteps: TourStep[] = [
  { target: 'tour-welcome', titleKey: 'welcomeTitle', bodyKey: 'welcomeBody' },
  { target: 'tour-summary', titleKey: 'summaryTitle', bodyKey: 'summaryBody' },
  { target: 'tour-weekly', titleKey: 'weeklyTitle', bodyKey: 'weeklyBody' },
  {
    target: 'tour-protection',
    titleKey: 'protectionTitle',
    bodyKey: 'protectionBody',
  },
  { target: 'tour-fab', titleKey: 'fabTitle', bodyKey: 'fabBody' },
  {
    target: 'tour-mobile-primary',
    titleKey: 'mobilePrimaryTitle',
    bodyKey: 'mobilePrimaryBody',
  },
  {
    target: 'tour-mobile-more',
    titleKey: 'mobileMoreTitle',
    bodyKey: 'mobileMoreBody',
  },
  {
    target: 'tour-profile',
    titleKey: 'profileTitle',
    bodyKey: 'profileBody',
  },
];

/** Partner dashboard tour on desktop (sidebar + top navbar visible). */
export const partnerDesktopTourSteps: TourStep[] = [
  {
    target: 'tour-partner-summary',
    titleKey: 'summaryTitle',
    bodyKey: 'summaryBody',
  },
  {
    target: 'tour-partner-filters',
    titleKey: 'filtersTitle',
    bodyKey: 'filtersBody',
  },
  {
    target: 'tour-partner-table',
    titleKey: 'tableTitle',
    bodyKey: 'tableBody',
  },
  {
    target: 'tour-partner-analytics',
    titleKey: 'analyticsTitle',
    bodyKey: 'analyticsBody',
  },
  {
    target: 'tour-sidebar-today',
    titleKey: 'sidebarTodayTitle',
    bodyKey: 'sidebarTodayBody',
  },
  {
    target: 'tour-sidebar-support',
    titleKey: 'sidebarSupportTitle',
    bodyKey: 'sidebarSupportBody',
  },
  { target: 'tour-search', titleKey: 'searchTitle', bodyKey: 'searchBody' },
  {
    target: 'tour-profile',
    titleKey: 'profileTitle',
    bodyKey: 'profileBody',
  },
];

/** Partner dashboard tour on small screens (bottom navigation instead of sidebar). */
export const partnerMobileTourSteps: TourStep[] = [
  {
    target: 'tour-partner-summary',
    titleKey: 'summaryTitle',
    bodyKey: 'summaryBody',
  },
  {
    target: 'tour-partner-filters',
    titleKey: 'filtersTitle',
    bodyKey: 'filtersBody',
  },
  {
    target: 'tour-partner-table',
    titleKey: 'tableTitle',
    bodyKey: 'tableBody',
  },
  {
    target: 'tour-mobile-primary',
    titleKey: 'mobilePrimaryTitle',
    bodyKey: 'mobilePrimaryBody',
  },
  {
    target: 'tour-mobile-more',
    titleKey: 'mobileMoreTitle',
    bodyKey: 'mobileMoreBody',
  },
  {
    target: 'tour-profile',
    titleKey: 'profileTitle',
    bodyKey: 'profileBody',
  },
];

/** Admin dashboard tour on desktop (sidebar + top navbar visible). */
export const adminDesktopTourSteps: TourStep[] = [
  { target: 'tour-admin-welcome', titleKey: 'welcomeTitle', bodyKey: 'welcomeBody' },
  { target: 'tour-admin-attention', titleKey: 'attentionTitle', bodyKey: 'attentionBody' },
  { target: 'tour-admin-workspaces', titleKey: 'workspacesTitle', bodyKey: 'workspacesBody' },
  { target: 'tour-admin-analytics', titleKey: 'analyticsTitle', bodyKey: 'analyticsBody' },
  { target: 'tour-sidebar-operations', titleKey: 'sidebarOperationsTitle', bodyKey: 'sidebarOperationsBody' },
  { target: 'tour-sidebar-today', titleKey: 'sidebarTodayTitle', bodyKey: 'sidebarTodayBody' },
  { target: 'tour-search', titleKey: 'searchTitle', bodyKey: 'searchBody' },
  { target: 'tour-navbar-extra', titleKey: 'navbarExtraTitle', bodyKey: 'navbarExtraBody' },
  { target: 'tour-profile', titleKey: 'profileTitle', bodyKey: 'profileBody' },
];

/** Admin dashboard tour on small screens (bottom navigation instead of sidebar). */
export const adminMobileTourSteps: TourStep[] = [
  { target: 'tour-admin-welcome', titleKey: 'welcomeTitle', bodyKey: 'welcomeBody' },
  { target: 'tour-admin-attention', titleKey: 'attentionTitle', bodyKey: 'attentionBody' },
  { target: 'tour-admin-workspaces', titleKey: 'workspacesTitle', bodyKey: 'workspacesBody' },
  { target: 'tour-admin-analytics', titleKey: 'analyticsTitle', bodyKey: 'analyticsBody' },
  { target: 'tour-mobile-primary', titleKey: 'mobilePrimaryTitle', bodyKey: 'mobilePrimaryBody' },
  { target: 'tour-mobile-more', titleKey: 'mobileMoreTitle', bodyKey: 'mobileMoreBody' },
  { target: 'tour-profile', titleKey: 'profileTitle', bodyKey: 'profileBody' },
];
