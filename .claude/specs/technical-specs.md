# Specifiche Tecniche - JBelt Doctor Web

## Architettura Applicazione

### Frontend Stack
- **Framework**: Nuxt 3.14+ con Vue.js 3
- **TypeScript**: Strict mode abilitato
- **State Management**: Pinia stores
- **HTTP Client**: Axios con interceptors
- **UI Framework**: Bootstrap 5 + Bootstrap Icons
- **Build Tool**: Vite
- **Package Manager**: pnpm 10.6.3+

### Backend Integration
- **API Base**: Spring Boot REST API
- **Authentication**: JWT Bearer tokens
- **Data Format**: JSON con entità JPA
- **File Upload**: Multipart form-data

## Specifiche API Integration

### Authentication Endpoints
```
POST /api/authenticate - Login
GET  /api/account - User info
POST /api/account/reset-password/init - Reset password
POST /api/account/reset-password/finish - Complete reset
POST /api/account/change-password - Change password
```

### CAD Entities Endpoints
```
# Models (Parts/Assemblies/Drawings)
GET    /api/models - Lista modelli
POST   /api/models - Crea modello
GET    /api/models/{id} - Dettaglio modello
PUT    /api/models/{id} - Aggiorna modello
DELETE /api/models/{id} - Elimina modello

# Sheets (Fogli tecnici)
GET    /api/sheets - Lista fogli
POST   /api/sheets - Crea foglio
GET    /api/sheets/{id} - Dettaglio foglio
PUT    /api/sheets/{id} - Aggiorna foglio
DELETE /api/sheets/{id} - Elimina foglio

# Associations (Relazioni Models-Sheets)
GET    /api/models/{id}/sheets - Fogli associati a modello
POST   /api/models/{id}/sheets - Associa fogli a modello
DELETE /api/models/{id}/sheets/{sheetId} - Rimuovi associazione
```

### Admin Endpoints
```
GET    /api/admin/users - Lista utenti (admin only)
POST   /api/admin/users - Crea utente
PUT    /api/admin/users/{id} - Aggiorna utente
DELETE /api/admin/users/{id} - Elimina utente
```

## Specifiche Componenti

### Composables Requirements
```typescript
// useApi.ts
interface ApiClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data: any): Promise<T>
  put<T>(url: string, data: any): Promise<T>
  delete<T>(url: string): Promise<T>
  setAuthToken(token: string): void
  clearAuthToken(): void
}

// useAuth.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login(credentials: LoginCredentials): Promise<void>
  logout(): void
  refreshUser(): Promise<void>
  resetPassword(email: string): Promise<void>
}
```

### State Management Schema
```typescript
// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Users Store (Admin)
interface UsersState {
  users: User[]
  currentUser: User | null
  isLoading: boolean
  error: string | null
}
```

## Specifiche Performance

### Loading Requirements
- Initial page load: < 2 secondi
- Route navigation: < 500ms
- API calls: < 1 secondo
- Large tables: Pagination obbligatoria

### Caching Strategy
- API responses: 5 minuti cache
- Static assets: Browser cache
- User session: localStorage persistence
- Component state: Reactive caching

### Bundle Size Targets
- Main bundle: < 500KB gzipped
- Vendor bundle: < 300KB gzipped
- Route chunks: < 100KB gzipped each

## Specifiche UI/UX

### Responsive Breakpoints
```scss
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);
```

### Design System
- **Colors**: Bootstrap 5 palette + custom brand colors
- **Typography**: System fonts stack
- **Spacing**: Bootstrap spacing utilities (0.25rem units)
- **Components**: Consistent Bootstrap component usage

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## Specifiche Security

### Client-Side Security
- XSS protection via Vue.js escaping
- CSRF protection via SameSite cookies
- Content Security Policy headers
- Secure token storage (httpOnly cookies preferred)

### Input Validation
- Client-side validation for UX
- Server-side validation as source of truth
- Sanitization of user inputs
- File upload restrictions

## Specifiche Testing

### Unit Testing
- Vue Test Utils per componenti
- Vitest come test runner
- Coverage target: > 80%

### Integration Testing
- API endpoint testing
- User flow testing
- Cross-browser compatibility

### Performance Testing
- Lighthouse CI integration
- Bundle analyzer
- Network throttling tests

## Specifiche Deployment

### Development Environment
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Type checking
pnpm run type-check
```

### Production Build
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Docker deployment
docker-compose up --build
```

### Environment Variables
```env
NUXT_PUBLIC_API_BASE=http://localhost:8080
NUXT_PUBLIC_API_HOST=localhost
NUXT_PUBLIC_API_PORT=8080
NUXT_DEBUG=false
```