#!/bin/bash
set -e

# Script per generare certificati SSL per JBelt Doctor Web
# Per sviluppo locale e configurazione iniziale

DOMAIN=${1:-jbelt.org}
SSL_DIR="/etc/nginx/ssl"
DAYS=${2:-365}

echo "🔐 Generating SSL certificates for $DOMAIN..."

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Crea directory SSL se non esiste
create_ssl_dir() {
    print_status "Creating SSL directory: $SSL_DIR"
    mkdir -p "$SSL_DIR"
}

# Genera certificati self-signed
generate_self_signed() {
    print_status "Generating self-signed certificate for $DOMAIN (valid for $DAYS days)..."
    
    openssl req -x509 -nodes -days "$DAYS" -newkey rsa:2048 \
        -keyout "$SSL_DIR/private.key" \
        -out "$SSL_DIR/cert.pem" \
        -config <(
        echo '[dn]'
        echo 'CN='"$DOMAIN"
        echo '[req]'
        echo 'distinguished_name = dn'
        echo '[extensions]'
        echo 'subjectAltName=DNS:'"$DOMAIN"',DNS:www.'"$DOMAIN"',DNS:localhost'
        echo 'keyUsage=keyEncipherment,dataEncipherment'
        echo 'extendedKeyUsage=serverAuth'
        ) -extensions extensions
    
    # Imposta permessi corretti
    chmod 600 "$SSL_DIR/private.key"
    chmod 644 "$SSL_DIR/cert.pem"
    
    print_status "Self-signed certificates generated successfully"
}

# Configura Let's Encrypt
setup_letsencrypt() {
    print_status "Setting up Let's Encrypt for $DOMAIN..."
    
    # Verifica se certbot è installato
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot not found. Installing..."
        
        if command -v apt &> /dev/null; then
            apt update && apt install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            yum install -y certbot python3-certbot-nginx
        else
            print_error "Package manager not supported. Please install certbot manually."
            return 1
        fi
    fi
    
    # Ottieni certificato
    print_status "Obtaining Let's Encrypt certificate..."
    print_warning "Make sure $DOMAIN points to this server and port 80 is accessible"
    
    # Webroot mode (richiede che nginx sia già in esecuzione)
    if [ -d "/var/www/certbot" ]; then
        certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    else
        # Standalone mode (ferma temporaneamente nginx)
        certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    fi
    
    # Copia certificati nella posizione nginx
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private.key"
        chmod 600 "$SSL_DIR/private.key"
        chmod 644 "$SSL_DIR/cert.pem"
        print_status "Let's Encrypt certificates configured"
    else
        print_error "Failed to obtain Let's Encrypt certificate"
        return 1
    fi
}

# Verifica certificati
verify_certificates() {
    print_status "Verifying SSL certificates..."
    
    if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/private.key" ]; then
        print_error "SSL certificates not found!"
        return 1
    fi
    
    # Verifica validità certificato
    if openssl x509 -in "$SSL_DIR/cert.pem" -text -noout > /dev/null 2>&1; then
        print_status "Certificate is valid"
        
        # Mostra informazioni certificato
        echo "Certificate details:"
        openssl x509 -in "$SSL_DIR/cert.pem" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:|DNS:)"
    else
        print_error "Certificate is invalid!"
        return 1
    fi
    
    # Verifica chiave privata
    if openssl rsa -in "$SSL_DIR/private.key" -check -noout > /dev/null 2>&1; then
        print_status "Private key is valid"
    else
        print_error "Private key is invalid!"
        return 1
    fi
    
    # Verifica corrispondenza chiave-certificato
    cert_hash=$(openssl x509 -noout -modulus -in "$SSL_DIR/cert.pem" | openssl md5)
    key_hash=$(openssl rsa -noout -modulus -in "$SSL_DIR/private.key" | openssl md5)
    
    if [ "$cert_hash" = "$key_hash" ]; then
        print_status "Certificate and private key match"
    else
        print_error "Certificate and private key do not match!"
        return 1
    fi
}

# Setup auto-renewal per Let's Encrypt
setup_auto_renewal() {
    print_status "Setting up auto-renewal for Let's Encrypt..."
    
    # Crea script di rinnovo
    cat > /etc/cron.daily/letsencrypt-renewal << 'EOF'
#!/bin/bash
# Auto-renewal script for Let's Encrypt

DOMAIN="jbelt.org"
SSL_DIR="/etc/nginx/ssl"

# Rinnova certificati
certbot renew --quiet

# Se il rinnovo ha successo, copia i nuovi certificati
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private.key"
    
    # Restart nginx
    if command -v systemctl &> /dev/null; then
        systemctl reload nginx
    elif command -v docker &> /dev/null; then
        docker-compose -f /var/www/jbelt-frontend/docker-compose.ubuntu.yml restart nginx-prod
    fi
fi
EOF

    chmod +x /etc/cron.daily/letsencrypt-renewal
    print_status "Auto-renewal configured"
}

# Main function
main() {
    case "${1:-self-signed}" in
        "self-signed")
            create_ssl_dir
            generate_self_signed
            verify_certificates
            ;;
        "letsencrypt")
            create_ssl_dir
            setup_letsencrypt
            setup_auto_renewal
            verify_certificates
            ;;
        "verify")
            verify_certificates
            ;;
        *)
            echo "Usage: $0 {self-signed|letsencrypt|verify} [domain] [days]"
            echo ""
            echo "Commands:"
            echo "  self-signed  - Generate self-signed certificates (default)"
            echo "  letsencrypt  - Setup Let's Encrypt certificates"
            echo "  verify       - Verify existing certificates"
            echo ""
            echo "Arguments:"
            echo "  domain       - Domain name (default: jbelt.org)"
            echo "  days         - Certificate validity in days (default: 365, only for self-signed)"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"