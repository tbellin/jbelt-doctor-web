# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt.js 3 frontend application for JBelt Doctor Web, a CAD/PLM management system with multilingual admin dashboard, JWT authentication, and PTC Creo integration. The application manages Models (Parts/Assemblies/Drawings), Sheets, and their complex associations within a Spring Boot backend ecosystem. The project uses a custom directory structure with the `app/` folder as the source directory.

## Architecture

### Directory Structure
- `app/` - Main source directory (configured via `srcDir: 'app/'` in nuxt.config.ts)
- `app/components/` - Vue components organized by feature (Auth/, Dashboard/, Layout/, etc.)
- `app/composables/` - Vue composables for API interaction and state management
- `app/stores/` - Pinia stores for global state management
- `app/pages/` - File-based routing pages
- `app/layouts/` - Page layouts (auth, dashboard, default, maundy)
- `app/middleware/` - Route middleware (auth, admin, i18n)
- `app/i18n/` - Translation files (en/, it/)
- `app/plugins/` - Nuxt plugins

### Key Technologies
- **Framework**: Nuxt 3 with Vue.js 3 and TypeScript (SSR disabled)
- **Package Manager**: pnpm 10.6.3+ (specified in packageManager field)
- **State Management**: Pinia stores
- **HTTP Client**: Axios (configured in plugins/axios.ts)
- **UI Framework**: Bootstrap 5 with Bootstrap Icons and Flag Icons
- **Internationalization**: Custom i18n implementation supporting EN/IT
- **Authentication**: JWT-based with Spring Boot backend
- **File Processing**: xlsx for data export/import
- **CAD Integration**: Models/Sheets/Drawings management with PTC Creo backend

### Authentication Architecture
- JWT tokens stored in localStorage
- Pinia auth store (`stores/auth.ts`) manages authentication state
- `useAuth` composable provides authentication methods
- Protected routes via auth middleware
- Role-based access control (ROLE_USER, ROLE_ADMIN)

## Development Commands

### Setup
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Clean development (remove .output .nuxt)
pnpm run dev:clean

# Debug mode with detailed logging
pnpm run dev:debug

# Build for production
pnpm build

# Generate static site
pnpm generate

# Preview production build
pnpm preview
```

### Testing and Code Quality
⚠️ **Testing Infrastructure Not Configured** - The project currently lacks automated testing frameworks. Manual testing is documented in `COMPLETE_TESTING_GUIDE.md`.

**Available Testing Utilities:**
```bash
# Manual backend testing
node app/utils/testBackend.ts

# Architecture validation
pnpm dlx tsx scripts/validate-optimization.ts

# Integration testing with Docker
./test-ubuntu-local.sh
```

**Debug and Monitoring Tools:**
```bash
# Enable debug mode for detailed API logging
NUXT_DEBUG=true pnpm dev

# Access debug panel at /panel in development
# Export debug reports from browser console
```

### Using Makefile
```bash
# Development environment
make dev          # Start with hot-reload
make dev-build    # Rebuild and start
make dev-down     # Stop development

# Production environment
make prod         # Start production
make prod-build   # Rebuild and start production
make prod-down    # Stop production

# Utilities
make logs         # View logs
make prune        # Clean unused containers
```

### Docker Development
```bash
# Create required network (one-time setup)
docker network create jbelt-network

# Development with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose -f docker-compose.production.yml up --build -d

# Ubuntu/Plesk deployment
docker-compose -f docker-compose.ubuntu.yml up --build -d

# Run with helper script
./run-docker.sh dev        # Development mode
./run-docker.sh prod       # Production mode

# Platform-specific deployment
./deploy-mac.sh           # Mac development
./deploy-ubuntu.sh        # Ubuntu production
```

## Configuration

### Environment Variables
The application uses runtime config with these defaults:
- `NUXT_PUBLIC_API_BASE`: Backend API URL (default: `http://jbelt:8080`)
- `NUXT_PUBLIC_API_HOST`: API host (default: `jbelt.org`)
- `NUXT_PUBLIC_API_PORT`: API port (default: `8080`)
- `NUXT_PUBLIC_FRONTEND_HOST`: Frontend host (default: `localhost`)
- `NUXT_PUBLIC_FRONTEND_PORT`: Frontend port (default: `3000`)
- `NUXT_DEBUG`: Enable debug mode (default: `false`)

### Multi-Environment Setup
The project supports three distinct deployment environments:

**Development (Mac - atlante.local):**
```bash
NUXT_PUBLIC_FRONTEND_HOST=atlante.local
NUXT_PUBLIC_API_BASE=http://atlante.local
CHOKIDAR_USEPOLLING=true
NUXT_DEBUG=true
```

**Production (Docker):**
```bash
NUXT_PUBLIC_FRONTEND_HOST=localhost
NUXT_PUBLIC_API_BASE=http://localhost
NODE_ENV=production
```

**Ubuntu/Plesk (jbelt.org):**
```bash
NUXT_PUBLIC_FRONTEND_HOST=jbelt.org
NUXT_PUBLIC_API_BASE=https://jbelt.org
SSL_ENABLED=true
```

### Debug Mode
Set `NUXT_DEBUG=true` to enable:
- Detailed console logging in auth and API operations
- Mock authentication utilities
- Token display in development
- API request/response logging
- Performance monitoring tools

## API Integration

### Backend Integration
- Spring Boot backend API at configured base URL
- JWT authentication via `/api/authenticate` endpoint
- User data fetched from `/api/account` endpoint
- Password operations via `/api/account/reset-password/*` and `/api/account/change-password`

### Key Composables
- `useAuth()` - Authentication operations and state
- `useApi()` - HTTP client with JWT token injection
- `useI18n()` - Internationalization utilities
- `useUsers()` - User management operations (admin)
- `useDrawings()` - CAD Models/Drawings/Sheets data operations
- `useDebug()` - Debug utilities and mock authentication

## Internationalization

The application supports multiple languages with custom i18n implementation:
- Translation files in `app/i18n/{locale}/` directories
- Middleware handles locale detection and routing
- Currently supports EN and IT locales
- Language switcher component available

## Key Features

### CAD/PLM Management System
- **Models Management**: Parts, Assemblies, Drawings with hierarchical relationships
- **Sheets Management**: Technical drawings with DIN format standards (A0-A4)
- **Association System**: Complex many-to-many relationships between Models and Sheets
- **Data Completeness**: Validation and enrichment of partial objects from backend
- **Creo Integration**: PTC Creo Parametric ID mapping and file references

### Authentication System
- Login/logout functionality
- Password reset flow (init/finish)
- Password change for authenticated users
- Remember me functionality
- Admin role detection

### Admin Features
- User management (`/admin/users/listUsers`)
- Role-based access control
- Admin-only routes protected by middleware

### Responsive Design
- Bootstrap 5 responsive grid
- Mobile-first approach
- Dashboard layout for authenticated users
- Separate Maundy theme/layout

## Important File Patterns

### Component Organization
- `components/Auth/` - Authentication-related components
- `components/Dashboard/` - Dashboard UI components
- `components/Admin/` - Admin panel components
- `components/Layout/` - Layout components (header, footer, etc.)
- `components/Models/` - CAD Models management (tables, modals, associations)
- `components/Sheets/` - Sheets management (forms, views, search)
- `components/Debug/` - Development and debugging utilities

### Route Protection
Protected routes use middleware:
```javascript
// In page files
definePageMeta({
  middleware: 'auth' // or 'admin'
})
```

### State Management
Use Pinia stores for complex state:
```javascript
// Access auth state
const { isAuthenticated, user, login } = useAuth()

// Direct store access
const authStore = useAuthStore()
```

## Docker Configuration

The project uses a sophisticated multi-environment Docker setup:

### Container Architecture
- **Base image**: `node:lts-alpine`
- **Network**: External `jbelt-network` (shared across services)
- **Package Manager**: pnpm 10.6.3+
- **Multi-stage builds**: Separate development and production configurations

### Development Environment
- **File**: `docker-compose.dev.yml` with `Dockerfile.dev`
- **Features**: Hot reload, volume mounting, nginx reverse proxy
- **Ports**: 3000 (frontend), 80 (nginx proxy)
- **API Routing**: nginx proxy routes `/api/*` to `host.docker.internal:8080`

### Production Environment
- **File**: `docker-compose.production.yml` with `Dockerfile.production`
- **Features**: Multi-stage build, static file serving, full backend stack
- **Services**: Frontend (nginx), Backend (Spring Boot), Database (PostgreSQL), PgAdmin
- **Ports**: 80/443 (nginx), 8080 (backend), 5432 (postgres), 5050 (pgadmin)

### Ubuntu/Plesk Deployment
- **File**: `docker-compose.ubuntu.yml` with `Dockerfile.ubuntu`
- **Features**: SSL/TLS, Let's Encrypt, HTTPS redirects, production optimizations
- **Domain**: jbelt.org with proper SSL certificates

### Volume Strategy
```yaml
# Development
- .:/usr/src/app                    # Live code mounting
- /usr/src/app/node_modules         # Node modules cache

# Production  
- jbelt-map-data:/app/resources     # Backend data
- postgres_data:/var/lib/postgresql/data  # Database
- ./nginx/ssl:/etc/nginx/ssl:ro     # SSL certificates
- ./backups:/backups                # Database backups
```

## Common Development Patterns

### Adding New Pages
1. Create page file in `app/pages/`
2. Add necessary middleware if authentication required
3. Update navigation in layout components
4. Add translations to i18n files

### Adding API Endpoints
1. Add methods to relevant composable (e.g., `useApi`)
2. Update store if state management needed
3. Handle loading/error states
4. Add proper TypeScript types

### Working with CAD Data Models
Key entity classes with validation:
```javascript
// Import entity classes
import { Model, Sheet } from '@/types/'

// Validate data completeness
const model = new Model(apiData)
if (model.isComplete()) {
  // Work with complete object
}

// Enrich partial objects
const enrichedModel = enrichModel(partialModel, completeData)
```

### Testing Authentication
Debug mode provides utilities:
```javascript
const { simulateAuth, resetAuth } = useAuth()
// Only available when NUXT_DEBUG=true
```

## CAD Data Architecture

### Core Entities
- **Model**: Parts (`PART`), Assemblies (`ASSEMBLY`), Drawings (`DRAWING`), Formats (`FORMAT`)
- **Sheet**: Technical drawing sheets with DIN format standards
- **Associations**: Complex many-to-many relationships between Models and Sheets

### Key Relationships  
- Models ↔ Sheets: Many-to-many associations
- Drawing Models → Sheets: One-to-many references
- Parent-Child Models: Assembly hierarchies
- Generic-Instance Models: Template relationships

### Data Completeness System
- Backend may return partial objects (ID-only associations)
- Frontend validates and enriches incomplete data
- Classes provide validation methods (`isComplete`, `isPartialFromAssociation`)
- Clean object methods prevent circular references in API calls

## Excel Template System

The application includes a sophisticated Excel template system for data export/import:

### Template Engine
- **Location**: `app/utils/excel-template-engine.ts`
- **Properties Parser**: `app/utils/properties-parser.ts`
- **Configuration**: `excel.properties` file with coordinate mappings
- **Templates**: Stored in `public/templates/` and `app/assets/excel-templates/`

### Server API Endpoints
- **Template Validation**: `/api/checkTemplate.get.ts` 
- **Excel Generation**: `/api/generateExcel.post.ts`
- **Drawings Export**: `/api/generateExcelDrawings.post.ts`
- **Health Check**: `/api/health.get.ts`

### Usage Pattern
```javascript
// Generate Excel with template
const excelData = await $fetch('/api/generateExcel', {
  method: 'POST',
  body: { data: exportData, templateType: 'drawings' }
})
```

## Performance and Optimization

### Built-in Monitoring
- **Performance Validator**: `app/composables/usePerformanceValidator.ts`
- **API Optimization**: `app/composables/useApiOptimized.ts`
- **Loading States**: `app/composables/useLoadingState.ts`
- **Error Handling**: `app/composables/useErrorHandler.ts`

### Component Optimization
Many components have optimized versions:
- `ModelsTableOptimized.vue` vs `ModelsTable.vue`
- `SheetsTableOptimized.vue` vs `SheetsTable.vue`
- `ModelFormModalOptimized.vue` vs `ModelFormModal.vue`

### Accessibility Support
- **Composable**: `app/composables/useAccessibility.ts`
- **ARIA labels** and semantic HTML throughout components
- **Keyboard navigation** support
- **Screen reader** optimizations

## Entity Management System

The application manages complex CAD/PLM entities with full CRUD operations:

### Supported Entities
- **Models**: Parts, Assemblies, Drawings, Formats
- **Sheets**: Technical drawing sheets with DIN standards
- **Authors**: Design team members
- **Teams**: Organizational units
- **Markers**: Annotation system
- **Archives**: Document storage
- **Positions**: Spatial/assembly positioning
- **Items**: Generic catalog items
- **Balloons**: Drawing annotations
- **Notes**: Textual annotations
- **Trackers**: Progress monitoring

### Generic Entity Framework
- **Base Components**: `app/components/entities/shared/`
- **Entity API**: `app/components/entities/shared/composables/useEntityAPI.ts`
- **Form Handling**: `app/components/entities/shared/composables/useEntityForm.ts`
- **Consistent UI**: EntityCard, EntityForm, EntityModal, EntityTable

### Admin Interface
- **Entity Management**: `/admin/entities/` routes for all entity types
- **User Management**: `/admin/users/` with role-based access
- **Bulk Operations**: Import/export capabilities
- **Data Validation**: Client-side and server-side validation