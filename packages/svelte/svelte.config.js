import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config | { preprocess: unknown }} */
const config = {
  preprocess: preprocess({
    typescript: true,
  }),
};

export default config;
