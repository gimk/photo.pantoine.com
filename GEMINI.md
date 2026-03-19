# GEMINI.md - Photos.pantoine.com

This project is a personal photography portfolio website built with Astro, showcasing a curated gallery of photographs from Unsplash.

## Project Overview

- **Framework**: [Astro](https://astro.build/) (Static Site Generation)
- **Styling**: Vanilla CSS (`src/styles/gallery.css`)
- **Interactions**: Client-side TypeScript (`src/scripts/gallery-interactions.ts`)
- **Data Source**: Unsplash API (`unsplash-js`)
- **Color Extraction**: `node-vibrant` (build-time extraction for impactful background colors)
- **Architecture**:
    - Photos are fetched at build time in `src/pages/index.astro`.
    - `node-vibrant` extracts the "Vibrant" swatch from each photo's thumbnail during the build to ensure the gallery background matches the most impactful color of each image.
    - Each photo's metadata (EXIF, location) is fetched individually to provide a rich "gallery" experience.
    - A custom scroll-snapping gallery layout with dynamic background colors based on the images.

## Building and Running

- **Development**: `npm run dev` - Starts the Astro dev server.
- **Build**: `npm run build` - Generates a static site in the `dist/` directory.
- **Preview**: `npm run preview` - Previews the built site locally.
- **Deployment**: Automatically deployed via GitHub Actions (see `.github/workflows/deploy.yml`).

## Development Conventions

- **Component-Driven**: UI is broken into Astro components (`src/components/`).
- **TypeScript**: Used for both build-time scripts and client-side interactions.
- **Performance**: 
    - Images are lazy-loaded by default, except for the first one.
    - Client-side script preloads upcoming images to ensure smooth scrolling.
- **Environment Variables**:
    - `UNSPLASH_ACCESS_KEY`: Required for fetching data from Unsplash.

## Key Files

- `src/pages/index.astro`: Main entry point, handles data fetching and layout.
- `src/components/PhotoCard.astro`: Displays an individual photo with its metadata.
- `src/scripts/gallery-interactions.ts`: Handles scroll-snapping, keyboard navigation, and dynamic background transitions.
- `src/styles/gallery.css`: Contains all visual styling, including the "artwork frame" effect.
- `src/utils/unsplash.ts`: Unsplash API client configuration.
