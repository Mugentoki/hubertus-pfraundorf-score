<template>
  <a href="#/">Home</a> |
  <a href="#/about">About</a> |
  <a href="#/non-existent-path">Broken Link</a>
  <component :is="currentView" />
</template>

<script setup>
import { ref, computed } from 'vue'
import Home from './routes/Home.vue'
import About from './routes/About.vue'
import NotFound from './routes/NotFound.vue'

const routes = {
  '/': Home,
  '/about': About
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<style block="VARIABLES">
:root {
  --app-background-color: #224e00;
  --app-background-image: url('/src/assets/images/background.png');

  --default-font-family: 'Lato', sans-serif;
  --default-text-color: #ffffff;
}
</style>

<style block="RESET">
/*
  1. Use a more-intuitive box-sizing model.
*/
*, *::before, *::after {
  box-sizing: border-box;
}
/*
  2. Remove default margin
*/
* {
  margin: 0;
}

/*
  4. Allow percentage-based heights in the application
*/
html, body {
  height: 100%;
  scroll-behavior: smooth;

  @media all and (min-width: 768px) {
    scroll-padding-top: 75px;
  }
}
/*
  Typographic tweaks!
  5. Add accessible line-height
  6. Improve text rendering
*/
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
/*
  7. Improve media defaults
*/
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
/*
  8. Remove built-in form typography styles
*/
input, button, textarea, select {
  font: inherit;
}
/*
  9. Avoid text overflows
*/
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
/*
  10. Create a root stacking context
*/
#app {
  isolation: isolate;
}
</style>

<style block="TYPOGRAPHY">
@font-face {
  font-family: "Lato";
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+000-5FF;
  src: local("Noto Serif"), url("/src/assets/fonts/lato/Lato-Regular.woff2") format("woff2");
}

@font-face {
  font-family: "Lato";
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+000-5FF;
  src: local("Noto Serif"), url("/src/assets/fonts/lato/Lato-Bold.woff2") format("woff2");
}

body {
  font-family: var(--default-font-family);
  font-weight: 400;
  color: var(--default-text-color);
  font-size: 1.6rem;
  word-wrap: break-word;
  hyphens: auto;
}


h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 700;
}

h1,
.h1 {
  font-size: 2.8rem;

  @media all and (min-width: 768px) {
    font-size: 2.8rem;
  }
}

h2,
.h2 {
  font-size: 3.2rem;

  @media all and (min-width: 768px) {
    font-size: 3.8rem;
  }
}

h3,
.h3 {
  font-size: 2.4rem;
}

h4,
.h4 {
  font-size: 2rem;
}

</style>

<style block="APP STYLES">
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100dvh;
  width: 100dvw;
}

#app {
  background-color: var(--app-background-color);
  background-image: var(--app-background-image);
  background-size: 100px;
  color: var(--default-text-color);
}
</style>