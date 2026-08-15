import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'LightBite React Native',
  description: 'Reference implementation docs — React Native food delivery app built with Expo, Zustand, and best practices',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'User Guide', link: '/guide/getting-started' },
      { text: 'Technical', link: '/technical/architecture' },
      { text: 'Features', link: '/features/home' },
      { text: 'Components', link: '/components/buttons' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'App Overview', link: '/guide/app-overview' },
          ],
        },
      ],
      '/technical/': [
        {
          text: 'Technical Documentation',
          items: [
            { text: 'Architecture', link: '/technical/architecture' },
            { text: 'Code Quality & Enforcement', link: '/technical/code-quality' },
            { text: 'State Management', link: '/technical/state-management' },
            { text: 'API & Networking', link: '/technical/api-networking' },
            { text: 'Navigation', link: '/technical/navigation' },
            { text: 'Theme System', link: '/technical/theme-system' },
            { text: 'Localization', link: '/technical/localization' },
          ],
        },
      ],
      '/features/': [
        {
          text: 'Customer Features',
          items: [
            { text: 'Home', link: '/features/home' },
            { text: 'Restaurant Detail', link: '/features/restaurant' },
            { text: 'Menu Item', link: '/features/menu-item' },
            { text: 'Cart', link: '/features/cart' },
            { text: 'Address', link: '/features/address' },
            { text: 'Checkout', link: '/features/checkout' },
            { text: 'Order & Tracking', link: '/features/order' },
            { text: 'Rate Order', link: '/features/rate-order' },
            { text: 'Search', link: '/features/search' },
          ],
        },
        {
          text: 'Driver Features',
          items: [
            { text: 'Driver Home', link: '/features/driver-home' },
            { text: 'Job Offer', link: '/features/driver-job' },
            { text: 'Pickup & Delivery', link: '/features/driver-delivery' },
            { text: 'Driver Earnings', link: '/features/driver-earnings' },
            { text: 'Driver History', link: '/features/driver-history' },
            { text: 'Driver Profile', link: '/features/driver-profile' },
          ],
        },
      ],
      '/components/': [
        {
          text: 'Component Catalog',
          items: [
            { text: 'Buttons', link: '/components/buttons' },
            { text: 'Inputs & Forms', link: '/components/inputs-forms' },
            { text: 'Cards', link: '/components/cards' },
            { text: 'Feedback', link: '/components/feedback' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],
  },
});
