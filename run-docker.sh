#!/bin/bash
# Script per esecuzione semplificata di JBelt Doctor Web
# ------------------------------------------------------

# Variabili configurazione
APP_NAME="jbeltdoctor"
APP_VERSION="1.0.3"
MODE="${1:-dev}"  # Modalità predefinita: dev (alternativa: prod)

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per output formattato
print_step() {
  echo -e "${BLUE}>> $1${NC}"
}

print_error() {
  echo -e "${RED}ERRORE: $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Verifica che docker sia installato
if ! command -v docker &> /dev/null; then
  print_error "Docker non trovato. Installare Docker prima di procedere."
  exit 1
fi

# Verifica che docker-compose sia installato
if ! command -v docker-compose &> /dev/null; then
  print_error "docker-compose non trovato. Installare docker-compose prima di procedere."
  exit 1
fi

# Verifica che lo script entrypoint sia eseguibile
if [ ! -f "docker-entrypoint.sh" ]; then
  print_warning "Script docker-entrypoint.sh non trovato, creazione automatica..."
  cat > docker-entrypoint.sh << 'EOL'
#!/bin/sh
set -e
echo ">>> Ambiente: $NODE_ENV"
echo ">>> Directory corrente: $(pwd)"
echo ">>> Contenuto directory:"
ls -la
exec "$@"
EOL
fi

# Rendi eseguibile lo script entrypoint
chmod +x docker-entrypoint.sh
print_success "Script docker-entrypoint.sh pronto"

# Verifica che la directory app esista
if [ ! -d "app" ]; then
  print_error "Directory 'app' non trovata! Eseguire lo script dalla directory principale del progetto."
  echo "Directory corrente: $(pwd)"
  exit 1
fi

# Informazioni sulla configurazione
print_step "Configurazione Ambiente Docker"
echo "- Progetto: ${APP_NAME}"
echo "- Versione: ${APP_VERSION}"
echo "- Modalità: ${MODE}"
echo "- Directory app: $(pwd)/app"

# Ferma eventuali container in esecuzione
print_step "Arresto container esistenti..."
docker-compose down 2>/dev/null || true

# Avvio in base alla modalità
if [ "$MODE" = "dev" ]; then
  print_step "Avvio ambiente di sviluppo..."
  docker-compose --profile dev up
elif [ "$MODE" = "prod" ]; then
  print_step "Avvio ambiente di produzione..."
  docker-compose --profile prod up
else
  print_error "Modalità non riconosciuta: $MODE"
  echo "Modalità disponibili: dev, prod"
  exit 1
fi

# Version: 1.0.1