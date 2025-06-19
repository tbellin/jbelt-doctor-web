#!/bin/bash
set -e

# JBelt Doctor Web - Production Deployment Script
# ===============================================

echo "🚀 Starting JBelt Doctor Web deployment..."

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
PROJECT_NAME="jbelt-doctor-production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required files exist
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
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Create backup of database
backup_database() {
    print_status "Creating database backup..."
    
    # Create backup directory
    mkdir -p ./backups
    
    # Generate backup filename with timestamp
    BACKUP_FILE="./backups/jbelt_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Check if database container is running
    if docker ps | grep -q "jbelt-postgres"; then
        print_status "Creating database backup to $BACKUP_FILE"
        docker exec jbelt-postgres pg_dump -U jbeltMapSrv jbeltMapSrv > "$BACKUP_FILE"
        print_success "Database backup created successfully"
    else
        print_warning "Database container not running, skipping backup"
    fi
}

# Stop existing services
stop_services() {
    print_status "Stopping existing services..."
    
    # Stop services gracefully
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans
    
    print_success "Services stopped"
}

# Build new images
build_images() {
    print_status "Building new Docker images..."
    
    # Build with no cache to ensure fresh build
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    
    print_success "Images built successfully"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start all services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    print_success "Services started"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready (60 seconds)..."
    sleep 60
    
    # Check Nginx
    if curl -f -s http://localhost/health > /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    # Check Backend API
    if curl -f -s http://localhost/api/management/health > /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    print_success "All health checks passed"
}

# Show service status
show_status() {
    print_status "Service status:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    print_status "Service logs (last 20 lines):"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=20
}

# Cleanup old images
cleanup() {
    print_status "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    print_success "Cleanup completed"
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    check_prerequisites
    backup_database
    stop_services
    build_images
    start_services
    
    if health_check; then
        print_success "🎉 Deployment completed successfully!"
        show_status
        cleanup
        
        echo ""
        print_success "JBelt Doctor Web is now running at:"
        print_success "  - Frontend: http://localhost"
        print_success "  - Backend API: http://localhost/api"
        print_success "  - Health Check: http://localhost/health"
        echo ""
        print_status "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
        print_status "To stop services: docker-compose -f $COMPOSE_FILE down"
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
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|status|logs|backup|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show and follow logs"
        echo "  backup   - Create database backup"
        echo "  cleanup  - Clean up old Docker images"
        exit 1
        ;;
esac