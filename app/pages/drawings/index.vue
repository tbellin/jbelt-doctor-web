<template>
  <div class="container mt-5">
    <!-- Campo di ricerca con bottone -->
    <div class="mb-4">
      <h3 style="color: red;">{{ t('test_page') }}</h3>
      <h4>{{ t('search_drawings') }}</h4>
      <div class="input-group mb-3">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Inserisci nome disegno"
          aria-label="Nome Disegno"
        />
        <button @click="onSearch" class="btn btn-primary" type="button">{{ t('search') }}</button>
      </div>
    </div>

    <!-- Contenuto visibile SOLO DOPO il click su Cerca -->
    <div v-if="showContent">
      <!-- Nome Disegno -->
      <div class="mb-3 alert alert-info">
        <strong>{{ t('drawing_name') }}:</strong> {{ searchQuery }}
      </div>

      <!-- Foglio -->
      <div class="mb-4">
        <h5>{{ t('sheet_name') }}: {{ selectedSheet.name }}</h5>
      </div>

      <!-- Modello -->
      <div class="mb-4">
        <h6>{{ t('model_name') }}: {{ selectedModel.name }}</h6>
      </div>

      <!-- Tabella Dati -->
      <div class="mb-4">
        <h6>{{ t('model_data') }}</h6>
        <table class="table table-bordered table-striped">
          <thead class="table-dark">
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

      <!-- Bottone per scaricare Excel -->
      <button @click="downloadExcel" class="btn btn-success mt-3">{{ t('download_excel') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useI18n } from '~/composables/useI18n';

// Configurazione della pagina
definePageMeta({
  layout: 'dashboard', // Usa il layout esistente (dashboard non presente nella struttura allegata)
  middleware: ['i18n']
})

const { t, loadNamespace } = useI18n();
const searchQuery = ref('')
const showContent = ref(false)

// Simula selezione foglio e modello
const sheets = [
  {
    name: 'Foglio A',
    models: [
      { name: 'Modello A1' },
      { name: 'Modello A2' }
    ]
  },
  {
    name: 'Foglio B',
    models: [
      { name: 'Modello B1' },
      { name: 'Modello B2' }
    ]
  }
]

const selectedSheet = ref(sheets[0])
const selectedModel = ref(sheets[0].models[0])

const modelData = ref([
  {
    marker: 'M1',
    note: ['Prova 1', 'Test A', 'Descrizione X', 'Valore Y'],
  },
  {
    marker: 'M2',
    note: ['Prova 2', 'Test B', 'Descrizione Y', 'Valore Z'],
  }
])

function onSearch() {
  if (!searchQuery.value.trim()) return

  // Mostra tutti i contenuti dopo che si preme "Cerca"
  showContent.value = true
}

function downloadExcel() {
  if (!searchQuery.value || !selectedSheet.value || !selectedModel.value) return

  const worksheetData = [
    ['Nome Disegno', searchQuery.value],
    ['Nome Foglio', selectedSheet.value.name],
    ['Nome Modello', selectedModel.value.name],
    [],
    ['Marker', 'Nota 1', 'Nota 2', 'Nota 3', 'Nota 4'],
    ...modelData.value.map(d => [
      d.marker,
      d.note[0],
      d.note[1],
      d.note[2],
      d.note[3]
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Dati')
  XLSX.writeFile(wb, `${searchQuery.value.replace(/\s+/g, '_')}.xlsx`)
}
</script>

<style scoped>
.container {
  max-width: 960px;
}
.table th,
.table td {
  vertical-align: middle;
}
.btn-success {
  background-color: #198754;
}
.btn-success:hover {
  background-color: #157347;
}
.input-group .btn {
  white-space: nowrap;
}
.alert {
  font-size: 0.95rem;
}
</style>