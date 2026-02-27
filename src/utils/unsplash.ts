import { createApi } from 'unsplash-js';

// Initialize the Unsplash client wrapper
// Using Astro's built-in global fetch directly
export const unsplash = createApi({
  accessKey: import.meta.env.UNSPLASH_ACCESS_KEY,
  fetch: fetch,
});
