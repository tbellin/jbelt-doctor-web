#!/bin/bash

# JBelt Doctor Web - Plesk Setup Script
# ====================================
# This script helps configure Plesk for JBelt Doctor Web deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables (modify these for your setup)
DOMAIN_NAME="your-domain.com"
SUBDOMAIN_NAME="jbelt"
DOCKER_HOST_PORT="80"
SSL_ENABLED="true"

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

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if running on Plesk server
check_plesk() {
    print_step "Checking Plesk Installation"
    
    if ! command -v plesk &> /dev/null; then
        print_error "Plesk is not installed or not in PATH"
        print_status "Please install Plesk or run this script on a Plesk server"
        exit 1
    fi
    
    print_success "Plesk detected: $(plesk version)"
}

# Install Docker if not present
install_docker() {
    print_step "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found, installing..."
        
        # Update packages
        apt-get update
        
        # Install prerequisites
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Add Docker GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Add Docker repository
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
        # Add current user to docker group
        usermod -aG docker $USER
        
        print_success "Docker installed successfully"
    else
        print_success "Docker is already installed: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose not found, installing..."
        
        # Install docker-compose
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        print_success "Docker Compose installed successfully"
    else
        print_success "Docker Compose is already installed: $(docker-compose --version)"
    fi
}

# Configure firewall rules
configure_firewall() {
    print_step "Configuring Firewall Rules"
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow SSH (if not already allowed)
    ufw allow 22/tcp
    
    # Allow Plesk panel access
    ufw allow 8443/tcp
    
    print_success "Firewall rules configured"
}

# Create domain in Plesk
create_domain() {
    print_step "Creating Domain Configuration"
    
    print_status "Domain setup instructions:"
    echo ""
    echo "1. Log into Plesk Panel (https://your-server-ip:8443)"
    echo "2. Go to 'Websites & Domains'"
    echo "3. Click 'Add Domain' or 'Add Subdomain'"
    echo "4. Enter domain: $DOMAIN_NAME (or subdomain: $SUBDOMAIN_NAME.$DOMAIN_NAME)"
    echo "5. Set document root to: /var/www/vhosts/$DOMAIN_NAME/httpdocs"
    echo ""
    
    print_warning "Please complete the domain setup manually in Plesk Panel"
}

# Configure Nginx proxy
configure_nginx_proxy() {
    print_step "Configuring Nginx Reverse Proxy"
    
    # Create nginx configuration directory
    NGINX_CONF_DIR="/var/www/vhosts/$DOMAIN_NAME/conf"
    mkdir -p "$NGINX_CONF_DIR"
    
    # Create reverse proxy configuration
    cat > "$NGINX_CONF_DIR/nginx.conf" << EOF
# JBelt Doctor Web Reverse Proxy Configuration
# This file is managed by Plesk

location / {
    proxy_pass http://127.0.0.1:$DOCKER_HOST_PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-Port \$server_port;
    
    # Timeout settings
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
}

# Health check endpoint
location /health {
    proxy_pass http://127.0.0.1:$DOCKER_HOST_PORT/health;
    access_log off;
}

# API endpoints
location /api/ {
    proxy_pass http://127.0.0.1:$DOCKER_HOST_PORT/api/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    
    # CORS headers (if needed)
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
}
EOF
    
    print_success "Nginx reverse proxy configuration created"
    print_status "Configuration file: $NGINX_CONF_DIR/nginx.conf"
}

# Configure SSL/TLS
configure_ssl() {
    if [ "$SSL_ENABLED" = "true" ]; then
        print_step "SSL/TLS Configuration"
        
        echo "SSL Configuration Instructions:"
        echo ""
        echo "1. In Plesk Panel, go to your domain"
        echo "2. Click 'SSL/TLS Certificates'"
        echo "3. Choose 'Let's Encrypt' tab"
        echo "4. Check 'Secure the domain name and its www subdomain'"
        echo "5. Provide a valid email address"
        echo "6. Click 'Get it free'"
        echo "7. After certificate is issued, go to 'Hosting Settings'"
        echo "8. Enable 'Permanent SEO-safe 301 redirect from HTTP to HTTPS'"
        echo ""
        
        print_warning "Please configure SSL manually in Plesk Panel"
    else
        print_warning "SSL is disabled in configuration"
    fi
}

# Create systemd service for auto-start
create_systemd_service() {
    print_step "Creating Systemd Service"
    
    cat > /etc/systemd/system/jbelt-docker.service << EOF
[Unit]
Description=JBelt Doctor Web Docker Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/jbelt-doctor-web
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable jbelt-docker.service
    
    print_success "Systemd service created and enabled"
}

# Setup project directory
setup_project_directory() {
    print_step "Setting up Project Directory"
    
    PROJECT_DIR="/opt/jbelt-doctor-web"
    
    # Create project directory
    mkdir -p "$PROJECT_DIR"
    
    print_status "Project directory created: $PROJECT_DIR"
    print_warning "Please copy your project files to: $PROJECT_DIR"
    
    # Set proper permissions
    chown -R root:docker "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    print_success "Project directory permissions set"
}

# Display final instructions
show_final_instructions() {
    print_step "Setup Complete - Next Steps"
    
    echo ""
    print_success "Plesk setup is complete! Next steps:"
    echo ""
    echo "1. Copy your JBelt Doctor Web project to: /opt/jbelt-doctor-web"
    echo "2. Configure your .env.production file with your domain settings"
    echo "3. Update NUXT_PUBLIC_API_HOST and NUXT_PUBLIC_FRONTEND_HOST in .env.production"
    echo "4. Run the deployment script: /opt/jbelt-doctor-web/deploy.sh"
    echo "5. Complete domain and SSL setup in Plesk Panel"
    echo "6. Test your application at: http://$DOMAIN_NAME"
    echo ""
    print_status "Useful commands:"
    echo "  - View service status: systemctl status jbelt-docker"
    echo "  - Start service: systemctl start jbelt-docker"
    echo "  - Stop service: systemctl stop jbelt-docker"
    echo "  - View Docker logs: docker-compose -f /opt/jbelt-doctor-web/docker-compose.production.yml logs"
    echo ""
}

# Main setup function
main() {
    print_status "Starting JBelt Doctor Web Plesk setup..."
    echo ""
    
    # Prompt for configuration
    read -p "Enter your domain name (default: $DOMAIN_NAME): " input_domain
    DOMAIN_NAME=${input_domain:-$DOMAIN_NAME}
    
    read -p "Enter Docker host port (default: $DOCKER_HOST_PORT): " input_port
    DOCKER_HOST_PORT=${input_port:-$DOCKER_HOST_PORT}
    
    read -p "Enable SSL/TLS? (y/n, default: y): " input_ssl
    if [[ "$input_ssl" =~ ^[Nn]$ ]]; then
        SSL_ENABLED="false"
    fi
    
    echo ""
    print_status "Configuration:"
    print_status "  Domain: $DOMAIN_NAME"
    print_status "  Docker Port: $DOCKER_HOST_PORT"
    print_status "  SSL Enabled: $SSL_ENABLED"
    echo ""
    
    read -p "Continue with setup? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    check_plesk
    install_docker
    configure_firewall
    setup_project_directory
    create_domain
    configure_nginx_proxy
    configure_ssl
    create_systemd_service
    show_final_instructions
    
    print_success "🎉 Plesk setup completed successfully!"
}

# Run main function
main "$@"