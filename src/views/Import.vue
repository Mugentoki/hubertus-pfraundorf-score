<template>
  <div id="import-view">
    <h1>DISAG XML Import</h1>
    <div id="disag-xml-import" class="import-form">
      <input type="file" id="disag-xml" name="disagxml" accept=".xml,.XML"  @input="handleXmlImport"/>
      <label for="disag-xml">
        <!-- Todo: Add workflow - how to export XML file from DISAG -->
        Hier klicken, um eine exportierte XML Datei von DISAG Opticscore auszuwählen.<br>
        Oder auf die Fläche ziehen (Drag & Drop).
      </label>
      <Icon icon="line-md:upload-outline-loop" height="4rem" />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import xmlJsParser from 'xml-js';
import { useResultStore } from '../stores/result';

function handleXmlImport(event) {
  const file = event.srcElement.files.length > 0 ? event.srcElement.files[0] : null;

  if (! file || file.type !== "text/xml") {
    alert("Bitte XML Datei auswählen!");
    return;
  }

  const resultStore = useResultStore();
  const reader = new FileReader();
  let jsData = null;

  reader.onload = () => {
    jsData = xmlJsParser.xml2js(reader.result, {compact: true});

    // to start with, we set both original and mutated results the same
    // original result will be used to reset the data
    // mutated result will be used to do the actual mutations on it
    resultStore.setOriginalResult(jsData);
    resultStore.setMutatedResult(jsData);
  };
  reader.onerror = () => {
    alert("Fehler beim Lesen der XML Datei");
  }
  reader.readAsText(file);
}

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