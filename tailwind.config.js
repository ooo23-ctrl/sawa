import radaConfig from './rada/tailwind.config.js';

export default {
  ...radaConfig,
  content: ['./index.html', './rada/src/**/*.{js,ts,jsx,tsx}'],
};
