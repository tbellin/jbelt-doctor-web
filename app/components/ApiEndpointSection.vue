<template>
  <div class="api-endpoint-section">
    <div v-if="!compact" class="mb-3">
      <p class="text-muted mb-0">{{ t(`api:entities.${entity}.description`) }}</p>
    </div>
    
    <div class="endpoints-list">
      <div 
        v-for="(endpoint, index) in endpoints" 
        :key="index"
        class="endpoint-item"
        :class="{ 'compact': compact }"
      >
        <div class="d-flex align-items-center justify-content-between">
          <div class="endpoint-info flex-grow-1">
            <div class="d-flex align-items-center mb-1">
              <span 
                class="method-badge badge me-2"
                :class="getMethodClass(endpoint.method)"
              >
                {{ endpoint.method }}
              </span>
              <code class="endpoint-path">{{ endpoint.path }}</code>
              <i 
                v-if="endpoint.auth"
                class="bi bi-shield-check text-success ms-2"
                :title="t('api:common.requiresAuth')"
              ></i>
            </div>
            <p class="endpoint-description mb-0" :class="{ 'small': compact }">
              {{ endpoint.description }}
            </p>
          </div>
          
          <div v-if="!compact" class="endpoint-actions">
            <button 
              class="btn btn-sm btn-outline-primary"
              @click="showExample(endpoint)"
            >
              <i class="bi bi-code"></i>
              {{ t('api:common.example') }}
            </button>
          </div>
        </div>
        
        <!-- Example Section -->
        <div 
          v-if="showExamples[index]" 
          class="endpoint-example mt-3 p-3 bg-light rounded"
        >
          <h6 class="mb-2">
            <i class="bi bi-code me-1"></i>
            {{ t('api:common.exampleRequest') }}
          </h6>
          
          <!-- cURL Example -->
          <div class="mb-3">
            <label class="form-label small fw-bold">cURL:</label>
            <pre class="code-block"><code>{{ generateCurlExample(endpoint) }}</code></pre>
            <button 
              class="btn btn-sm btn-outline-secondary"
              @click="copyToClipboard(generateCurlExample(endpoint))"
            >
              <i class="bi bi-clipboard"></i>
              {{ t('api:common.copy') }}
            </button>
          </div>
          
          <!-- JavaScript Example -->
          <div class="mb-3">
            <label class="form-label small fw-bold">JavaScript (Axios):</label>
            <pre class="code-block"><code>{{ generateJsExample(endpoint) }}</code></pre>
            <button 
              class="btn btn-sm btn-outline-secondary"
              @click="copyToClipboard(generateJsExample(endpoint))"
            >
              <i class="bi bi-clipboard"></i>
              {{ t('api:common.copy') }}
            </button>
          </div>
          
          <!-- Response Example -->
          <div>
            <label class="form-label small fw-bold">{{ t('api:common.exampleResponse') }}:</label>
            <pre class="code-block"><code>{{ generateResponseExample(endpoint) }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ApiEndpoint {
  method: string
  path: string
  description: string
  auth?: boolean
}

interface Props {
  endpoints: ApiEndpoint[]
  entity: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const { t } = useI18n()
const { public: { apiBase } } = useRuntimeConfig()

// Reactive state for showing examples
const showExamples = ref<Record<number, boolean>>({})

// Methods
const getMethodClass = (method: string): string => {
  const classes = {
    'GET': 'bg-success',
    'POST': 'bg-primary',
    'PUT': 'bg-warning text-dark',
    'DELETE': 'bg-danger',
    'PATCH': 'bg-info'
  }
  return classes[method] || 'bg-secondary'
}

const showExample = (endpoint: ApiEndpoint) => {
  const index = props.endpoints.indexOf(endpoint)
  showExamples.value[index] = !showExamples.value[index]
}

const generateCurlExample = (endpoint: ApiEndpoint): string => {
  const baseUrl = apiBase || 'http://localhost:8080'
  const url = `${baseUrl}${endpoint.path.replace('{id}', '1').replace('{teamId}', '1').replace('{sheetId}', '1').replace('{type}', 'PART').replace('{format}', 'A4')}`
  
  let curl = `curl -X ${endpoint.method} "${url}"`
  
  if (endpoint.auth) {
    curl += ` \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
  }
  
  curl += ` \\\n  -H "Content-Type: application/json"`
  
  if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
    curl += ` \\\n  -d '${generateRequestBody(endpoint)}'`
  }
  
  return curl
}

const generateJsExample = (endpoint: ApiEndpoint): string => {
  const path = endpoint.path.replace('{id}', '1').replace('{teamId}', '1').replace('{sheetId}', '1').replace('{type}', 'PART').replace('{format}', 'A4')
  
  let js = `const response = await axios.${endpoint.method.toLowerCase()}('${path}'`
  
  if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
    js += `, ${generateRequestBody(endpoint)}`
  }
  
  if (endpoint.auth) {
    js += `, {
  headers: {
    'Authorization': 'Bearer ' + token
  }
}`
  }
  
  js += `);
console.log(response.data);`
  
  return js
}

const generateRequestBody = (endpoint: ApiEndpoint): string => {
  const entity = props.entity.slice(0, -1) // Remove 's' from plural
  
  const examples = {
    'archive': `{
  "code": "ARC001",
  "name": "Technical Archive",
  "type": "CAD",
  "fileName": "drawing.dwg"
}`,
    'author': `{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "teamId": 1
}`,
    'team': `{
  "name": "Engineering Team",
  "department": "R&D",
  "contactEmail": "engineering@company.com"
}`,
    'model': `{
  "code": "MDL001",
  "name": "Main Assembly",
  "itemType": "ASSEMBLY",
  "creoId": "main_asm.asm"
}`,
    'sheet': `{
  "sheetFormat": "A3",
  "scale": "1:1",
  "sheetNumber": 1
}`,
    'balloon': `{
  "balloonNumber": "1",
  "posX": 100.0,
  "posY": 200.0,
  "balloonType": "CIRCLE"
}`
  }
  
  return examples[entity] || `{
  "name": "Example ${entity}",
  "description": "Example description"
}`
}

const generateResponseExample = (endpoint: ApiEndpoint): string => {
  if (endpoint.method === 'DELETE') {
    return `HTTP/1.1 204 No Content`
  }
  
  if (endpoint.method === 'GET' && endpoint.path.includes('{id}')) {
    return `{
  "id": 1,
  "name": "Example ${props.entity.slice(0, -1)}",
  "createdDate": "2024-01-15T10:30:00Z",
  "updatedDate": "2024-01-15T10:30:00Z"
}`
  }
  
  if (endpoint.method === 'GET') {
    return `[
  {
    "id": 1,
    "name": "First ${props.entity.slice(0, -1)}",
    "createdDate": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Second ${props.entity.slice(0, -1)}",
    "createdDate": "2024-01-15T10:30:00Z"
  }
]`
  }
  
  return `{
  "id": 1,
  "name": "Created ${props.entity.slice(0, -1)}",
  "createdDate": "2024-01-15T10:30:00Z"
}`
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<style scoped>
.api-endpoint-section {
  font-size: 0.9rem;
}

.endpoint-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: #fff;
  transition: box-shadow 0.2s;
}

.endpoint-item:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.endpoint-item.compact {
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.method-badge {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.endpoint-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}

.endpoint-description {
  color: #6c757d;
  margin-bottom: 0;
}

.code-block {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1rem;
  font-size: 0.875rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.code-block code {
  background: none;
  padding: 0;
  color: #212529;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.endpoint-example {
  border-left: 4px solid #007bff;
}

@media (max-width: 768px) {
  .endpoint-item {
    padding: 0.75rem;
  }
  
  .d-flex.align-items-center.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .endpoint-actions {
    margin-top: 0.5rem;
    width: 100%;
  }
  
  .endpoint-actions .btn {
    width: 100%;
  }
}
</style>