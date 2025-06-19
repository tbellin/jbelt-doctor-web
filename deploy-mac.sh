#!/bin/bash
set -e

# JBelt Doctor Web - Deploy script per Mac Development
# Frontend: atlante.local:80, API: localhost:8080

echo "🚀 Starting JBelt Doctor Web deployment for Mac development..."

# Configuration
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.development"
PROJECT_NAME="jbelt-frontend-dev"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file $COMPOSE_FILE not found!"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup /etc/hosts entry for atlante.local
setup_hosts() {
    print_status "Setting up /etc/hosts entry for atlante.local..."
    
    if ! grep -q "atlante.local" /etc/hosts; then
        print_status "Adding atlante.local to /etc/hosts..."
        echo "127.0.0.1 atlante.local" | sudo tee -a /etc/hosts
        print_success "Added atlante.local to /etc/hosts"
    else
        print_status "atlante.local already exists in /etc/hosts"
    fi
}

# Create Docker network if not exists
create_network() {
    print_status "Creating Docker network jbelt-network..."
    
    if ! docker network ls | grep -q "jbelt-network"; then
        docker network create jbelt-network
        print_success "Created Docker network jbelt-network"
    else
        print_status "Docker network jbelt-network already exists"
    fi
}

# Check if backend is running
check_backend() {
    print_status "Checking if backend is running on port 8080..."
    
    if curl -s http://localhost:8080/api/management/health > /dev/null 2>&1; then
        print_success "Backend is running on port 8080"
    else
        print_warning "Backend not detected on port 8080"
        print_status "Please start the backend using:"
        print_status "  cd ../.. && docker-compose -f docker-compose-srv.yml up -d"
        
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Deployment cancelled"
            exit 0
        fi
    fi
}

# Stop existing services
stop_services() {
    print_status "Stopping existing frontend services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans 2>/dev/null || true
    print_success "Services stopped"
}

# Build and start services
start_services() {
    print_status "Building and starting frontend services..."
    
    # Build and start
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    
    print_success "Services started"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    print_status "Waiting for services to be ready (30 seconds)..."
    sleep 30
    
    # Check Nginx proxy
    if curl -f -s http://atlante.local/ > /dev/null; then
        print_success "Frontend accessible via atlante.local"
    else
        print_warning "atlante.local not accessible, trying localhost..."
        if curl -f -s http://localhost/ > /dev/null; then
            print_success "Frontend accessible via localhost"
        else
            print_error "Frontend not accessible on port 80"
            return 1
        fi
    fi
    
    # Check health endpoint
    if curl -f -s http://atlante.local/health > /dev/null; then
        print_success "Health endpoint working"
    else
        print_warning "Health endpoint not responding, checking direct API..."
        if curl -f -s http://atlante.local/api/health > /dev/null; then
            print_success "Frontend API health endpoint working"
        else
            print_warning "Health endpoints not responding (frontend may still be starting)"
        fi
    fi
    
    print_success "Health checks completed"
}

# Show service status
show_status() {
    print_status "Service status:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    print_status "Service logs (last 10 lines):"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=10
}

# Show final information
show_final_info() {
    print_success "🎉 Mac development deployment completed successfully!"
    echo ""
    print_success "🌐 JBelt Doctor Web is now accessible on PORT 80:"
    print_success "  ➤ Frontend Site: http://atlante.local/"
    print_success "  ➤ Frontend (alt): http://localhost/"
    print_success "  ➤ API Proxy: http://atlante.local/api/"
    print_success "  ➤ Health Check: http://atlante.local/health"
    echo ""
    print_status "🔧 Technical details:"
    print_status "  - Nuxt dev server: runs on port 3000 (internal)"
    print_status "  - Nginx proxy: serves port 80 → forwards to port 3000"
    print_status "  - Backend API: http://localhost:8080 (external)"
    print_status "  - Hot reload: ✅ enabled for development"
    echo ""
    print_status "📋 Management commands:"
    print_status "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
    print_status "  - Stop services: ./deploy-mac.sh stop"
    print_status "  - Restart: ./deploy-mac.sh restart"
}

# Main deployment function
deploy() {
    print_status "Starting Mac development deployment..."
    
    check_prerequisites
    setup_hosts
    create_network
    check_backend
    stop_services
    start_services
    
    if health_check; then
        show_final_info
        show_status
    else
        print_error "❌ Deployment failed during health checks!"
        print_status "Showing service logs for debugging:"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
        print_success "Services restarted"
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
        ;;
    "hosts")
        setup_hosts
        ;;
    "test")
        print_status "Testing JBelt Doctor Web accessibility..."
        echo ""
        
        print_status "1. Testing container connectivity..."
        if docker exec jbelt-nginx-dev wget -qO- http://frontend-dev:3000/ > /dev/null 2>&1; then
            print_success "✅ Nginx can reach Frontend container"
        else
            print_error "❌ Nginx cannot reach Frontend container"
        fi
        
        print_status "2. Testing direct Frontend (port 3000)..."
        if docker exec jbelt-frontend-dev curl -s http://localhost:3000/ > /dev/null; then
            print_success "✅ Frontend container responding on port 3000"
        else
            print_error "❌ Frontend container not responding on port 3000"
        fi
        
        print_status "3. Testing Nginx proxy (port 80)..."
        http_code=$(curl -s -o /dev/null -w "%{http_code}" http://atlante.local/ 2>/dev/null)
        if [ "$http_code" = "200" ]; then
            print_success "✅ atlante.local:80 → port 3000 proxy working (HTTP $http_code)"
        else
            print_error "❌ atlante.local:80 proxy failed (HTTP $http_code)"
            print_status "Checking nginx logs..."
            docker logs --tail=10 jbelt-nginx-dev
        fi
        
        print_status "4. Testing localhost fallback..."
        http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
        if [ "$http_code" = "200" ]; then
            print_success "✅ localhost:80 accessible (HTTP $http_code)"
        else
            print_warning "⚠️ localhost:80 not accessible (HTTP $http_code)"
        fi
        
        print_status "5. Testing API proxy..."
        api_code=$(curl -s -o /dev/null -w "%{http_code}" http://atlante.local/api/management/health 2>/dev/null)
        if [ "$api_code" = "200" ]; then
            print_success "✅ API proxy working (HTTP $api_code)"
        elif [ "$api_code" = "401" ]; then
            print_warning "⚠️ API proxy working but requires authentication (HTTP $api_code) - this is normal"
        else
            print_error "❌ API proxy not responding (HTTP $api_code) - check if backend is running"
        fi
        
        print_status "6. Testing JWT login..."
        login_response=$(curl -s -X POST http://atlante.local/api/authenticate \
          -H "Content-Type: application/json" \
          -d '{"username":"admin","password":"admin","rememberMe":false}' 2>/dev/null)
        
        if echo "$login_response" | grep -q "id_token"; then
            print_success "✅ JWT login working - admin/admin authentication successful"
        else
            print_error "❌ JWT login failed - check credentials or backend"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|status|logs|hosts|test}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show and follow logs"
        echo "  hosts    - Setup /etc/hosts entry"
        echo "  test     - Test site accessibility"
        exit 1
        ;;
esac