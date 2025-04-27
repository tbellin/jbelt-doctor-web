# Script di diagnosi e risoluzione per problemi di connessione Docker Hub
# ----------------------------------------------------------------------

# 1. Verifica connettività di base con Docker Hub
echo "=== Verifico connettività con Docker Hub ==="
ping -c 4 docker.io
ping -c 4 registry-1.docker.io

# 2. Verifica DNS
echo "=== Verifico risoluzione DNS ==="
nslookup docker.io
nslookup registry-1.docker.io

# 3. Verifica autenticazione Docker
echo "=== Stato autenticazione Docker ==="
docker info | grep "Username"

# 4. Tenta pull diretto dell'immagine per isolare il problema
echo "=== Provo pull diretto dell'immagine base ==="
docker pull node:20-alpine

# 5. Verifica proxy environment
echo "=== Variabili d'ambiente proxy ==="
env | grep -i proxy

# 6. Verifica configurazione rete Docker
echo "=== Configurazione rete Docker ==="
docker network ls