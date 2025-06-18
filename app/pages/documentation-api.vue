<template>
  <div class="documentation-api-page">
    <div class="container-fluid py-4">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-code-slash fs-1 text-primary me-3"></i>
            <div>
              <h1 class="display-5 mb-2">{{ t('api:title') }}</h1>
              <p class="lead text-muted mb-0">{{ t('api:subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- API Overview -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h4 mb-3">
                <i class="bi bi-info-circle text-info me-2"></i>
                {{ t('api:overview.title') }}
              </h2>
              <p class="mb-3">{{ t('api:overview.description') }}</p>
              <div class="row">
                <div class="col-md-4">
                  <div class="alert alert-primary">
                    <i class="bi bi-server me-2"></i>
                    <strong>{{ t('api:overview.baseUrl') }}</strong><br>
                    <code>{{ apiBaseUrl }}</code>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="alert alert-success">
                    <i class="bi bi-shield-check me-2"></i>
                    <strong>{{ t('api:overview.auth') }}</strong><br>
                    {{ t('api:overview.authDescription') }}
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="alert alert-warning">
                    <i class="bi bi-file-code me-2"></i>
                    <strong>{{ t('api:overview.format') }}</strong><br>
                    {{ t('api:overview.formatDescription') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Endpoints by Entity -->
      <div class="row">
        <div class="col-12">
          <h2 class="h3 mb-4">
            <i class="bi bi-list-ul text-primary me-2"></i>
            {{ t('api:endpoints.title') }}
          </h2>

          <!-- API Accordion -->
          <div class="accordion" id="apiAccordion">
            
            <!-- Archives API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingArchives">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseArchives"
                >
                  <i class="bi bi-archive me-2 text-primary"></i>
                  <strong>{{ t('api:entities.archives.title') }}</strong>
                  <span class="badge bg-primary ms-2">5 endpoints</span>
                </button>
              </h2>
              <div id="collapseArchives" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="archivesEndpoints"
                    entity="archives"
                  />
                </div>
              </div>
            </div>

            <!-- Authors API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingAuthors">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseAuthors"
                >
                  <i class="bi bi-people me-2 text-success"></i>
                  <strong>{{ t('api:entities.authors.title') }}</strong>
                  <span class="badge bg-success ms-2">6 endpoints</span>
                </button>
              </h2>
              <div id="collapseAuthors" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="authorsEndpoints"
                    entity="authors"
                  />
                </div>
              </div>
            </div>

            <!-- Teams API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTeams">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseTeams"
                >
                  <i class="bi bi-diagram-3 me-2 text-info"></i>
                  <strong>{{ t('api:entities.teams.title') }}</strong>
                  <span class="badge bg-info ms-2">5 endpoints</span>
                </button>
              </h2>
              <div id="collapseTeams" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="teamsEndpoints"
                    entity="teams"
                  />
                </div>
              </div>
            </div>

            <!-- Models API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingModels">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseModels"
                >
                  <i class="bi bi-box-seam me-2 text-warning"></i>
                  <strong>{{ t('api:entities.models.title') }}</strong>
                  <span class="badge bg-warning ms-2">7 endpoints</span>
                </button>
              </h2>
              <div id="collapseModels" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="modelsEndpoints"
                    entity="models"
                  />
                </div>
              </div>
            </div>

            <!-- Sheets API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingSheets">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseSheets"
                >
                  <i class="bi bi-file-earmark-text me-2 text-secondary"></i>
                  <strong>{{ t('api:entities.sheets.title') }}</strong>
                  <span class="badge bg-secondary ms-2">6 endpoints</span>
                </button>
              </h2>
              <div id="collapseSheets" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="sheetsEndpoints"
                    entity="sheets"
                  />
                </div>
              </div>
            </div>

            <!-- Balloons API -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingBalloons">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseBalloons"
                >
                  <i class="bi bi-geo-alt me-2 text-danger"></i>
                  <strong>{{ t('api:entities.balloons.title') }}</strong>
                  <span class="badge bg-danger ms-2">5 endpoints</span>
                </button>
              </h2>
              <div id="collapseBalloons" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <ApiEndpointSection 
                    :endpoints="balloonsEndpoints"
                    entity="balloons"
                  />
                </div>
              </div>
            </div>

            <!-- Additional Entities -->
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOthers">
                <button 
                  class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapseOthers"
                >
                  <i class="bi bi-collection me-2 text-dark"></i>
                  <strong>{{ t('api:entities.others.title') }}</strong>
                  <span class="badge bg-dark ms-2">4 entities</span>
                </button>
              </h2>
              <div id="collapseOthers" class="accordion-collapse collapse" data-bs-parent="#apiAccordion">
                <div class="accordion-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="h6 text-primary mb-3">{{ t('api:entities.formats.title') }}</h5>
                      <ApiEndpointSection 
                        :endpoints="formatsEndpoints"
                        entity="formats"
                        :compact="true"
                      />
                    </div>
                    <div class="col-md-6">
                      <h5 class="h6 text-success mb-3">{{ t('api:entities.markers.title') }}</h5>
                      <ApiEndpointSection 
                        :endpoints="markersEndpoints"
                        entity="markers"
                        :compact="true"
                      />
                    </div>
                  </div>
                  <hr>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="h6 text-info mb-3">{{ t('api:entities.positions.title') }}</h5>
                      <ApiEndpointSection 
                        :endpoints="positionsEndpoints"
                        entity="positions"
                        :compact="true"
                      />
                    </div>
                    <div class="col-md-6">
                      <h5 class="h6 text-warning mb-3">{{ t('api:entities.items.title') }}</h5>
                      <ApiEndpointSection 
                        :endpoints="itemsEndpoints"
                        entity="items"
                        :compact="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Common Response Codes -->
      <div class="row mt-5">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h2 class="h4 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ t('api:responses.title') }}
              </h2>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h3 class="h5 text-success mb-3">{{ t('api:responses.success.title') }}</h3>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>{{ t('api:responses.code') }}</th>
                          <th>{{ t('api:responses.description') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span class="badge bg-success">200</span></td>
                          <td>{{ t('api:responses.success.200') }}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-success">201</span></td>
                          <td>{{ t('api:responses.success.201') }}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-success">204</span></td>
                          <td>{{ t('api:responses.success.204') }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="col-md-6">
                  <h3 class="h5 text-danger mb-3">{{ t('api:responses.error.title') }}</h3>
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>{{ t('api:responses.code') }}</th>
                          <th>{{ t('api:responses.description') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span class="badge bg-warning">400</span></td>
                          <td>{{ t('api:responses.error.400') }}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-warning">401</span></td>
                          <td>{{ t('api:responses.error.401') }}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-danger">404</span></td>
                          <td>{{ t('api:responses.error.404') }}</td>
                        </tr>
                        <tr>
                          <td><span class="badge bg-danger">500</span></td>
                          <td>{{ t('api:responses.error.500') }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-diagram-3 fs-1 text-primary mb-3"></i>
              <h3 class="h5">{{ t('api:navigation.workflow') }}</h3>
              <p class="text-muted mb-3">{{ t('api:navigation.workflowDescription') }}</p>
              <NuxtLink to="/documentation-workflow" class="btn btn-primary">
                {{ t('api:navigation.viewWorkflow') }}
                <i class="bi bi-arrow-right ms-2"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-gear fs-1 text-success mb-3"></i>
              <h3 class="h5">{{ t('api:navigation.admin') }}</h3>
              <p class="text-muted mb-3">{{ t('api:navigation.adminDescription') }}</p>
              <NuxtLink to="/admin/entities" class="btn btn-success">
                {{ t('api:navigation.viewAdmin') }}
                <i class="bi bi-arrow-right ms-2"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
})

const { t, loadNamespace } = useI18n()

// Carica esplicitamente il namespace "api" all'avvio del componente
onMounted(async () => {
  await loadNamespace('api');
});
const { public: { apiBase } } = useRuntimeConfig()

// API Base URL
const apiBaseUrl = computed(() => apiBase || 'http://localhost:8080')

// SEO Meta
useHead({
  title: computed(() => t('api:meta.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('api:meta.description'))
    }
  ]
})

// API Endpoints Data
const archivesEndpoints = [
  { method: 'GET', path: '/api/archives', description: 'Get all archives', auth: true },
  { method: 'GET', path: '/api/archives/{id}', description: 'Get archive by ID', auth: true },
  { method: 'POST', path: '/api/archives', description: 'Create new archive', auth: true },
  { method: 'PUT', path: '/api/archives/{id}', description: 'Update archive', auth: true },
  { method: 'DELETE', path: '/api/archives/{id}', description: 'Delete archive', auth: true }
]

const authorsEndpoints = [
  { method: 'GET', path: '/api/authors', description: 'Get all authors', auth: true },
  { method: 'GET', path: '/api/authors/{id}', description: 'Get author by ID', auth: true },
  { method: 'GET', path: '/api/authors/team/{teamId}', description: 'Get authors by team', auth: true },
  { method: 'POST', path: '/api/authors', description: 'Create new author', auth: true },
  { method: 'PUT', path: '/api/authors/{id}', description: 'Update author', auth: true },
  { method: 'DELETE', path: '/api/authors/{id}', description: 'Delete author', auth: true }
]

const teamsEndpoints = [
  { method: 'GET', path: '/api/teams', description: 'Get all teams with hierarchy', auth: true },
  { method: 'GET', path: '/api/teams/{id}', description: 'Get team by ID', auth: true },
  { method: 'POST', path: '/api/teams', description: 'Create new team', auth: true },
  { method: 'PUT', path: '/api/teams/{id}', description: 'Update team', auth: true },
  { method: 'DELETE', path: '/api/teams/{id}', description: 'Delete team (if no children)', auth: true }
]

const modelsEndpoints = [
  { method: 'GET', path: '/api/models', description: 'Get all models', auth: true },
  { method: 'GET', path: '/api/models/{id}', description: 'Get model by ID', auth: true },
  { method: 'GET', path: '/api/models/type/{type}', description: 'Get models by type (PART, ASSEMBLY, DRAWING)', auth: true },
  { method: 'GET', path: '/api/models/{id}/sheets', description: 'Get sheets associated with model', auth: true },
  { method: 'POST', path: '/api/models', description: 'Create new model', auth: true },
  { method: 'PUT', path: '/api/models/{id}', description: 'Update model', auth: true },
  { method: 'DELETE', path: '/api/models/{id}', description: 'Delete model', auth: true }
]

const sheetsEndpoints = [
  { method: 'GET', path: '/api/sheets', description: 'Get all sheets', auth: true },
  { method: 'GET', path: '/api/sheets/{id}', description: 'Get sheet by ID', auth: true },
  { method: 'GET', path: '/api/sheets/format/{format}', description: 'Get sheets by format (A0, A1, A2, A3, A4)', auth: true },
  { method: 'GET', path: '/api/sheets/{id}/models', description: 'Get models associated with sheet', auth: true },
  { method: 'POST', path: '/api/sheets', description: 'Create new sheet', auth: true },
  { method: 'PUT', path: '/api/sheets/{id}', description: 'Update sheet', auth: true },
  { method: 'DELETE', path: '/api/sheets/{id}', description: 'Delete sheet', auth: true }
]

const balloonsEndpoints = [
  { method: 'GET', path: '/api/balloons', description: 'Get all balloons', auth: true },
  { method: 'GET', path: '/api/balloons/{id}', description: 'Get balloon by ID', auth: true },
  { method: 'GET', path: '/api/balloons/sheet/{sheetId}', description: 'Get balloons by sheet', auth: true },
  { method: 'POST', path: '/api/balloons', description: 'Create new balloon', auth: true },
  { method: 'PUT', path: '/api/balloons/{id}', description: 'Update balloon', auth: true },
  { method: 'DELETE', path: '/api/balloons/{id}', description: 'Delete balloon', auth: true }
]

const formatsEndpoints = [
  { method: 'GET', path: '/api/formats', description: 'Get all formats', auth: true },
  { method: 'POST', path: '/api/formats', description: 'Create format', auth: true },
  { method: 'PUT', path: '/api/formats/{id}', description: 'Update format', auth: true },
  { method: 'DELETE', path: '/api/formats/{id}', description: 'Delete format', auth: true }
]

const markersEndpoints = [
  { method: 'GET', path: '/api/markers', description: 'Get all markers', auth: true },
  { method: 'POST', path: '/api/markers', description: 'Create marker', auth: true },
  { method: 'PUT', path: '/api/markers/{id}', description: 'Update marker', auth: true },
  { method: 'DELETE', path: '/api/markers/{id}', description: 'Delete marker', auth: true }
]

const positionsEndpoints = [
  { method: 'GET', path: '/api/positions', description: 'Get all positions', auth: true },
  { method: 'POST', path: '/api/positions', description: 'Create position', auth: true },
  { method: 'PUT', path: '/api/positions/{id}', description: 'Update position', auth: true },
  { method: 'DELETE', path: '/api/positions/{id}', description: 'Delete position', auth: true }
]

const itemsEndpoints = [
  { method: 'GET', path: '/api/items', description: 'Get all items', auth: true },
  { method: 'POST', path: '/api/items', description: 'Create item', auth: true },
  { method: 'PUT', path: '/api/items/{id}', description: 'Update item', auth: true },
  { method: 'DELETE', path: '/api/items/{id}', description: 'Delete item', auth: true }
]
</script>

<style scoped>
.documentation-api-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.accordion-item {
  border: none;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.accordion-button {
  background-color: #fff;
  border: none;
  padding: 1.25rem 1.5rem;
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: transparent;
}

.accordion-body {
  background-color: #fff;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.table td {
  font-size: 0.875rem;
}
</style>