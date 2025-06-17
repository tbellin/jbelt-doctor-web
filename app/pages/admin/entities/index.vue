<template>
  <div class="admin-entities-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('entities:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('entities:page.description') }}</p>
      </div>
    </div>

    <!-- Entity Navigation Grid -->
    <div class="row g-4 mb-4">
      <!-- Archives -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('archives')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-archive fs-1 text-primary mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.archives.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.archives.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formats -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('formats')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-grid-3x3 fs-1 text-success mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.formats.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.formats.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Positions -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('positions')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-geo-alt fs-1 text-info mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.positions.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.positions.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Markers -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('markers')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-bookmark fs-1 text-warning mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.markers.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.markers.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Model Versions -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('model-versions')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-clock-history fs-1 text-secondary mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.modelVersions.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.modelVersions.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('items')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-collection fs-1 text-primary mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.items.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.items.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Authors -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('authors')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-people fs-1 text-success mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.authors.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.authors.description') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Teams -->
      <div class="col-md-6 col-xl-3">
        <div class="entity-card h-100" @click="navigateToEntity('teams')">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-diagram-3 fs-1 text-info mb-3"></i>
              <h5 class="card-title">{{ t('entities:cards.teams.title') }}</h5>
              <p class="card-text small text-muted">{{ t('entities:cards.teams.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()
const router = useRouter()

// Methods
const navigateToEntity = (entityType: string) => {
  router.push(`/admin/entities/${entityType}`)
}
</script>

<style scoped>
.admin-entities-page {
  padding: 1rem;
}

.entity-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.entity-card:hover {
  transform: translateY(-2px);
}

.entity-card:hover .card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.2s;
  height: 100%;
}
</style>