# Plesk Integration Guide for JBelt Doctor Web

Questa guida descrive come integrare JBelt Doctor Web con Plesk su server Ubuntu.

## Prerequisiti

- Server Ubuntu con Plesk installato
- Docker e Docker Compose configurati
- Dominio `jbelt.org` configurato in Plesk
- Backend JBelt in esecuzione sulla porta 8080

## Metodi di Integrazione

### Metodo 1: Docker autonomo con Proxy Plesk (Raccomandato)

#### Step 1: Deploy Docker Container
```bash
# Trasferire i file sul server
scp -r . user@jbelt.org:/var/www/jbelt-frontend/

# Connettersi al server
ssh user@jbelt.org

# Navigare nella directory
cd /var/www/jbelt-frontend/

# Eseguire il deployment
sudo ./deploy-ubuntu.sh
```

#### Step 2: Configurazione Plesk

1. **Accedere al Pannello Plesk**
   - Login su https://jbelt.org:8443

2. **Configurare il Dominio**
   - Andare in "Websites & Domains" → `jbelt.org`
   - Cliccare su "Apache & nginx Settings"

3. **Configurazione nginx**
   - Abilitare "nginx" per servire file statici
   - In "Additional nginx directives" aggiungere:

```nginx
# JBelt Frontend Docker Integration
location / {
    proxy_pass http://127.0.0.1:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /management/ {
    proxy_pass http://127.0.0.1:8080/management/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

4. **SSL/TLS Configuration**
   - Abilitare "Let's Encrypt" per il dominio
   - Oppure configurare certificati SSL personalizzati

### Metodo 2: File Statici in Plesk + API Proxy

#### Step 1: Build Statico
```bash
# Build del frontend
pnpm build
pnpm generate

# Copiare i file nella document root Plesk
sudo cp -r .output/public/* /var/www/vhosts/jbelt.org/httpdocs/
```

#### Step 2: Configurazione nginx per API Proxy
```nginx
# Solo proxy per API
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /management/ {
    proxy_pass http://127.0.0.1:8080/management/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Fallback per SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

## Configurazione SSL

### Opzione 1: Let's Encrypt via Plesk
1. In Plesk, andare su "SSL/TLS Certificates"
2. Cliccare su "Get a free certificate from Let's Encrypt"
3. Selezionare il dominio e sottodomini
4. Abilitare "Secure the website" e "Redirect from HTTP to HTTPS"

### Opzione 2: Let's Encrypt manuale
```bash
# Installare certbot
sudo apt install certbot python3-certbot-nginx

# Ottenere certificato
sudo certbot certonly --webroot -w /var/www/vhosts/jbelt.org/httpdocs -d jbelt.org

# I certificati saranno in /etc/letsencrypt/live/jbelt.org/
```

## Monitoraggio e Manutenzione

### Log Files
```bash
# Log applicazione
docker-compose -f docker-compose.ubuntu.yml logs -f

# Log nginx Plesk
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Log Plesk specifici
tail -f /var/www/vhosts/jbelt.org/logs/access_log
tail -f /var/www/vhosts/jbelt.org/logs/error_log
```

### Health Checks
```bash
# Check frontend
curl -f https://jbelt.org/health

# Check API proxy
curl -f https://jbelt.org/api/management/health

# Check backend diretto
curl -f http://localhost:8080/api/management/health
```

### Backup e Updates

#### Backup
```bash
# Backup configurazione
tar -czf jbelt-frontend-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.ubuntu.yml \
  .env.ubuntu \
  nginx/ \
  plesk/

# Backup database (se necessario)
docker exec jbelt-postgres pg_dump -U postgres jbelt > backup.sql
```

#### Updates
```bash
# Pull nuove immagini
docker-compose -f docker-compose.ubuntu.yml pull

# Restart con nuove immagini
sudo ./deploy-ubuntu.sh restart

# Oppure rebuild completo
sudo ./deploy-ubuntu.sh deploy
```

## Troubleshooting

### Problemi Comuni

1. **502 Bad Gateway**
   - Verificare che il backend sia in esecuzione: `curl http://localhost:8080/api/management/health`
   - Controllare la rete Docker: `docker network ls | grep jbelt-network`

2. **Certificati SSL non funzionanti**
   - Verificare la configurazione: `sudo ./deploy-ubuntu.sh ssl`
   - Controllare i certificati: `openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout`

3. **CORS Errors**
   - Verificare la configurazione API base in `.env.ubuntu`
   - Controllare gli header nginx

4. **File statici non serviti**
   - Verificare i permessi: `ls -la /usr/share/nginx/html/`
   - Controllare il mount dei volumi Docker

### Comandi Utili
```bash
# Restart completo
sudo systemctl restart jbelt-frontend

# Rebuild senza cache
docker-compose -f docker-compose.ubuntu.yml build --no-cache

# Reset completo
sudo ./deploy-ubuntu.sh stop
docker system prune -f
sudo ./deploy-ubuntu.sh deploy

# Test connettività backend
telnet localhost 8080
```

## Sicurezza

### Firewall
```bash
# Configurare UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Solo se necessario dall'esterno
sudo ufw enable
```

### Rate Limiting (nginx)
```nginx
# In configurazione nginx Plesk
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... resto della configurazione
}
```

### Access Control
```nginx
# Limitare accesso management (opzionale)
location /management/ {
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
    # ... resto della configurazione
}
```