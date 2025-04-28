export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'Main App',
    title: 'Main App',
    type: 'group',
    icon: 'icon-charts',
    children: [
      {
        id: 'Jobs',
        title: 'Jobs',
        type: 'collapse',
        icon: 'feather icon-briefcase',
        children: [
          {
            id: 'Daily Board',
            title: 'Daily Board',
            type: 'item',
            url: 'daily-board',
          },
          {
            id: 'All Jobs',
            title: 'All Jobs',
            type: 'item',
            url: '/all-jobs',
          },
          {
            id: 'Dispatch Driver',
            title: 'Dispatch',
            type: 'item',
            url: '/dispatch',
          },
        ]
      },
      {
        id: 'Fleet',
        title: 'Fleet',
        type: 'item',
        icon: 'feather icon-truck',
        url: '/fleet',
        classes: 'nav-item'
      },
      {
        id: 'customers',
        title: 'Customers',
        type: 'item',
        url: '/customers',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'Reports',
        title: 'Reports',
        type: 'collapse',
        icon: 'feather icon-file-text',
        children: [
          {
            id: 'Pay Reports',
            title: 'Pay Reports',
            type: 'item',
            url: '/pay-report'
          },
          {
            id: 'End of Day Reports',
            title: 'End of Day Reports',
            type: 'item',
            url: '/end-of-day-report'
          }
        ]
      }
    ]
  }
];
