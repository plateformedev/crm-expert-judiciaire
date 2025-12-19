export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-import': {},
    ...(process.env.NODE_ENV === 'production' ? { 'cssnano': {} } : {})
  },
};
