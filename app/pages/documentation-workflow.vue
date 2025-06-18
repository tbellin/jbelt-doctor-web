<template>
  <div class="documentation-workflow-page">
    <div class="container-fluid py-4">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-diagram-3 fs-1 text-primary me-3"></i>
            <div>
              <h1 class="display-5 mb-2">{{ t('workflow:title') }}</h1>
              <p class="lead text-muted mb-0">{{ t('workflow:subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview Section -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h2 class="h4 mb-3">
                <i class="bi bi-info-circle text-info me-2"></i>
                {{ t('workflow:overview.title') }}
              </h2>
              <p class="mb-3">{{ t('workflow:overview.description') }}</p>
              <div class="alert alert-info">
                <i class="bi bi-lightbulb me-2"></i>
                <strong>{{ t('workflow:overview.tip') }}</strong>
                {{ t('workflow:overview.tipDescription') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workflow Steps -->
      <div class="row mb-5">
        <div class="col-12">
          <h2 class="h3 mb-4">
            <i class="bi bi-list-ol text-primary me-2"></i>
            {{ t('workflow:steps.title') }}
          </h2>
          
          <!-- Step 1: Drawings -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-primary text-white">
              <h3 class="h5 mb-0">
                <span class="badge bg-light text-primary me-2">1</span>
                <i class="bi bi-pencil-square me-2"></i>
                {{ t('workflow:steps.step1.title') }}
              </h3>
            </div>
            <div class="card-body">
              <p class="mb-3">{{ t('workflow:steps.step1.description') }}</p>
              
              <div class="row">
                <div class="col-md-6">
                  <h4 class="h6 text-primary mb-2">{{ t('workflow:steps.step1.purpose') }}</h4>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-check2 text-success me-2"></i>{{ t('workflow:steps.step1.purposes.technical') }}</li>
                    <li><i class="bi bi-check2 text-success me-2"></i>{{ t('workflow:steps.step1.purposes.assembly') }}</li>
                    <li><i class="bi bi-check2 text-success me-2"></i>{{ t('workflow:steps.step1.purposes.documentation') }}</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h4 class="h6 text-primary mb-2">{{ t('workflow:steps.step1.creoIntegration') }}</h4>
                  <div class="alert alert-light">
                    <i class="bi bi-gear text-warning me-2"></i>
                    <small>{{ t('workflow:steps.step1.creoDescription') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Sheets -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-success text-white">
              <h3 class="h5 mb-0">
                <span class="badge bg-light text-success me-2">2</span>
                <i class="bi bi-file-earmark-text me-2"></i>
                {{ t('workflow:steps.step2.title') }}
              </h3>
            </div>
            <div class="card-body">
              <p class="mb-3">{{ t('workflow:steps.step2.description') }}</p>
              
              <div class="row">
                <div class="col-md-4">
                  <h4 class="h6 text-success mb-2">{{ t('workflow:steps.step2.formats') }}</h4>
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    <span class="badge bg-light text-dark">A0</span>
                    <span class="badge bg-light text-dark">A1</span>
                    <span class="badge bg-light text-dark">A2</span>
                    <span class="badge bg-light text-dark">A3</span>
                    <span class="badge bg-light text-dark">A4</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <h4 class="h6 text-success mb-2">{{ t('workflow:steps.step2.properties') }}</h4>
                  <ul class="list-unstyled small">
                    <li><i class="bi bi-dot"></i>{{ t('workflow:steps.step2.props.scale') }}</li>
                    <li><i class="bi bi-dot"></i>{{ t('workflow:steps.step2.props.dimensions') }}</li>
                    <li><i class="bi bi-dot"></i>{{ t('workflow:steps.step2.props.orientation') }}</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h4 class="h6 text-success mb-2">{{ t('workflow:steps.step2.associations') }}</h4>
                  <div class="alert alert-light">
                    <small>{{ t('workflow:steps.step2.associationDescription') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Models -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-info text-white">
              <h3 class="h5 mb-0">
                <span class="badge bg-light text-info me-2">3</span>
                <i class="bi bi-box-seam me-2"></i>
                {{ t('workflow:steps.step3.title') }}
              </h3>
            </div>
            <div class="card-body">
              <p class="mb-3">{{ t('workflow:steps.step3.description') }}</p>
              
              <div class="row">
                <div class="col-md-3">
                  <div class="text-center mb-3">
                    <i class="bi bi-gear fs-1 text-primary"></i>
                    <h5 class="h6 mt-2">{{ t('workflow:steps.step3.types.part') }}</h5>
                    <small class="text-muted">{{ t('workflow:steps.step3.types.partDesc') }}</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center mb-3">
                    <i class="bi bi-boxes fs-1 text-success"></i>
                    <h5 class="h6 mt-2">{{ t('workflow:steps.step3.types.assembly') }}</h5>
                    <small class="text-muted">{{ t('workflow:steps.step3.types.assemblyDesc') }}</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center mb-3">
                    <i class="bi bi-file-earmark-text fs-1 text-warning"></i>
                    <h5 class="h6 mt-2">{{ t('workflow:steps.step3.types.drawing') }}</h5>
                    <small class="text-muted">{{ t('workflow:steps.step3.types.drawingDesc') }}</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center mb-3">
                    <i class="bi bi-grid-3x3 fs-1 text-secondary"></i>
                    <h5 class="h6 mt-2">{{ t('workflow:steps.step3.types.format') }}</h5>
                    <small class="text-muted">{{ t('workflow:steps.step3.types.formatDesc') }}</small>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>{{ t('workflow:steps.step3.hierarchy') }}</strong>
                {{ t('workflow:steps.step3.hierarchyDesc') }}
              </div>
            </div>
          </div>

          <!-- Step 4: Balloons & Notes -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h3 class="h5 mb-0">
                <span class="badge bg-light text-warning me-2">4</span>
                <i class="bi bi-chat-dots me-2"></i>
                {{ t('workflow:steps.step4.title') }}
              </h3>
            </div>
            <div class="card-body">
              <p class="mb-3">{{ t('workflow:steps.step4.description') }}</p>
              
              <div class="row">
                <div class="col-md-6">
                  <h4 class="h6 text-warning mb-2">
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ t('workflow:steps.step4.balloons.title') }}
                  </h4>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.balloons.positioning') }}</li>
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.balloons.numbering') }}</li>
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.balloons.markers') }}</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h4 class="h6 text-warning mb-2">
                    <i class="bi bi-sticky me-1"></i>
                    {{ t('workflow:steps.step4.notes.title') }}
                  </h4>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.notes.annotations') }}</li>
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.notes.specifications') }}</li>
                    <li><i class="bi bi-arrow-right text-warning me-2"></i>{{ t('workflow:steps.step4.notes.tolerances') }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Best Practices -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-dark text-white">
              <h2 class="h4 mb-0">
                <i class="bi bi-award me-2"></i>
                {{ t('workflow:bestPractices.title') }}
              </h2>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h3 class="h5 text-success mb-3">
                    <i class="bi bi-check-circle me-2"></i>
                    {{ t('workflow:bestPractices.dos.title') }}
                  </h3>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <i class="bi bi-check2 text-success me-2"></i>
                      {{ t('workflow:bestPractices.dos.consistent') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-check2 text-success me-2"></i>
                      {{ t('workflow:bestPractices.dos.validate') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-check2 text-success me-2"></i>
                      {{ t('workflow:bestPractices.dos.backup') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-check2 text-success me-2"></i>
                      {{ t('workflow:bestPractices.dos.document') }}
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h3 class="h5 text-danger mb-3">
                    <i class="bi bi-x-circle me-2"></i>
                    {{ t('workflow:bestPractices.donts.title') }}
                  </h3>
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <i class="bi bi-x text-danger me-2"></i>
                      {{ t('workflow:bestPractices.donts.circular') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-x text-danger me-2"></i>
                      {{ t('workflow:bestPractices.donts.orphan') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-x text-danger me-2"></i>
                      {{ t('workflow:bestPractices.donts.duplicates') }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-x text-danger me-2"></i>
                      {{ t('workflow:bestPractices.donts.inconsistent') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workflow Diagram -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h2 class="h4 mb-0">
                <i class="bi bi-diagram-2 me-2"></i>
                {{ t('workflow:diagram.title') }}
              </h2>
            </div>
            <div class="card-body">
              <div class="workflow-diagram">
                <div class="row align-items-center">
                  <div class="col-md-2 text-center">
                    <div class="workflow-step">
                      <div class="workflow-icon bg-primary">
                        <i class="bi bi-pencil-square"></i>
                      </div>
                      <h6 class="mt-2">{{ t('workflow:diagram.drawings') }}</h6>
                    </div>
                  </div>
                  <div class="col-md-1 text-center">
                    <i class="bi bi-arrow-right fs-3 text-muted"></i>
                  </div>
                  <div class="col-md-2 text-center">
                    <div class="workflow-step">
                      <div class="workflow-icon bg-success">
                        <i class="bi bi-file-earmark-text"></i>
                      </div>
                      <h6 class="mt-2">{{ t('workflow:diagram.sheets') }}</h6>
                    </div>
                  </div>
                  <div class="col-md-1 text-center">
                    <i class="bi bi-arrow-right fs-3 text-muted"></i>
                  </div>
                  <div class="col-md-2 text-center">
                    <div class="workflow-step">
                      <div class="workflow-icon bg-info">
                        <i class="bi bi-box-seam"></i>
                      </div>
                      <h6 class="mt-2">{{ t('workflow:diagram.models') }}</h6>
                    </div>
                  </div>
                  <div class="col-md-1 text-center">
                    <i class="bi bi-arrow-right fs-3 text-muted"></i>
                  </div>
                  <div class="col-md-3 text-center">
                    <div class="workflow-step">
                      <div class="workflow-icon bg-warning">
                        <i class="bi bi-chat-dots"></i>
                      </div>
                      <h6 class="mt-2">{{ t('workflow:diagram.balloons') }}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="row">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-code fs-1 text-primary mb-3"></i>
              <h3 class="h5">{{ t('workflow:navigation.api') }}</h3>
              <p class="text-muted mb-3">{{ t('workflow:navigation.apiDescription') }}</p>
              <NuxtLink to="/documentation-api" class="btn btn-primary">
                {{ t('workflow:navigation.viewApi') }}
                <i class="bi bi-arrow-right ms-2"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-gear fs-1 text-success mb-3"></i>
              <h3 class="h5">{{ t('workflow:navigation.admin') }}</h3>
              <p class="text-muted mb-3">{{ t('workflow:navigation.adminDescription') }}</p>
              <NuxtLink to="/admin/entities" class="btn btn-success">
                {{ t('workflow:navigation.viewAdmin') }}
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
import { useI18n } from '~/composables/useI18n';

const { t, loadNamespace } = useI18n();
// Carica il namespace "documentation-workflow" all'avvio del componente
onMounted(async () => {
  await loadNamespace('documentation-workflow');
});

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
});
</script>

<style scoped>
.documentation-workflow-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.workflow-diagram {
  padding: 2rem 0;
}

.workflow-step {
  margin-bottom: 1rem;
}

.workflow-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 1.5rem;
}

.badge {
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .workflow-diagram .col-md-1 {
    display: none;
  }
  
  .workflow-diagram .row {
    flex-direction: column;
  }
  
  .workflow-diagram .col-md-2,
  .workflow-diagram .col-md-3 {
    margin-bottom: 1rem;
  }
}
</style>