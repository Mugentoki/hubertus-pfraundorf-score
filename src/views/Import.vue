<template>
  <div id="import-view">
    <h1>DISAG XML Import</h1>
    <form id="disag-xml-import" class="import-form">
      <input type="file" id="disag-xml" name="disagxml" accept=".xml,.XML" />
      <label for="disag-xml">
        <!-- Todo: Add workflow - how to export XML file from DISAG -->
        Hier klicken, um eine exportierte XML Datei von DISAG Opticscore auszuwählen.<br>
        Oder auf die Fläche ziehen (Drag & Drop).
      </label>
      <Icon icon="line-md:upload-outline-loop" height="4rem" />
    </form>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

</script>

<style>
#import-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.import-form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px dashed var(--default-border-color);
  padding: 1rem;
  aspect-ratio: 2/1;
  max-width: 500px;
  position: relative;

  input[type="file"] {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  label {
    width: 100%;
    text-align: center;
    margin-bottom: 2rem;
  }
}
</style>