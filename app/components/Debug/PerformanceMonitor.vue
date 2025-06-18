<!--
  Performance Monitor - Debug Component
  
  Features:
  - API metrics monitoring
  - Cache performance stats
  - Component render tracking
  - Memory usage monitoring
  - Network performance
  
  @version 1.0.0
-->
<template>
  <div class="performance-monitor" v-if="isDebugMode">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i class="bi bi-speedometer2 me-2 text-info"></i>
          Performance Monitor
          <span class="badge bg-info ms-2">{{ updateInterval }}ms</span>
        </h6>
        <div class="monitor-controls">
          <button 
            class="btn btn-sm btn-outline-secondary me-2"
            @click="toggleAutoUpdate"
          >
            <i class="bi" :class="autoUpdate ? 'bi-pause' : 'bi-play'"></i>
            {{ autoUpdate ? 'Pause' : 'Resume' }}
          </button>
          <button 
            class="btn btn-sm btn-outline-danger"
            @click="resetMetrics"
          >
            <i class="bi bi-arrow-clockwise"></i>
            Reset
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="row g-3">
          <!-- API Performance -->
          <div class="col-md-4">
            <div class="metric-section">
              <h6 class="metric-title">
                <i class="bi bi-cloud-arrow-down me-2"></i>
                API Performance
              </h6>
              <div class="metric-content">
                <div class="metric-item">
                  <span class="metric-label">Total Requests:</span>
                  <span class="metric-value">{{ apiMetrics.totalRequests }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Cache Hits:</span>
                  <span class="metric-value text-success">{{ apiMetrics.cacheHits }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Cache Miss:</span>
                  <span class="metric-value text-warning">{{ apiMetrics.cacheMisses }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Hit Rate:</span>
                  <span class="metric-value" :class="getCacheHitRateClass(apiMetrics.hitRate)">
                    {{ apiMetrics.hitRate }}%
                  </span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Avg Response:</span>
                  <span class="metric-value" :class="getResponseTimeClass(apiMetrics.averageResponseTime)">
                    {{ apiMetrics.averageResponseTime }}ms
                  </span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Errors:</span>
                  <span class="metric-value text-danger">{{ apiMetrics.errors }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cache Stats -->
          <div class="col-md-4">
            <div class="metric-section">
              <h6 class="metric-title">
                <i class="bi bi-hdd me-2"></i>
                Cache Statistics
              </h6>
              <div class="metric-content">
                <div class="metric-item">
                  <span class="metric-label">Entries:</span>
                  <span class="metric-value">{{ cacheStats.totalEntries }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Memory Used:</span>
                  <span class="metric-value">{{ formatBytes(cacheStats.memoryUsed) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Hit Ratio:</span>
                  <span class="metric-value text-success">{{ cacheStats.hitRatio }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Expired:</span>
                  <span class="metric-value text-muted">{{ cacheStats.expiredEntries }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Max Size:</span>
                  <span class="metric-value">{{ cacheStats.maxSize }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Cleanup Rate:</span>
                  <span class="metric-value">{{ cacheStats.cleanupRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Component Stats -->
          <div class="col-md-4">
            <div class="metric-section">
              <h6 class="metric-title">
                <i class="bi bi-cpu me-2"></i>
                Component Performance
              </h6>
              <div class="metric-content">
                <div class="metric-item">
                  <span class="metric-label">Render Time:</span>
                  <span class="metric-value" :class="getRenderTimeClass(componentStats.renderTime)">
                    {{ componentStats.renderTime }}ms
                  </span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Last Update:</span>
                  <span class="metric-value">{{ formatTime(componentStats.lastUpdate) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Operations:</span>
                  <span class="metric-value">{{ componentStats.operationsCount }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Memory:</span>
                  <span class="metric-value">{{ formatBytes(memoryUsage.used) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Components:</span>
                  <span class="metric-value">{{ componentStats.activeComponents }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">DOM Nodes:</span>
                  <span class="metric-value">{{ domStats.nodeCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="metric-section">
              <h6 class="metric-title">
                <i class="bi bi-graph-up me-2"></i>
                Response Time History
              </h6>
              <div class="performance-chart">
                <canvas ref="chartCanvas" width="800" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts and Recommendations -->
        <div class="row mt-4" v-if="performanceAlerts.length">
          <div class="col-12">
            <div class="alert alert-warning">
              <h6 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Performance Alerts
              </h6>
              <ul class="mb-0">
                <li v-for="alert in performanceAlerts" :key="alert.id">
                  {{ alert.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Debug Actions -->
        <div class="row mt-3">
          <div class="col-12">
            <div class="debug-actions">
              <button 
                class="btn btn-sm btn-outline-info me-2"
                @click="exportMetrics"
              >
                <i class="bi bi-download me-1"></i>
                Export Metrics
              </button>
              <button 
                class="btn btn-sm btn-outline-warning me-2"
                @click="clearCache"
              >
                <i class="bi bi-trash me-1"></i>
                Clear Cache
              </button>
              <button 
                class="btn btn-sm btn-outline-success"
                @click="runPerformanceTest"
              >
                <i class="bi bi-play-circle me-1"></i>
                Run Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useDebug } from '~/composables/useDebug'

// Props
interface Props {
  apiMetrics?: {
    totalRequests: number
    cacheHits: number
    cacheMisses: number
    hitRate: number
    averageResponseTime: number
    errors: number
  }
  cacheStats?: {
    totalEntries: number
    memoryUsed: number
    hitRatio: number
    expiredEntries: number
    maxSize: number
    cleanupRate: number
  }
  componentStats?: {
    renderTime: number
    lastUpdate: Date
    operationsCount: number
    activeComponents: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  apiMetrics: () => ({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    averageResponseTime: 0,
    errors: 0
  }),
  cacheStats: () => ({
    totalEntries: 0,
    memoryUsed: 0,
    hitRatio: 0,
    expiredEntries: 0,
    maxSize: 100,
    cleanupRate: 0
  }),
  componentStats: () => ({
    renderTime: 0,
    lastUpdate: new Date(),
    operationsCount: 0,
    activeComponents: 1
  })
})

// Composables
const { isDebugMode } = useDebug()

// Local state
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const autoUpdate = ref(true)
const updateInterval = ref(1000)
const responseTimeHistory = ref<number[]>([])
const memoryUsage = ref({ used: 0, total: 0 })
const domStats = ref({ nodeCount: 0 })
const performanceAlerts = ref<Array<{id: string, message: string}>>([])

// Timers
let updateTimer: NodeJS.Timeout | null = null
let chartUpdateTimer: NodeJS.Timeout | null = null

// Methods
const updateMemoryUsage = (): void => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize
    }
  }
}

const updateDOMStats = (): void => {
  domStats.value = {
    nodeCount: document.querySelectorAll('*').length
  }
}

const checkPerformanceAlerts = (): void => {
  const alerts: Array<{id: string, message: string}> = []
  
  // High response time
  if (props.apiMetrics.averageResponseTime > 1000) {
    alerts.push({
      id: 'high-response-time',
      message: `High API response time: ${props.apiMetrics.averageResponseTime}ms`
    })
  }
  
  // Low cache hit rate
  if (props.apiMetrics.hitRate < 50 && props.apiMetrics.totalRequests > 10) {
    alerts.push({
      id: 'low-cache-hit',
      message: `Low cache hit rate: ${props.apiMetrics.hitRate}%`
    })
  }
  
  // High memory usage
  if (memoryUsage.value.used > memoryUsage.value.total * 0.8) {
    alerts.push({
      id: 'high-memory',
      message: 'High memory usage detected'
    })
  }
  
  // Too many DOM nodes
  if (domStats.value.nodeCount > 1000) {
    alerts.push({
      id: 'high-dom-nodes',
      message: `High DOM node count: ${domStats.value.nodeCount}`
    })
  }
  
  performanceAlerts.value = alerts
}

const updateChart = (): void => {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  // Add current response time to history
  responseTimeHistory.value.push(props.apiMetrics.averageResponseTime)
  if (responseTimeHistory.value.length > 50) {
    responseTimeHistory.value.shift()
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, chartCanvas.value.width, chartCanvas.value.height)
  
  // Draw chart
  if (responseTimeHistory.value.length > 1) {
    const width = chartCanvas.value.width
    const height = chartCanvas.value.height
    const maxValue = Math.max(...responseTimeHistory.value, 100)
    const stepX = width / (responseTimeHistory.value.length - 1)
    
    ctx.strokeStyle = '#0d6efd'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    responseTimeHistory.value.forEach((value, index) => {
      const x = index * stepX
      const y = height - (value / maxValue) * height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Draw grid
    ctx.strokeStyle = '#dee2e6'
    ctx.lineWidth = 1
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }
}

const startMonitoring = (): void => {
  if (updateTimer) clearInterval(updateTimer)
  if (chartUpdateTimer) clearInterval(chartUpdateTimer)
  
  updateTimer = setInterval(() => {
    if (autoUpdate.value) {
      updateMemoryUsage()
      updateDOMStats()
      checkPerformanceAlerts()
    }
  }, updateInterval.value)
  
  chartUpdateTimer = setInterval(() => {
    if (autoUpdate.value) {
      updateChart()
    }
  }, 2000)
}

const stopMonitoring = (): void => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
  if (chartUpdateTimer) {
    clearInterval(chartUpdateTimer)
    chartUpdateTimer = null
  }
}

const toggleAutoUpdate = (): void => {
  autoUpdate.value = !autoUpdate.value
  if (autoUpdate.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

const resetMetrics = (): void => {
  responseTimeHistory.value = []
  performanceAlerts.value = []
  memoryUsage.value = { used: 0, total: 0 }
  domStats.value = { nodeCount: 0 }
}

const exportMetrics = (): void => {
  const metrics = {
    timestamp: new Date().toISOString(),
    apiMetrics: props.apiMetrics,
    cacheStats: props.cacheStats,
    componentStats: props.componentStats,
    memoryUsage: memoryUsage.value,
    domStats: domStats.value,
    responseTimeHistory: responseTimeHistory.value,
    alerts: performanceAlerts.value
  }
  
  const blob = new Blob([JSON.stringify(metrics, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-metrics-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const clearCache = (): void => {
  // Emit event to clear application cache
  if (confirm('Clear application cache? This will reset all cached data.')) {
    // Clear browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    
    // Clear localStorage
    localStorage.clear()
    
    // Reload page
    window.location.reload()
  }
}

const runPerformanceTest = async (): Promise<void> => {
  const startTime = performance.now()
  
  // Simulate API calls
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const endTime = performance.now()
  const testDuration = endTime - startTime
  
  alert(`Performance test completed in ${testDuration.toFixed(2)}ms`)
}

// Utility methods
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString()
}

const getCacheHitRateClass = (rate: number): string => {
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-warning'
  return 'text-danger'
}

const getResponseTimeClass = (time: number): string => {
  if (time <= 200) return 'text-success'
  if (time <= 500) return 'text-warning'
  return 'text-danger'
}

const getRenderTimeClass = (time: number): string => {
  if (time <= 16) return 'text-success' // 60fps
  if (time <= 33) return 'text-warning' // 30fps
  return 'text-danger'
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  updateMemoryUsage()
  updateDOMStats()
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.metric-section {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
  height: 100%;
}

.metric-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.metric-content {
  font-size: 0.875rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
}

.metric-label {
  color: #6c757d;
  font-weight: 500;
}

.metric-value {
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.performance-chart {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
}

.debug-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .performance-monitor {
    position: relative;
    width: 100%;
    bottom: auto;
    right: auto;
    margin: 1rem;
  }
  
  .metric-section {
    padding: 0.75rem;
  }
  
  .performance-chart canvas {
    width: 100% !important;
    height: 150px !important;
  }
}
</style>