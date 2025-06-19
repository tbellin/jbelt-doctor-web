#!/bin/bash
set -e

# JBelt Doctor Web - Deploy script per Ubuntu Production/Plesk
# Frontend: jbelt.org:80/443, API: jbelt.org:8080

echo "🚀 Starting JBelt Doctor Web deployment for Ubuntu production..."

# Configuration
COMPOSE_FILE="docker-compose.ubuntu.yml"
ENV_FILE=".env.ubuntu"
PROJECT_NAME="jbelt-frontend-prod"
DOMAIN="jbelt.org"
SSL_CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
NGINX_SSL_PATH="/etc/nginx/ssl"

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

# Check if running as root or with sudo
check_privileges() {
    if [[ $EUID -ne 0 && $(id -u) -ne 0 ]]; then
        print_error "This script requires root privileges. Please run with sudo."
        exit 1
    fi
    print_success "Running with appropriate privileges"
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
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Create SSL directory if not exists
    mkdir -p "$NGINX_SSL_PATH"
    
    # Check if Let's Encrypt certificates exist
    if [ -f "$SSL_CERT_PATH/fullchain.pem" ] && [ -f "$SSL_CERT_PATH/privkey.pem" ]; then
        print_status "Found Let's Encrypt certificates, copying..."
        cp "$SSL_CERT_PATH/fullchain.pem" "$NGINX_SSL_PATH/cert.pem"
        cp "$SSL_CERT_PATH/privkey.pem" "$NGINX_SSL_PATH/private.key"
        chmod 600 "$NGINX_SSL_PATH/private.key"
        chmod 644 "$NGINX_SSL_PATH/cert.pem"
        print_success "SSL certificates configured"
    else
        print_warning "Let's Encrypt certificates not found at $SSL_CERT_PATH"
        print_status "Generating self-signed certificates for testing..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$NGINX_SSL_PATH/private.key" \
            -out "$NGINX_SSL_PATH/cert.pem" \
            -subj "/C=IT/ST=Italy/L=City/O=JBelt/OU=IT/CN=$DOMAIN"
        
        chmod 600 "$NGINX_SSL_PATH/private.key"
        chmod 644 "$NGINX_SSL_PATH/cert.pem"
        
        print_warning "Self-signed certificates created. Please replace with Let's Encrypt certificates for production!"
        print_status "To get Let's Encrypt certificates, run:"
        print_status "  certbot certonly --webroot -w /var/www/certbot -d $DOMAIN"
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
        print_status "Backend should be running via docker-compose-srv.yml"
        print_status "Make sure backend is accessible at: http://localhost:8080"
        
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Deployment cancelled"
            exit 0
        fi
    fi
}

# Setup firewall rules
setup_firewall() {
    print_status "Configuring firewall rules..."
    
    if command -v ufw &> /dev/null; then
        print_status "Configuring UFW firewall..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8080/tcp
        print_success "Firewall rules configured"
    else
        print_warning "UFW not found, skipping firewall configuration"
    fi
}

# Build production assets
build_production() {
    print_status "Building production assets..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        if command -v pnpm &> /dev/null; then
            pnpm install
        elif command -v npm &> /dev/null; then
            npm install
        else
            print_error "Neither pnpm nor npm found!"
            exit 1
        fi
    fi
    
    # Build static assets
    print_status "Building static site..."
    if command -v pnpm &> /dev/null; then
        NODE_ENV=production pnpm build
        pnpm generate
    elif command -v npm &> /dev/null; then
        NODE_ENV=production npm run build
        npm run generate
    fi
    
    print_success "Production build completed"
}

# Stop existing services
stop_services() {
    print_status "Stopping existing frontend services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans 2>/dev/null || true
    print_success "Services stopped"
}

# Start services
start_services() {
    print_status "Starting production services..."
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    
    print_success "Services started"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    print_status "Waiting for services to be ready (45 seconds)..."
    sleep 45
    
    # Check HTTP
    if curl -f -s "http://$DOMAIN/health" > /dev/null; then
        print_success "HTTP health check passed"
    else
        print_warning "HTTP health check failed"
    fi
    
    # Check HTTPS
    if curl -f -s -k "https://$DOMAIN/health" > /dev/null; then
        print_success "HTTPS health check passed"
    else
        print_warning "HTTPS health check failed"
    fi
    
    # Check API proxy
    if curl -f -s "http://$DOMAIN/api/management/health" > /dev/null; then
        print_success "API proxy health check passed"
    else
        print_warning "API proxy health check failed"
    fi
    
    print_success "Health checks completed"
}

# Setup systemd service for auto-restart
setup_systemd() {
    print_status "Setting up systemd service..."
    
    cat > /etc/systemd/system/jbelt-frontend.service << EOF
[Unit]
Description=JBelt Frontend Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
ExecStop=/usr/bin/docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable jbelt-frontend.service
    print_success "Systemd service configured"
}

# Show service status
show_status() {
    print_status "Service status:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    
    print_status "Service logs (last 20 lines):"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=20
}

# Show final information
show_final_info() {
    print_success "🎉 Ubuntu production deployment completed successfully!"
    echo ""
    print_success "JBelt Doctor Web is now running at:"
    print_success "  - HTTPS: https://$DOMAIN/"
    print_success "  - HTTP: http://$DOMAIN/ (redirects to HTTPS)"
    print_success "  - API: https://$DOMAIN/api/"
    print_success "  - Health Check: https://$DOMAIN/health"
    echo ""
    print_status "Backend API should be accessible at: http://localhost:8080"
    print_status "Services will auto-start on boot via systemd"
    print_status "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
    print_status "To stop: systemctl stop jbelt-frontend"
    print_status "To restart: systemctl restart jbelt-frontend"
    echo ""
    if [ -f "$NGINX_SSL_PATH/cert.pem" ] && openssl x509 -in "$NGINX_SSL_PATH/cert.pem" -text -noout | grep -q "Issuer.*Let's Encrypt"; then
        print_success "Using Let's Encrypt SSL certificates"
    else
        print_warning "Using self-signed SSL certificates - replace with Let's Encrypt for production!"
    fi
}

# Plesk integration
setup_plesk_integration() {
    print_status "Setting up Plesk integration..."
    
    # Create Plesk nginx configuration
    PLESK_NGINX_CONF="/etc/nginx/plesk.conf.d/webspaces/$DOMAIN.conf"
    if [ -d "/etc/nginx/plesk.conf.d/webspaces" ]; then
        print_status "Creating Plesk nginx configuration..."
        cat > "$PLESK_NGINX_CONF" << 'EOF'
# JBelt Frontend Docker Integration
location / {
    proxy_pass http://127.0.0.1:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF
        
        # Reload Plesk nginx
        if command -v plesk &> /dev/null; then
            plesk bin service --restart nginx
        else
            systemctl restart nginx
        fi
        
        print_success "Plesk integration configured"
    else
        print_warning "Plesk configuration directory not found, skipping Plesk integration"
    fi
}

# Main deployment function
deploy() {
    print_status "Starting Ubuntu production deployment..."
    
    check_privileges
    check_prerequisites
    setup_ssl
    create_network
    check_backend
    setup_firewall
    build_production
    stop_services
    start_services
    setup_systemd
    setup_plesk_integration
    
    if health_check; then
        show_final_info
        show_status
    else
        print_error "❌ Deployment completed but health checks failed!"
        print_status "Showing service logs for debugging:"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs
        print_status "Check firewall and DNS configuration"
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
        systemctl stop jbelt-frontend 2>/dev/null || docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
        print_success "Services stopped"
        ;;
    "start")
        print_status "Starting services..."
        systemctl start jbelt-frontend 2>/dev/null || docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
        print_success "Services started"
        ;;
    "restart")
        print_status "Restarting services..."
        systemctl restart jbelt-frontend 2>/dev/null || docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
        print_success "Services restarted"
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
        ;;
    "ssl")
        setup_ssl
        ;;
    "health")
        health_check
        ;;
    "build")
        build_production
        ;;
    "test")
        print_status "Testing JBelt Doctor Web Ubuntu production..."
        echo ""
        
        print_status "1. Testing HTTPS frontend..."
        https_code=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ 2>/dev/null)
        if [ "$https_code" = "200" ]; then
            print_success "✅ HTTPS frontend accessible (HTTP $https_code)"
        else
            print_error "❌ HTTPS frontend not accessible (HTTP $https_code)"
        fi
        
        print_status "2. Testing HTTP to HTTPS redirect..."
        redirect_code=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ 2>/dev/null)
        if [ "$redirect_code" = "301" ] || [ "$redirect_code" = "302" ]; then
            print_success "✅ HTTP to HTTPS redirect working (HTTP $redirect_code)"
        else
            print_warning "⚠️ HTTP redirect not working (HTTP $redirect_code)"
        fi
        
        print_status "3. Testing API proxy..."
        api_code=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/management/health 2>/dev/null)
        if [ "$api_code" = "200" ]; then
            print_success "✅ API proxy working (HTTP $api_code)"
        elif [ "$api_code" = "401" ]; then
            print_warning "⚠️ API proxy working but requires authentication (HTTP $api_code) - this is normal"
        else
            print_error "❌ API proxy not responding (HTTP $api_code) - check if backend is running"
        fi
        
        print_status "4. Testing JWT login..."
        login_response=$(curl -s -k -X POST https://$DOMAIN/api/authenticate \
          -H "Content-Type: application/json" \
          -d '{"username":"admin","password":"admin","rememberMe":false}' 2>/dev/null)
        
        if echo "$login_response" | grep -q "id_token"; then
            print_success "✅ JWT login working - admin/admin authentication successful"
        else
            print_error "❌ JWT login failed - check credentials or backend"
        fi
        
        print_status "5. Testing SSL certificate..."
        if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
            print_success "✅ SSL certificate valid"
        else
            print_warning "⚠️ SSL certificate issues detected"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|stop|start|restart|status|logs|ssl|health|build|test}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full production deployment (default)"
        echo "  stop     - Stop all services"
        echo "  start    - Start all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show and follow logs"
        echo "  ssl      - Setup SSL certificates"
        echo "  health   - Run health checks"
        echo "  build    - Build production assets"
        echo "  test     - Test production deployment"
        exit 1
        ;;
esac