# JBelt Doctor Web - Complete Deployment Guide

## 📋 Overview

Guida completa per il deployment del frontend JBelt Doctor Web su Mac (sviluppo) e Ubuntu (produzione) con integrazione Plesk.

Il sistema è configurato per funzionare in due ambienti:
- **Mac Development**: `atlante.local:80` → Frontend, `localhost:8080` → API Backend
- **Ubuntu Production**: `jbelt.org:80/443` → Frontend + API Proxy, Backend su porta 8080

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Mac Dev       │    │ Ubuntu Prod     │
│                 │    │                 │
│ atlante.local:80│    │ jbelt.org:80/443│
│        ↓        │    │        ↓        │
│   Nginx Proxy   │    │   Nginx+SSL     │
│        ↓        │    │        ↓        │
│  Frontend:3000  │    │  Static Files   │
│        +        │    │        +        │
│ API→:8080       │    │ API Proxy→:8080 │
└─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
jbelt-doctor-web/
├── docker-compose.production.yml    # Production Docker Compose
├── Dockerfile.production           # Multi-stage production Dockerfile
├── .env.production                # Production environment variables
├── deploy.sh                      # Deployment script
├── nginx/
│   ├── nginx.conf                 # Main Nginx configuration
│   └── default.conf               # Frontend Nginx configuration
└── scripts/
    ├── plesk-setup.sh             # Plesk server setup
    └── backup-database.sh         # Database backup utility
```

## 🚀 Quick Start

### 1. Prerequisites

- Ubuntu Server 20.04+ with Plesk
- Docker and Docker Compose
- Domain name pointing to your server

### 2. Server Setup

Run the Plesk setup script:

```bash
sudo ./scripts/plesk-setup.sh
```

This script will:
- Install Docker and Docker Compose
- Configure firewall rules
- Set up project directory
- Create systemd service
- Configure Nginx reverse proxy

### 3. Project Deployment

1. **Copy project files** to `/opt/jbelt-doctor-web/`

2. **Configure environment** by editing `.env.production`:
   ```env
   # Update these values for your domain
   NUXT_PUBLIC_API_HOST=your-domain.com
   NUXT_PUBLIC_FRONTEND_HOST=your-domain.com
   DB_PASSWORD=your_secure_password
   ```

3. **Deploy the application**:
   ```bash
   cd /opt/jbelt-doctor-web
   ./deploy.sh
   ```

### 4. Plesk Configuration

1. **Add Domain/Subdomain** in Plesk Panel
2. **Configure SSL** using Let's Encrypt
3. **Set up Nginx** reverse proxy (automatically configured by setup script)

## 🔧 Configuration Details

### Environment Variables (.env.production)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `jbelt_secure_password_2025` |
| `NUXT_PUBLIC_API_HOST` | API host domain | `your-domain.com` |
| `NUXT_PUBLIC_FRONTEND_HOST` | Frontend host domain | `your-domain.com` |
| `PGADMIN_PASSWORD` | PgAdmin password | `admin_secure_password_2025` |

### Docker Services

| Service | Description | Port | Health Check |
|---------|-------------|------|--------------|
| `nginx` | Reverse proxy | 80, 443 | `/health` |
| `frontend` | Nuxt.js app | Internal | `/health` |
| `backend` | Spring Boot API | Internal | `/api/management/health` |
| `postgresql` | Database | Internal | `pg_isready` |
| `pgadmin` | DB Admin (optional) | Internal | N/A |

## 🛠️ Management Commands

### Deployment Script (`./deploy.sh`)

```bash
./deploy.sh                 # Full deployment
./deploy.sh stop           # Stop all services
./deploy.sh restart        # Restart services
./deploy.sh status         # Show service status
./deploy.sh logs           # Show and follow logs
./deploy.sh backup         # Create database backup
./deploy.sh cleanup        # Clean up old Docker images
```

### Database Backup (`./scripts/backup-database.sh`)

```bash
./scripts/backup-database.sh          # Create backup
./scripts/backup-database.sh list     # List backups
./scripts/backup-database.sh restore backup_file.sql.gz
./scripts/backup-database.sh cleanup  # Remove old backups
```

### Docker Commands

```bash
# View service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart specific service
docker-compose -f docker-compose.production.yml restart frontend

# Access database
docker exec -it jbelt-postgres psql -U jbeltMapSrv jbeltMapSrv
```

## 🔒 Security Considerations

### Environment Security
- ✅ All passwords in environment variables
- ✅ No hardcoded secrets in code
- ✅ Docker internal networks
- ✅ Security headers in Nginx

### Network Security
- ✅ Firewall configured (ports 80, 443, 22, 8443)
- ✅ Database not exposed externally
- ✅ SSL/TLS encryption

### Access Control
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Admin endpoints protection

## 📊 Monitoring & Maintenance

### Health Checks

- **Frontend**: `http://your-domain.com/health`
- **Backend**: `http://your-domain.com/api/management/health`
- **Full System**: All Docker health checks

### Log Management

```bash
# Application logs
docker-compose -f docker-compose.production.yml logs -f

# Nginx access logs
tail -f /var/log/nginx/access.log

# System logs
journalctl -u jbelt-docker.service -f
```

### Automated Backups

Set up cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add backup at 2 AM daily
0 2 * * * /opt/jbelt-doctor-web/scripts/backup-database.sh backup
```

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   # Check logs
   ./deploy.sh logs
   
   # Check Docker daemon
   systemctl status docker
   ```

2. **Database connection errors**
   ```bash
   # Check PostgreSQL container
   docker exec jbelt-postgres pg_isready -U jbeltMapSrv
   
   # Reset database
   docker-compose -f docker-compose.production.yml down -v
   ./deploy.sh
   ```

3. **Nginx proxy errors**
   ```bash
   # Test Nginx configuration
   docker exec jbelt-nginx nginx -t
   
   # Reload Nginx
   docker exec jbelt-nginx nginx -s reload
   ```

4. **SSL/TLS issues**
   - Check certificate in Plesk Panel
   - Verify domain DNS pointing to server
   - Ensure ports 80/443 are open

### Service Recovery

```bash
# Full system recovery
./deploy.sh stop
./deploy.sh
./deploy.sh status

# Database recovery from backup
./scripts/backup-database.sh restore latest_backup.sql.gz
```

## 📈 Performance Optimization

### Frontend Optimization
- ✅ Static site generation (SSG)
- ✅ Asset caching (1 year for static assets)
- ✅ Gzip compression
- ✅ CDN-ready setup

### Backend Optimization
- ✅ Connection pooling
- ✅ JVM tuning (-Xmx512m -Xms256m)
- ✅ Database indexing
- ✅ API caching headers

### Infrastructure Optimization
- ✅ Docker multi-stage builds
- ✅ Nginx buffer optimization
- ✅ Health check timeouts
- ✅ Resource limits

## 🔄 Updates & Maintenance

### Application Updates

1. **Backup current state**
   ```bash
   ./scripts/backup-database.sh backup
   ```

2. **Update code**
   ```bash
   git pull origin main
   ```

3. **Deploy updates**
   ```bash
   ./deploy.sh
   ```

### System Updates

```bash
# Update Ubuntu packages
apt update && apt upgrade

# Update Docker images
docker-compose -f docker-compose.production.yml pull
./deploy.sh
```

## 📞 Support

For issues and support:
- Check logs: `./deploy.sh logs`
- Verify health: `./deploy.sh status`
- Create backup: `./scripts/backup-database.sh backup`
- Review this documentation

## 📝 Change Log

- **v1.0.0**: Initial production deployment setup
- Added Docker Compose production configuration
- Added Plesk integration scripts
- Added automated backup system
- Added comprehensive monitoring