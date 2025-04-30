<template>
  <div class="container mt-5">
    <h4>Elenco Disegni</h4>

    <button @click="fetchDrawings" class="btn btn-primary mb-3">Carica Disegni</button>

    <div v-if="loading" class="alert alert-info">Caricamento in corso...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <table v-else class="table table-striped" v-if="drawings.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Codice</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="drawing in drawings" :key="drawing.id">
          <td>{{ drawing.id }}</td>
          <td>{{ drawing.code }}</td>
          <td>{{ drawing.name }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else>
      Nessun disegno trovato.
    </div>
  </div>
</template>

<script setup lang="ts">
const { drawings, loading, error, fetchDrawings } = useDrawings()
</script>