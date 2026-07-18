# Hubertus - DISAG Scoring Software

A simple software to evaluate DISAG Opticscore XML files

## Dev Notes

### Workflow:
1. App starts with "Drag and drop" field to let the user load the XML file
2. After adding it, the app converts the XML to JSON and normalises it -- removes data that's not needed, maybe calculate some scores that are always needed and so on
3. After normalising, the user can select filters, sortings, calculations and so on
4. The selected options from point 3 are run through a pipeline, each selection will then mutate a copy of the original JSON data
5. The final score is displayed on the screen (even live update possible while user selects options in point 3)

Make sure that the pipeline doesn't know which mutations need to be done, it just runs them.
-> makes it easier to add new mutations
-> mutations use the same interface

## Development

### Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
