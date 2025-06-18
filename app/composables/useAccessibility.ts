/**
 * Accessibility Composable
 * 
 * Provides accessibility enhancements including:
 * - Focus management
 * - Screen reader support
 * - Keyboard navigation
 * - ARIA attributes management
 * - Color contrast validation
 * - Motion preferences
 * 
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface AccessibilityOptions {
  enableFocusManagement?: boolean
  enableKeyboardNavigation?: boolean
  enableScreenReaderSupport?: boolean
  announcePageChanges?: boolean
  respectMotionPreference?: boolean
}

interface FocusTarget {
  element: HTMLElement
  priority: number
  description?: string
}

interface AnnouncementOptions {
  priority?: 'polite' | 'assertive'
  delay?: number
  clear?: boolean
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableFocusManagement = true,
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    announcePageChanges = true,
    respectMotionPreference = true
  } = options

  // State
  const focusHistory = ref<HTMLElement[]>([])
  const currentFocusTarget = ref<HTMLElement | null>(null)
  const isHighContrastMode = ref(false)
  const isReducedMotion = ref(false)
  const screenReaderActive = ref(false)
  const keyboardNavigation = ref(false)

  // ARIA live region for announcements
  let liveRegion: HTMLElement | null = null
  let politeRegion: HTMLElement | null = null

  /**
   * Initialize accessibility features
   */
  const initializeAccessibility = (): void => {
    if (typeof window === 'undefined') return

    // Detect accessibility preferences
    detectAccessibilityPreferences()
    
    // Setup ARIA live regions
    if (enableScreenReaderSupport) {
      setupLiveRegions()
    }
    
    // Setup keyboard navigation
    if (enableKeyboardNavigation) {
      setupKeyboardNavigation()
    }
    
    // Setup focus management
    if (enableFocusManagement) {
      setupFocusManagement()
    }

    // Add accessibility event listeners
    addEventListeners()
  }

  /**
   * Detect user accessibility preferences
   */
  const detectAccessibilityPreferences = (): void => {
    // Detect reduced motion preference
    if (respectMotionPreference) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      isReducedMotion.value = mediaQuery.matches
      
      mediaQuery.addEventListener('change', (e) => {
        isReducedMotion.value = e.matches
        applyMotionPreferences()
      })
    }

    // Detect high contrast mode
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    isHighContrastMode.value = highContrastQuery.matches
    
    highContrastQuery.addEventListener('change', (e) => {
      isHighContrastMode.value = e.matches
      applyContrastPreferences()
    })

    // Detect screen reader usage
    detectScreenReader()
  }

  /**
   * Setup ARIA live regions for announcements
   */
  const setupLiveRegions = (): void => {
    // Assertive region for important announcements
    liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'assertive')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('class', 'sr-only')
    liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(liveRegion)

    // Polite region for less important announcements
    politeRegion = document.createElement('div')
    politeRegion.setAttribute('aria-live', 'polite')
    politeRegion.setAttribute('aria-atomic', 'true')
    politeRegion.setAttribute('class', 'sr-only')
    politeRegion.style.cssText = liveRegion.style.cssText
    document.body.appendChild(politeRegion)
  }

  /**
   * Setup keyboard navigation
   */
  const setupKeyboardNavigation = (): void => {
    document.addEventListener('keydown', handleKeyboardNavigation)
    
    // Detect keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        keyboardNavigation.value = true
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      keyboardNavigation.value = false
      document.body.classList.remove('keyboard-navigation')
    })
  }

  /**
   * Setup focus management
   */
  const setupFocusManagement = (): void => {
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement
      if (target && target !== currentFocusTarget.value) {
        if (currentFocusTarget.value) {
          focusHistory.value.push(currentFocusTarget.value)
        }
        currentFocusTarget.value = target
      }
    })

    // Limit focus history length
    const maxHistoryLength = 10
    if (focusHistory.value.length > maxHistoryLength) {
      focusHistory.value = focusHistory.value.slice(-maxHistoryLength)
    }
  }

  /**
   * Handle keyboard navigation
   */
  const handleKeyboardNavigation = (e: KeyboardEvent): void => {
    // Escape key handling
    if (e.key === 'Escape') {
      handleEscapeKey()
    }

    // Skip link handling (Ctrl/Cmd + /)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      showSkipLinks()
    }

    // Focus management shortcuts
    if (e.altKey) {
      switch (e.key) {
        case 'h':
          e.preventDefault()
          focusFirstHeading()
          break
        case 'm':
          e.preventDefault()
          focusMainContent()
          break
        case 'n':
          e.preventDefault()
          focusNavigation()
          break
      }
    }
  }

  /**
   * Announce message to screen readers
   */
  const announce = (message: string, options: AnnouncementOptions = {}): void => {
    if (!enableScreenReaderSupport || !message.trim()) return

    const {
      priority = 'polite',
      delay = 100,
      clear = true
    } = options

    const region = priority === 'assertive' ? liveRegion : politeRegion
    if (!region) return

    if (clear) {
      region.textContent = ''
    }

    setTimeout(() => {
      region.textContent = message
    }, delay)

    // Clear after announcement
    setTimeout(() => {
      region.textContent = ''
    }, delay + 5000)
  }

  /**
   * Focus management utilities
   */
  const focusElement = async (selector: string | HTMLElement, options = { scroll: true }): Promise<boolean> => {
    await nextTick()
    
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector

    if (!element) return false

    try {
      element.focus({ preventScroll: !options.scroll })
      
      if (options.scroll) {
        element.scrollIntoView({ 
          behavior: isReducedMotion.value ? 'auto' : 'smooth',
          block: 'center'
        })
      }

      return true
    } catch (error) {
      console.warn('Failed to focus element:', error)
      return false
    }
  }

  const focusPrevious = (): boolean => {
    const previous = focusHistory.value.pop()
    if (previous && document.contains(previous)) {
      return focusElement(previous)
    }
    return false
  }

  const focusFirstHeading = (): void => {
    const heading = document.querySelector('h1, h2, h3, h4, h5, h6') as HTMLElement
    if (heading) {
      focusElement(heading)
      announce(`Focused on heading: ${heading.textContent}`)
    }
  }

  const focusMainContent = (): void => {
    const main = document.querySelector('main, [role="main"], #main-content') as HTMLElement
    if (main) {
      focusElement(main)
      announce('Focused on main content')
    }
  }

  const focusNavigation = (): void => {
    const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement
    if (nav) {
      focusElement(nav)
      announce('Focused on navigation')
    }
  }

  /**
   * Skip links functionality
   */
  const showSkipLinks = (): void => {
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `
    
    // Style skip links
    skipLinksContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      background: #000;
      padding: 1rem;
    `

    document.body.appendChild(skipLinksContainer)
    
    const firstLink = skipLinksContainer.querySelector('a') as HTMLElement
    if (firstLink) {
      firstLink.focus()
    }

    // Remove after use
    setTimeout(() => {
      skipLinksContainer.remove()
    }, 10000)
  }

  /**
   * Handle escape key behavior
   */
  const handleEscapeKey = (): void => {
    // Close modals, dropdowns, etc.
    const activeModal = document.querySelector('.modal.show, [role="dialog"][aria-hidden="false"]')
    if (activeModal) {
      const closeButton = activeModal.querySelector('[data-bs-dismiss="modal"], .btn-close') as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
      return
    }

    // Close dropdowns
    const activeDropdown = document.querySelector('.dropdown-menu.show')
    if (activeDropdown) {
      const dropdown = activeDropdown.closest('.dropdown')
      const trigger = dropdown?.querySelector('[data-bs-toggle="dropdown"]') as HTMLElement
      if (trigger) {
        trigger.click()
        trigger.focus()
      }
      return
    }

    // Return to previous focus
    focusPrevious()
  }

  /**
   * Apply motion preferences
   */
  const applyMotionPreferences = (): void => {
    if (isReducedMotion.value) {
      document.documentElement.style.setProperty('--animation-duration', '0ms')
      document.documentElement.style.setProperty('--transition-duration', '0ms')
      document.body.classList.add('reduced-motion')
    } else {
      document.documentElement.style.removeProperty('--animation-duration')
      document.documentElement.style.removeProperty('--transition-duration')
      document.body.classList.remove('reduced-motion')
    }
  }

  /**
   * Apply contrast preferences
   */
  const applyContrastPreferences = (): void => {
    if (isHighContrastMode.value) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }

  /**
   * Detect screen reader usage
   */
  const detectScreenReader = (): void => {
    // Simple detection based on user agent and accessibility APIs
    const userAgent = navigator.userAgent.toLowerCase()
    const hasScreenReaderIndicators = 
      userAgent.includes('nvda') ||
      userAgent.includes('jaws') ||
      userAgent.includes('dragon') ||
      'speechSynthesis' in window

    screenReaderActive.value = hasScreenReaderIndicators

    // Listen for screen reader events
    document.addEventListener('focusin', () => {
      if (document.activeElement?.getAttribute('aria-describedby')) {
        screenReaderActive.value = true
      }
    })
  }

  /**
   * Validate color contrast
   */
  const validateContrast = (foreground: string, background: string): { ratio: number, isValid: boolean } => {
    const getLuminance = (color: string): number => {
      // Simple luminance calculation
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      isValid: ratio >= 4.5 // WCAG AA standard
    }
  }

  /**
   * Add event listeners
   */
  const addEventListeners = (): void => {
    // Route change announcements
    if (announcePageChanges && 'navigation' in window) {
      window.addEventListener('popstate', () => {
        setTimeout(() => {
          const title = document.title
          announce(`Navigated to ${title}`, { priority: 'assertive' })
        }, 100)
      })
    }
  }

  /**
   * Remove event listeners
   */
  const removeEventListeners = (): void => {
    document.removeEventListener('keydown', handleKeyboardNavigation)
    
    if (liveRegion) {
      document.body.removeChild(liveRegion)
      liveRegion = null
    }
    
    if (politeRegion) {
      document.body.removeChild(politeRegion)
      politeRegion = null
    }
  }

  // Initialize on mount
  onMounted(() => {
    initializeAccessibility()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    removeEventListeners()
  })

  return {
    // State
    isHighContrastMode: readonly(isHighContrastMode),
    isReducedMotion: readonly(isReducedMotion),
    screenReaderActive: readonly(screenReaderActive),
    keyboardNavigation: readonly(keyboardNavigation),
    
    // Methods
    announce,
    focusElement,
    focusPrevious,
    focusFirstHeading,
    focusMainContent,
    focusNavigation,
    validateContrast,
    showSkipLinks,
    
    // Utilities
    applyMotionPreferences,
    applyContrastPreferences,
    detectAccessibilityPreferences
  }
}

export type AccessibilityComposable = ReturnType<typeof useAccessibility>