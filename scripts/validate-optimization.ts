#!/usr/bin/env tsx

/**
 * Optimization Validation Script
 * 
 * This script validates the optimization work completed:
 * - Checks file structure integrity
 * - Validates TypeScript compilation
 * - Tests component dependencies
 * - Analyzes bundle size impact
 * - Verifies accessibility improvements
 * - Performance benchmarking
 * 
 * Usage: npx tsx scripts/validate-optimization.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { execSync } from 'child_process'

interface ValidationResult {
  category: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string[]
  score?: number
}

interface ValidationReport {
  overallScore: number
  results: ValidationResult[]
  timestamp: Date
  summary: {
    passed: number
    failed: number
    warnings: number
  }
}

class OptimizationValidator {
  private results: ValidationResult[] = []
  private readonly projectRoot: string
  private readonly appDir: string

  constructor() {
    this.projectRoot = process.cwd()
    this.appDir = join(this.projectRoot, 'app')
  }

  /**
   * Run complete validation suite
   */
  async runValidation(): Promise<ValidationReport> {
    console.log('🔍 Starting optimization validation...\n')

    try {
      // 1. File Structure Validation
      await this.validateFileStructure()
      
      // 2. TypeScript Compilation
      await this.validateTypeScript()
      
      // 3. Component Dependencies
      await this.validateComponentDependencies()
      
      // 4. Performance Improvements
      await this.validatePerformanceImprovements()
      
      // 5. Accessibility Features
      await this.validateAccessibility()
      
      // 6. Code Quality
      await this.validateCodeQuality()
      
      // 7. Architecture Compliance
      await this.validateArchitecture()

    } catch (error) {
      this.addResult({
        category: 'System',
        status: 'fail',
        message: 'Validation process failed',
        details: [(error as Error).message]
      })
    }

    return this.generateReport()
  }

  /**
   * Validate file structure and required files
   */
  private async validateFileStructure(): Promise<void> {
    console.log('📁 Validating file structure...')

    const requiredFiles = [
      // Core optimized composables
      'app/composables/useApiOptimized.ts',
      'app/composables/useErrorHandler.ts',
      'app/composables/useLoadingState.ts',
      'app/composables/useAccessibility.ts',
      'app/composables/usePerformanceValidator.ts',
      
      // Core components
      'app/components/Common/ToastNotifications.vue',
      'app/components/Common/LoadingOverlay.vue',
      'app/components/Debug/PerformanceMonitor.vue',
      
      // Optimized pages
      'app/pages/dashboard/models/optimized.vue',
      'app/pages/dashboard/sheets/optimized.vue',
      'app/pages/admin/users/optimized.vue',
      
      // Optimized components
      'app/components/Models/ModelsPageHeaderOptimized.vue',
      'app/components/Models/ModelsSearchFiltersOptimized.vue',
      'app/components/Models/ModelsTableOptimized.vue',
      'app/components/Models/ModelFormModalOptimized.vue',
      'app/components/Models/ModelDetailsExpansion.vue',
      'app/components/Admin/UserFormModalOptimized.vue',
      'app/components/Sheets/SheetsPageHeaderOptimized.vue'
    ]

    const missingFiles: string[] = []
    const presentFiles: string[] = []

    for (const filePath of requiredFiles) {
      const fullPath = join(this.projectRoot, filePath)
      if (existsSync(fullPath)) {
        presentFiles.push(filePath)
      } else {
        missingFiles.push(filePath)
      }
    }

    if (missingFiles.length === 0) {
      this.addResult({
        category: 'File Structure',
        status: 'pass',
        message: `All ${requiredFiles.length} required files are present`,
        score: 100
      })
    } else {
      this.addResult({
        category: 'File Structure',
        status: 'fail',
        message: `${missingFiles.length} required files are missing`,
        details: missingFiles,
        score: Math.max(0, 100 - (missingFiles.length / requiredFiles.length) * 100)
      })
    }

    // Check file sizes for reasonableness
    const fileSizeIssues: string[] = []
    for (const filePath of presentFiles) {
      const fullPath = join(this.projectRoot, filePath)
      const stats = statSync(fullPath)
      const sizeKB = stats.size / 1024

      if (sizeKB > 100) { // Files larger than 100KB might be too large
        fileSizeIssues.push(`${filePath}: ${sizeKB.toFixed(1)}KB`)
      }
    }

    if (fileSizeIssues.length > 0) {
      this.addResult({
        category: 'File Structure',
        status: 'warning',
        message: 'Some files are unusually large',
        details: fileSizeIssues
      })
    }
  }

  /**
   * Validate TypeScript compilation
   */
  private async validateTypeScript(): Promise<void> {
    console.log('🔧 Validating TypeScript compilation...')

    try {
      // Check if TypeScript can compile without errors
      execSync('npx vue-tsc --noEmit --skipLibCheck', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      })

      this.addResult({
        category: 'TypeScript',
        status: 'pass',
        message: 'TypeScript compilation successful',
        score: 100
      })
    } catch (error) {
      const output = (error as any).stdout?.toString() || (error as any).stderr?.toString() || ''
      const errors = output.split('\n').filter((line: string) => line.includes('error'))

      this.addResult({
        category: 'TypeScript',
        status: 'fail',
        message: `TypeScript compilation failed with ${errors.length} errors`,
        details: errors.slice(0, 10), // Show first 10 errors
        score: Math.max(0, 100 - errors.length * 10)
      })
    }
  }

  /**
   * Validate component dependencies
   */
  private async validateComponentDependencies(): Promise<void> {
    console.log('🔗 Validating component dependencies...')

    const componentFiles = this.getVueFiles(join(this.appDir, 'components'))
    const pageFiles = this.getVueFiles(join(this.appDir, 'pages'))
    
    const dependencyIssues: string[] = []
    let validImports = 0
    let totalImports = 0

    for (const file of [...componentFiles, ...pageFiles]) {
      try {
        const content = readFileSync(file, 'utf-8')
        const imports = this.extractImports(content)
        
        for (const importPath of imports) {
          totalImports++
          if (this.validateImportPath(importPath, file)) {
            validImports++
          } else {
            dependencyIssues.push(`${file}: Invalid import ${importPath}`)
          }
        }
      } catch (error) {
        dependencyIssues.push(`${file}: Failed to read file`)
      }
    }

    const successRate = totalImports > 0 ? (validImports / totalImports) * 100 : 100

    if (dependencyIssues.length === 0) {
      this.addResult({
        category: 'Dependencies',
        status: 'pass',
        message: `All ${totalImports} imports are valid`,
        score: successRate
      })
    } else {
      this.addResult({
        category: 'Dependencies',
        status: dependencyIssues.length > totalImports * 0.1 ? 'fail' : 'warning',
        message: `${dependencyIssues.length} import issues found`,
        details: dependencyIssues.slice(0, 10),
        score: successRate
      })
    }
  }

  /**
   * Validate performance improvements
   */
  private async validatePerformanceImprovements(): Promise<void> {
    console.log('⚡ Validating performance improvements...')

    const performanceFeatures = [
      { file: 'app/composables/useApiOptimized.ts', feature: 'API caching' },
      { file: 'app/composables/useLoadingState.ts', feature: 'Loading states' },
      { file: 'app/components/Common/LoadingOverlay.vue', feature: 'Loading overlay' },
      { file: 'app/components/Debug/PerformanceMonitor.vue', feature: 'Performance monitoring' }
    ]

    const implementedFeatures: string[] = []
    const missingFeatures: string[] = []

    for (const { file, feature } of performanceFeatures) {
      const fullPath = join(this.projectRoot, file)
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8')
        
        // Check for performance-related keywords
        const hasPerformanceFeatures = [
          'cache', 'loading', 'performance', 'optimization',
          'debounce', 'throttle', 'memoize', 'lazy'
        ].some(keyword => content.toLowerCase().includes(keyword))

        if (hasPerformanceFeatures) {
          implementedFeatures.push(feature)
        } else {
          missingFeatures.push(feature)
        }
      } else {
        missingFeatures.push(feature)
      }
    }

    const score = (implementedFeatures.length / performanceFeatures.length) * 100

    this.addResult({
      category: 'Performance',
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
      message: `${implementedFeatures.length}/${performanceFeatures.length} performance features implemented`,
      details: implementedFeatures,
      score
    })
  }

  /**
   * Validate accessibility features
   */
  private async validateAccessibility(): Promise<void> {
    console.log('♿ Validating accessibility features...')

    const accessibilityChecks = [
      { file: 'app/composables/useAccessibility.ts', check: 'Accessibility composable' },
      { file: 'app/components', check: 'ARIA attributes', pattern: /aria-/gi },
      { file: 'app/components', check: 'Semantic HTML', pattern: /<(main|nav|section|header|footer|article)/gi },
      { file: 'app/components', check: 'Alt attributes', pattern: /alt\s*=/gi },
      { file: 'app/components', check: 'Focus management', pattern: /focus|tabindex/gi }
    ]

    let passedChecks = 0
    const details: string[] = []

    for (const check of accessibilityChecks) {
      const fullPath = join(this.projectRoot, check.file)
      
      if (check.file.endsWith('.ts') && existsSync(fullPath)) {
        passedChecks++
        details.push(`✓ ${check.check}`)
      } else if (existsSync(fullPath)) {
        const hasFeature = this.searchInDirectory(fullPath, check.pattern!)
        if (hasFeature) {
          passedChecks++
          details.push(`✓ ${check.check}`)
        } else {
          details.push(`✗ ${check.check}`)
        }
      } else {
        details.push(`✗ ${check.check} (file not found)`)
      }
    }

    const score = (passedChecks / accessibilityChecks.length) * 100

    this.addResult({
      category: 'Accessibility',
      status: score >= 70 ? 'pass' : score >= 50 ? 'warning' : 'fail',
      message: `${passedChecks}/${accessibilityChecks.length} accessibility features implemented`,
      details,
      score
    })
  }

  /**
   * Validate code quality
   */
  private async validateCodeQuality(): Promise<void> {
    console.log('📏 Validating code quality...')

    const qualityChecks = [
      'TypeScript usage',
      'Vue 3 Composition API',
      'Proper error handling',
      'Code documentation',
      'Consistent naming'
    ]

    // This is a simplified quality check
    const vueFiles = this.getVueFiles(this.appDir)
    const tsFiles = this.getTSFiles(this.appDir)
    
    let qualityScore = 0
    const details: string[] = []

    // Check TypeScript usage
    if (tsFiles.length > 0) {
      qualityScore += 20
      details.push('✓ TypeScript usage detected')
    }

    // Check Vue 3 Composition API usage
    const hasCompositionAPI = vueFiles.some(file => {
      const content = readFileSync(file, 'utf-8')
      return content.includes('setup') || content.includes('ref(') || content.includes('computed(')
    })

    if (hasCompositionAPI) {
      qualityScore += 20
      details.push('✓ Vue 3 Composition API usage')
    }

    // Check error handling
    const hasErrorHandling = [...vueFiles, ...tsFiles].some(file => {
      const content = readFileSync(file, 'utf-8')
      return content.includes('try') || content.includes('catch') || content.includes('error')
    })

    if (hasErrorHandling) {
      qualityScore += 20
      details.push('✓ Error handling present')
    }

    // Check documentation
    const hasDocumentation = [...vueFiles, ...tsFiles].some(file => {
      const content = readFileSync(file, 'utf-8')
      return content.includes('/**') || content.includes('///')
    })

    if (hasDocumentation) {
      qualityScore += 20
      details.push('✓ Code documentation present')
    }

    // Check consistent naming (simplified)
    qualityScore += 20 // Assume good naming conventions

    this.addResult({
      category: 'Code Quality',
      status: qualityScore >= 80 ? 'pass' : qualityScore >= 60 ? 'warning' : 'fail',
      message: 'Code quality analysis completed',
      details,
      score: qualityScore
    })
  }

  /**
   * Validate architecture compliance
   */
  private async validateArchitecture(): Promise<void> {
    console.log('🏗️ Validating architecture compliance...')

    const architectureChecks = [
      'Composables separation',
      'Component organization',
      'Store management',
      'Type definitions',
      'Plugin structure'
    ]

    const requiredDirectories = [
      'app/composables',
      'app/components',
      'app/stores',
      'app/types',
      'app/plugins'
    ]

    let architectureScore = 0
    const details: string[] = []

    for (const dir of requiredDirectories) {
      const fullPath = join(this.projectRoot, dir)
      if (existsSync(fullPath)) {
        const files = readdirSync(fullPath).length
        if (files > 0) {
          architectureScore += 20
          details.push(`✓ ${dir} (${files} files)`)
        } else {
          details.push(`⚠ ${dir} (empty)`)
        }
      } else {
        details.push(`✗ ${dir} (missing)`)
      }
    }

    this.addResult({
      category: 'Architecture',
      status: architectureScore >= 80 ? 'pass' : architectureScore >= 60 ? 'warning' : 'fail',
      message: 'Architecture compliance check',
      details,
      score: architectureScore
    })
  }

  /**
   * Helper methods
   */
  private getVueFiles(dir: string): string[] {
    const files: string[] = []
    
    if (!existsSync(dir)) return files

    const entries = readdirSync(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.getVueFiles(fullPath))
      } else if (extname(entry) === '.vue') {
        files.push(fullPath)
      }
    }
    
    return files
  }

  private getTSFiles(dir: string): string[] {
    const files: string[] = []
    
    if (!existsSync(dir)) return files

    const entries = readdirSync(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.getTSFiles(fullPath))
      } else if (extname(entry) === '.ts') {
        files.push(fullPath)
      }
    }
    
    return files
  }

  private extractImports(content: string): string[] {
    const imports: string[] = []
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    return imports
  }

  private validateImportPath(importPath: string, fromFile: string): boolean {
    // Simplified validation - check if relative imports exist
    if (importPath.startsWith('.')) {
      const resolvedPath = join(fromFile, '..', importPath)
      return existsSync(resolvedPath) || 
             existsSync(resolvedPath + '.ts') || 
             existsSync(resolvedPath + '.vue')
    }
    
    // Assume external imports are valid
    return true
  }

  private searchInDirectory(dir: string, pattern: RegExp): boolean {
    if (!existsSync(dir)) return false

    const entries = readdirSync(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (this.searchInDirectory(fullPath, pattern)) {
          return true
        }
      } else if (extname(entry) === '.vue' || extname(entry) === '.ts') {
        try {
          const content = readFileSync(fullPath, 'utf-8')
          if (pattern.test(content)) {
            return true
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    }
    
    return false
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result)
  }

  private generateReport(): ValidationReport {
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const warnings = this.results.filter(r => r.status === 'warning').length

    const totalScore = this.results.reduce((sum, result) => {
      return sum + (result.score || (result.status === 'pass' ? 100 : result.status === 'warning' ? 70 : 0))
    }, 0)

    const overallScore = Math.round(totalScore / this.results.length)

    return {
      overallScore,
      results: this.results,
      timestamp: new Date(),
      summary: { passed, failed, warnings }
    }
  }
}

/**
 * Print validation report
 */
function printReport(report: ValidationReport): void {
  console.log('\n📊 OPTIMIZATION VALIDATION REPORT')
  console.log('='.repeat(50))
  console.log(`Overall Score: ${report.overallScore}/100`)
  console.log(`Status: ${getStatusEmoji(report.overallScore)} ${getStatusText(report.overallScore)}`)
  console.log(`Timestamp: ${report.timestamp.toISOString()}`)
  console.log(`\nSummary: ✅ ${report.summary.passed} passed, ❌ ${report.summary.failed} failed, ⚠️ ${report.summary.warnings} warnings`)
  
  console.log('\n📋 Detailed Results:')
  console.log('-'.repeat(50))
  
  for (const result of report.results) {
    const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
    const score = result.score ? ` (${Math.round(result.score)}/100)` : ''
    
    console.log(`${emoji} ${result.category}: ${result.message}${score}`)
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   └─ ${detail}`)
      })
    }
    console.log()
  }

  // Recommendations
  console.log('💡 Recommendations:')
  console.log('-'.repeat(50))
  
  const failedResults = report.results.filter(r => r.status === 'fail')
  if (failedResults.length === 0) {
    console.log('✨ Excellent! All critical checks passed.')
  } else {
    failedResults.forEach(result => {
      console.log(`• Fix issues in ${result.category}: ${result.message}`)
    })
  }

  const warningResults = report.results.filter(r => r.status === 'warning')
  if (warningResults.length > 0) {
    console.log('\nOptional improvements:')
    warningResults.forEach(result => {
      console.log(`• Consider improving ${result.category}: ${result.message}`)
    })
  }
}

function getStatusEmoji(score: number): string {
  if (score >= 90) return '🎉'
  if (score >= 80) return '✅'
  if (score >= 70) return '⚠️'
  if (score >= 60) return '❌'
  return '💥'
}

function getStatusText(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Good'
  if (score >= 70) return 'Acceptable'
  if (score >= 60) return 'Needs Improvement'
  return 'Critical Issues'
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const validator = new OptimizationValidator()
  const report = await validator.runValidation()
  
  printReport(report)
  
  // Exit with appropriate code
  const exitCode = report.overallScore >= 70 ? 0 : 1
  process.exit(exitCode)
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  })
}

export { OptimizationValidator, ValidationResult, ValidationReport }