#!/bin/bash
set -e

# Script per testare la configurazione Ubuntu localmente
# Simula l'ambiente di produzione usando jbelt.local invece di jbelt.org

echo "🧪 Testing Ubuntu production configuration locally..."

# Configuration
COMPOSE_FILE="docker-compose.ubuntu.yml"
ENV_FILE=".env.ubuntu.local"
PROJECT_NAME="jbelt-ubuntu-test"
TEST_DOMAIN="jbelt.local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create test environment file
create_test_env() {
    print_status "Creating test environment file..."
    
    cat > .env.ubuntu.local << EOF
# Environment configuration per test Ubuntu locale
# Frontend: jbelt.local:80, API: jbelt.local:8080

# Node environment
NODE_ENV=production

# Frontend configuration
NUXT_PUBLIC_FRONTEND_HOST=jbelt.local
NUXT_PUBLIC_FRONTEND_PORT=80

# API configuration (tramite reverse proxy nginx)
NUXT_PUBLIC_API_BASE=http://jbelt.local
NUXT_PUBLIC_API_HOST=jbelt.local
NUXT_PUBLIC_API_PORT=80

# Production settings
NUXT_DEBUG=false

# Build optimization
NODE_OPTIONS=--max-old-space-size=4096

# SSL/Security (disabled for local test)
SSL_ENABLED=false
EOF

    print_success "Test environment file created"
}

# Setup /etc/hosts entry for jbelt.local
setup_hosts() {
    print_status "Setting up /etc/hosts entry for jbelt.local..."
    
    if ! grep -q "jbelt.local" /etc/hosts; then
        print_status "Adding jbelt.local to /etc/hosts..."
        echo "127.0.0.1 jbelt.local" | sudo tee -a /etc/hosts
        print_success "Added jbelt.local to /etc/hosts"
    else
        print_status "jbelt.local already exists in /etc/hosts"
    fi
}

# Create test nginx configuration
create_test_nginx() {
    print_status "Creating test nginx configuration..."
    
    mkdir -p nginx/test
    
    cat > nginx/test/ubuntu-local.conf << 'EOF'
# Nginx configuration per test Ubuntu locale (HTTP only)
# Frontend: jbelt.local:80 → Static files
# API: jbelt.local:80/api → localhost:8080

upstream backend_api {
    server host.docker.internal:8080;
}

server {
    listen 80;
    server_name jbelt.local localhost;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache headers per static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Disable cache for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }
    }

    # API proxy verso backend (porta 8080)
    location /api/ {
        # CORS per test locale
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://jbelt.local' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, X-Requested-With' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 1728000 always;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        proxy_pass http://backend_api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # CORS headers per tutte le risposte
        add_header 'Access-Control-Allow-Origin' 'http://jbelt.local' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Management endpoints
    location /management/ {
        proxy_pass http://backend_api/management/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

    print_success "Test nginx configuration created"
}

# Create test docker-compose
create_test_compose() {
    print_status "Creating test docker-compose..."
    
    cat > docker-compose.ubuntu.test.yml << 'EOF'
# Docker Compose per test Ubuntu locale
version: '3.8'

name: jbelt-ubuntu-test

services:
  frontend-prod:
    build:
      context: .
      dockerfile: Dockerfile.ubuntu
    container_name: jbelt-frontend-ubuntu-test
    environment:
      - NODE_ENV=${NODE_ENV}
      - NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
      - NUXT_PUBLIC_API_HOST=${NUXT_PUBLIC_API_HOST}
      - NUXT_PUBLIC_API_PORT=${NUXT_PUBLIC_API_PORT}
      - NUXT_PUBLIC_FRONTEND_HOST=${NUXT_PUBLIC_FRONTEND_HOST}
      - NUXT_PUBLIC_FRONTEND_PORT=${NUXT_PUBLIC_FRONTEND_PORT}
      - NUXT_DEBUG=${NUXT_DEBUG}
      - NODE_OPTIONS=${NODE_OPTIONS}
    networks:
      - jbelt-network
    restart: unless-stopped

  nginx-ubuntu:
    image: nginx:alpine
    container_name: jbelt-nginx-ubuntu-test
    ports:
      - "80:80"
    volumes:
      - ./nginx/test/ubuntu-local.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend-prod
    networks:
      - jbelt-network
    restart: unless-stopped

networks:
  jbelt-network:
    external: true
    name: jbelt-network
EOF

    print_success "Test docker-compose created"
}

# Run tests
run_tests() {
    print_status "Testing Ubuntu production configuration..."
    
    sleep 30  # Wait for services to start
    
    echo ""
    print_status "1. Testing HTTP frontend..."
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://jbelt.local/ 2>/dev/null)
    if [ "$http_code" = "200" ]; then
        print_success "✅ HTTP frontend accessible (HTTP $http_code)"
    else
        print_error "❌ HTTP frontend not accessible (HTTP $http_code)"
    fi
    
    print_status "2. Testing API proxy..."
    api_code=$(curl -s -o /dev/null -w "%{http_code}" http://jbelt.local/api/management/health 2>/dev/null)
    if [ "$api_code" = "200" ]; then
        print_success "✅ API proxy working (HTTP $api_code)"
    elif [ "$api_code" = "401" ]; then
        print_warning "⚠️ API proxy working but requires authentication (HTTP $api_code) - this is normal"
    else
        print_error "❌ API proxy not responding (HTTP $api_code) - check if backend is running"
    fi
    
    print_status "3. Testing JWT login..."
    login_response=$(curl -s -X POST http://jbelt.local/api/authenticate \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin","rememberMe":false}' 2>/dev/null)
    
    if echo "$login_response" | grep -q "id_token"; then
        print_success "✅ JWT login working - admin/admin authentication successful"
    else
        print_error "❌ JWT login failed - check credentials or backend"
    fi
    
    print_status "4. Testing runtime configuration..."
    config_check=$(curl -s http://jbelt.local/ | grep -o '"apiBase":"[^"]*"' | head -1)
    if echo "$config_check" | grep -q "jbelt.local"; then
        print_success "✅ Runtime configuration correct: $config_check"
    else
        print_warning "⚠️ Runtime configuration: $config_check"
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up test environment..."
    docker-compose -f docker-compose.ubuntu.test.yml down --remove-orphans 2>/dev/null || true
    rm -f .env.ubuntu.local docker-compose.ubuntu.test.yml
    rm -rf nginx/test
    print_success "Cleanup completed"
}

# Main function
case "${1:-test}" in
    "test")
        create_test_env
        setup_hosts
        create_test_nginx
        create_test_compose
        
        print_status "Creating Docker network if needed..."
        docker network create jbelt-network 2>/dev/null || true
        
        print_status "Starting test environment..."
        docker-compose -f docker-compose.ubuntu.test.yml --env-file .env.ubuntu.local up -d --build
        
        run_tests
        ;;
    "stop")
        cleanup
        ;;
    *)
        echo "Usage: $0 {test|stop}"
        echo ""
        echo "Commands:"
        echo "  test - Run Ubuntu production test locally"
        echo "  stop - Stop and cleanup test environment"
        exit 1
        ;;
esac