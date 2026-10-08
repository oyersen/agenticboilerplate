export interface NavItem {
  title: string;
  path: string;
  iconName: string;
  roles?: string[]; // Empty or undefined means visible to all authenticated users
}

export const navigationItems: NavItem[] = [
  {
    title: 'Genel Bakış',
    path: '/',
    iconName: 'LayoutDashboard',
  },
  // Ajan yeni feature modüllerini buraya ekleyecek:
  // {
  //   title: 'Ürünler',
  //   path: '/products',
  //   iconName: 'Package',
  //   roles: ['ADMIN', 'MANAGER'],
  // },
];
