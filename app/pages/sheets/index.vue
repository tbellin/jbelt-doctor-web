<template>
    <div class="container mt-4">
      <!-- Campo di ricerca -->
      <div class="mb-4">
        <h4>Disegni disponibili</h4>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Cerca disegno"
        />
      </div>
  
      <!-- Tabella dei fogli -->
      <div v-if="filteredSheets.length > 0">
        <h4>Fogli disponibili</h4>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nome Foglio</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sheet, index) in filteredSheets" :key="index">
              <td>{{ sheet.name }}</td>
              <td>
                <button class="btn btn-primary btn-sm" @click="selectSheet(sheet)">
                  Seleziona
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Tabella modelli e dati -->
      <div v-if="selectedSheet">
        <h4>Modelli per il foglio: {{ selectedSheet.name }}</h4>
  
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Nome Modello</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(model, idx) in selectedSheet.models" :key="idx">
              <td>{{ model.name }}</td>
              <td>
                <button
                  class="btn btn-success btn-sm"
                  @click="downloadExcel(model)"
                >
                  Scarica Excel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <!-- Tabella con i campi marker e note -->
        <h5>Dati associati al modello selezionato</h5>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Marker</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
              <th>Nota 4</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dataPoint, idx) in modelData" :key="idx">
              <td>{{ dataPoint.marker }}</td>
              <td>{{ dataPoint.note[0] }}</td>
              <td>{{ dataPoint.note[1] }}</td>
              <td>{{ dataPoint.note[2] }}</td>
              <td>{{ dataPoint.note[3] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  // Configurazione della pagina
    definePageMeta({
    layout: 'dashboard',
    middleware: ['i18n']
  });
  const searchQuery = ref('');
  const selectedSheet = ref(null);
  const modelData = ref([
    {
      marker: 'M1',
      note: ['Prova 1', 'Test A', 'Descrizione X', 'Valore Y'],
    },
    {
      marker: 'M2',
      note: ['Prova 2', 'Test B', 'Descrizione Y', 'Valore Z'],
    },
  ]);
  
  // Elenco fittizio di fogli e modelli
  const sheets = [
    {
      name: 'Foglio A',
      models: [
        { name: 'Modello A1' },
        { name: 'Modello A2' },
      ],
    },
    {
      name: 'Foglio B',
      models: [
        { name: 'Modello B1' },
        { name: 'Modello B2' },
      ],
    },
  ];
  
  const filteredSheets = computed(() => {
    if (!searchQuery.value.trim()) return sheets;
    const query = searchQuery.value.toLowerCase();
    return sheets.filter((sheet) =>
      sheet.name.toLowerCase().includes(query)
    );
  });
  
  function selectSheet(sheet: any) {
    selectedSheet.value = sheet;
  }
  
  function downloadExcel(model: any) {
    // Simulazione download Excel (puoi integrare librerie come xlsx.js)
    alert(`Download Excel per il modello: ${model.name}`);
  }
  </script>