/**
 * Performance Validator Composable
 * 
 * Provides performance monitoring and validation including:
 * - Lighthouse auditing simulation
 * - Core Web Vitals tracking
 * - Bundle size analysis
 * - Memory leak detection
 * - API performance monitoring
 * 
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstPaint?: number
  firstContentfulPaint?: number
  
  // Memory
  memoryUsed: number
  memoryTotal: number
  
  // Network
  networkRequests: number
  totalTransferSize: number
  
  // JavaScript
  jsExecutionTime: number
  bundleSize: number
}

interface PerformanceReport {
  score: number
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
  timestamp: Date
}

interface PerformanceIssue {
  type: 'critical' | 'warning' | 'info'
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo'
  message: string
  impact: 'high' | 'medium' | 'low'
  element?: string
  value?: number
  threshold?: number
}

interface PerformanceThresholds {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  memoryUsage: number
  bundleSize: number
}

export const usePerformanceValidator = () => {
  // State
  const isMonitoring = ref(false)
  const currentMetrics = ref<PerformanceMetrics>({
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    networkRequests: 0,
    totalTransferSize: 0,
    jsExecutionTime: 0,
    bundleSize: 0
  })
  
  const performanceHistory = ref<PerformanceReport[]>([])
  const performanceObserver = ref<PerformanceObserver | null>(null)
  
  // Thresholds based on Lighthouse scoring
  const thresholds: PerformanceThresholds = {
    lcp: 2500, // Good: ≤2.5s
    fid: 100,  // Good: ≤100ms
    cls: 0.1,  // Good: ≤0.1
    fcp: 1800, // Good: ≤1.8s
    ttfb: 600, // Good: ≤600ms
    memoryUsage: 0.8, // 80% of available memory
    bundleSize: 1000000 // 1MB
  }

  /**
   * Start performance monitoring
   */
  const startMonitoring = (): void => {
    if (typeof window === 'undefined' || isMonitoring.value) return
    
    isMonitoring.value = true
    
    // Setup Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      setupPerformanceObserver()
    }
    
    // Collect initial metrics
    collectInitialMetrics()
    
    // Monitor memory usage
    monitorMemoryUsage()
    
    // Monitor network performance
    monitorNetworkPerformance()
    
    console.log('🚀 Performance monitoring started')
  }

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = (): void => {
    if (!isMonitoring.value) return
    
    isMonitoring.value = false
    
    if (performanceObserver.value) {
      performanceObserver.value.disconnect()
      performanceObserver.value = null
    }
    
    console.log('⏹️ Performance monitoring stopped')
  }

  /**
   * Setup Performance Observer for Web Vitals
   */
  const setupPerformanceObserver = (): void => {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        currentMetrics.value.lcp = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          currentMetrics.value.fid = entry.processingStart - entry.startTime
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        currentMetrics.value.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-paint') {
            currentMetrics.value.firstPaint = entry.startTime
          } else if (entry.name === 'first-contentful-paint') {
            currentMetrics.value.fcp = entry.startTime
            currentMetrics.value.firstContentfulPaint = entry.startTime
          }
        })
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      // Navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          currentMetrics.value.navigationStart = entry.navigationStart || entry.startTime
          currentMetrics.value.domContentLoaded = entry.domContentLoadedEventEnd - entry.navigationStart
          currentMetrics.value.loadComplete = entry.loadEventEnd - entry.navigationStart
          currentMetrics.value.ttfb = entry.responseStart - entry.requestStart
        })
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })

      performanceObserver.value = lcpObserver // Store one for cleanup
      
    } catch (error) {
      console.warn('Failed to setup performance observer:', error)
    }
  }

  /**
   * Collect initial performance metrics
   */
  const collectInitialMetrics = (): void => {
    const navigation = performance.getEntriesByType('navigation')[0] as any
    
    if (navigation) {
      currentMetrics.value.navigationStart = navigation.navigationStart || navigation.startTime
      currentMetrics.value.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart
      currentMetrics.value.loadComplete = navigation.loadEventEnd - navigation.navigationStart
      currentMetrics.value.ttfb = navigation.responseStart - navigation.requestStart
    }

    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint')
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        currentMetrics.value.firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        currentMetrics.value.fcp = entry.startTime
        currentMetrics.value.firstContentfulPaint = entry.startTime
      }
    })
  }

  /**
   * Monitor memory usage
   */
  const monitorMemoryUsage = (): void => {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory
        currentMetrics.value.memoryUsed = memory.usedJSHeapSize
        currentMetrics.value.memoryTotal = memory.totalJSHeapSize
      }
      
      updateMemory()
      setInterval(updateMemory, 5000) // Update every 5 seconds
    }
  }

  /**
   * Monitor network performance
   */
  const monitorNetworkPerformance = (): void => {
    const updateNetworkStats = () => {
      const resources = performance.getEntriesByType('resource')
      currentMetrics.value.networkRequests = resources.length
      currentMetrics.value.totalTransferSize = resources.reduce((total: number, resource: any) => {
        return total + (resource.transferSize || 0)
      }, 0)
    }
    
    updateNetworkStats()
    setInterval(updateNetworkStats, 10000) // Update every 10 seconds
  }

  /**
   * Run performance audit
   */
  const runAudit = async (): Promise<PerformanceReport> => {
    const startTime = performance.now()
    
    // Collect current metrics
    const metrics = { ...currentMetrics.value }
    
    // Add JavaScript execution time
    metrics.jsExecutionTime = performance.now() - startTime
    
    // Estimate bundle size (simplified)
    metrics.bundleSize = estimateBundleSize()
    
    // Analyze performance issues
    const issues = analyzePerformanceIssues(metrics)
    
    // Generate recommendations
    const recommendations = generateRecommendations(issues)
    
    // Calculate overall score
    const score = calculatePerformanceScore(metrics, issues)
    
    const report: PerformanceReport = {
      score,
      metrics,
      issues,
      recommendations,
      timestamp: new Date()
    }
    
    // Add to history
    performanceHistory.value.push(report)
    
    // Keep only last 10 reports
    if (performanceHistory.value.length > 10) {
      performanceHistory.value = performanceHistory.value.slice(-10)
    }
    
    return report
  }

  /**
   * Analyze performance issues
   */
  const analyzePerformanceIssues = (metrics: PerformanceMetrics): PerformanceIssue[] => {
    const issues: PerformanceIssue[] = []

    // Largest Contentful Paint
    if (metrics.lcp && metrics.lcp > thresholds.lcp) {
      issues.push({
        type: metrics.lcp > thresholds.lcp * 2 ? 'critical' : 'warning',
        category: 'performance',
        message: 'Largest Contentful Paint is too slow',
        impact: 'high',
        value: metrics.lcp,
        threshold: thresholds.lcp
      })
    }

    // First Input Delay
    if (metrics.fid && metrics.fid > thresholds.fid) {
      issues.push({
        type: metrics.fid > thresholds.fid * 3 ? 'critical' : 'warning',
        category: 'performance',
        message: 'First Input Delay is too high',
        impact: 'high',
        value: metrics.fid,
        threshold: thresholds.fid
      })
    }

    // Cumulative Layout Shift
    if (metrics.cls && metrics.cls > thresholds.cls) {
      issues.push({
        type: metrics.cls > thresholds.cls * 2.5 ? 'critical' : 'warning',
        category: 'performance',
        message: 'Cumulative Layout Shift is too high',
        impact: 'medium',
        value: metrics.cls,
        threshold: thresholds.cls
      })
    }

    // First Contentful Paint
    if (metrics.fcp && metrics.fcp > thresholds.fcp) {
      issues.push({
        type: metrics.fcp > thresholds.fcp * 2 ? 'critical' : 'warning',
        category: 'performance',
        message: 'First Contentful Paint is too slow',
        impact: 'medium',
        value: metrics.fcp,
        threshold: thresholds.fcp
      })
    }

    // Time to First Byte
    if (metrics.ttfb && metrics.ttfb > thresholds.ttfb) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'Time to First Byte is slow',
        impact: 'medium',
        value: metrics.ttfb,
        threshold: thresholds.ttfb
      })
    }

    // Memory usage
    const memoryUsageRatio = metrics.memoryUsed / metrics.memoryTotal
    if (memoryUsageRatio > thresholds.memoryUsage) {
      issues.push({
        type: memoryUsageRatio > 0.9 ? 'critical' : 'warning',
        category: 'performance',
        message: 'High memory usage detected',
        impact: 'high',
        value: memoryUsageRatio,
        threshold: thresholds.memoryUsage
      })
    }

    // Bundle size
    if (metrics.bundleSize > thresholds.bundleSize) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'Bundle size is large',
        impact: 'medium',
        value: metrics.bundleSize,
        threshold: thresholds.bundleSize
      })
    }

    // Network requests
    if (metrics.networkRequests > 100) {
      issues.push({
        type: 'info',
        category: 'performance',
        message: 'High number of network requests',
        impact: 'low',
        value: metrics.networkRequests,
        threshold: 100
      })
    }

    return issues
  }

  /**
   * Generate performance recommendations
   */
  const generateRecommendations = (issues: PerformanceIssue[]): string[] => {
    const recommendations: string[] = []
    
    issues.forEach((issue) => {
      switch (issue.message) {
        case 'Largest Contentful Paint is too slow':
          recommendations.push('Optimize images and defer non-critical resources')
          recommendations.push('Use a Content Delivery Network (CDN)')
          break
        case 'First Input Delay is too high':
          recommendations.push('Minimize main thread work')
          recommendations.push('Reduce JavaScript execution time')
          break
        case 'Cumulative Layout Shift is too high':
          recommendations.push('Set explicit dimensions for images and videos')
          recommendations.push('Avoid inserting content above existing content')
          break
        case 'First Contentful Paint is too slow':
          recommendations.push('Optimize critical rendering path')
          recommendations.push('Minimize render-blocking resources')
          break
        case 'Time to First Byte is slow':
          recommendations.push('Optimize server response times')
          recommendations.push('Use server-side caching')
          break
        case 'High memory usage detected':
          recommendations.push('Check for memory leaks')
          recommendations.push('Optimize component lifecycle management')
          break
        case 'Bundle size is large':
          recommendations.push('Enable code splitting')
          recommendations.push('Remove unused dependencies')
          break
        case 'High number of network requests':
          recommendations.push('Bundle CSS and JavaScript files')
          recommendations.push('Use HTTP/2 server push')
          break
      }
    })
    
    // Remove duplicates
    return [...new Set(recommendations)]
  }

  /**
   * Calculate performance score (0-100)
   */
  const calculatePerformanceScore = (metrics: PerformanceMetrics, issues: PerformanceIssue[]): number => {
    let score = 100
    
    // Deduct points for issues
    issues.forEach((issue) => {
      switch (issue.type) {
        case 'critical':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 3
          break
      }
    })
    
    // Bonus for good metrics
    if (metrics.lcp && metrics.lcp <= thresholds.lcp * 0.8) score += 2
    if (metrics.fid && metrics.fid <= thresholds.fid * 0.8) score += 2
    if (metrics.cls && metrics.cls <= thresholds.cls * 0.8) score += 2
    if (metrics.fcp && metrics.fcp <= thresholds.fcp * 0.8) score += 2
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Estimate bundle size (simplified)
   */
  const estimateBundleSize = (): number => {
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    scripts.forEach((script: any) => {
      // This is a rough estimation
      if (script.src && script.src.includes('_nuxt')) {
        totalSize += 200000 // Estimate 200KB per bundle
      }
    })
    
    return totalSize || 500000 // Default estimate
  }

  /**
   * Get performance grade
   */
  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * Export performance data
   */
  const exportPerformanceData = (): void => {
    const data = {
      currentMetrics: currentMetrics.value,
      history: performanceHistory.value,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-data-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Initialize monitoring on mount
  onMounted(() => {
    startMonitoring()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    isMonitoring: readonly(isMonitoring),
    currentMetrics: readonly(currentMetrics),
    performanceHistory: readonly(performanceHistory),
    thresholds: readonly(thresholds),
    
    // Methods
    startMonitoring,
    stopMonitoring,
    runAudit,
    getPerformanceGrade,
    exportPerformanceData,
    
    // Utilities
    analyzePerformanceIssues,
    generateRecommendations,
    calculatePerformanceScore
  }
}

export type PerformanceValidatorComposable = ReturnType<typeof usePerformanceValidator>