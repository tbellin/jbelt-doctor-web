#!/bin/bash
# Script di inizializzazione per il progetto Nuxt su Docker
# ---------------------------------------------------------

# Impostazione strictmode
set -e

# Directory corrente dello script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Funzione per creare directory
create_directory() {
    if [ ! -d "$1" ]; then
        echo -e "${YELLOW}Creazione directory $1...${NC}"
        mkdir -p "$1"
    else
        echo -e "${GREEN}Directory $1 già esistente${NC}"
    fi
}

# Banner informativo
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  Inizializzazione Progetto Nuxt JWT per Docker   ${NC}"
echo -e "${GREEN}==================================================${NC}"

# Verifica prerequisiti
echo -e "\n${YELLOW}Verifica prerequisiti...${NC}"

# Controllo Docker
if ! command -v docker &> /dev/null; then
    echo -e "\n${RED}Docker non trovato. Installare Docker prima di continuare.${NC}"
    exit 1
fi

# Controllo Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "\n${RED}Docker Compose non trovato. Installare Docker Compose prima di continuare.${NC}"
    exit 1
fi

echo -e "${GREEN}Docker e Docker Compose installati correttamente.${NC}"

# Creazione struttura directory
echo -e "\n${YELLOW}Creazione struttura directory...${NC}"

# Directory per Nginx
create_directory "$ROOT_DIR/nginx"
create_directory "$ROOT_DIR/nginx/ssl"

# Verifica se il file nginx/default.conf esiste
if [ ! -f "$ROOT_DIR/nginx/default.conf" ]; then
    echo -e "${YELLOW}File nginx/default.conf non trovato.${NC}"
    echo -e "${YELLOW}Assicurarsi che il file sia stato correttamente creato.${NC}"
fi

# Verifica permessi
echo -e "\n${YELLOW}Impostazione permessi...${NC}"
chmod +x "$SCRIPT_DIR"/*.sh

# Creazione file .env per sviluppo se non esiste
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo -e "\n${YELLOW}Creazione file .env di default...${NC}"
    cat > "$ROOT_DIR/.env" << EOL
# Variabili d'ambiente per il progetto Nuxt JWT
# ---------------------------------------------

# Configurazione frontend
FRONTEND_HOST=localhost
FRONTEND_PORT=3000

# Configurazione API
API_HOST=localhost
API_PORT=8080
EOL
    echo -e "${GREEN}File .env creato.${NC}"
else
    echo -e "${GREEN}File .env già esistente.${NC}"
fi

# Istruzioni finali
echo -e "\n${GREEN}Inizializzazione completata!${NC}"
echo -e "\n${YELLOW}Per avviare l'ambiente di sviluppo:${NC}"
echo -e "  cd $ROOT_DIR"
echo -e "  make dev"
echo -e "\n${YELLOW}Per avviare l'ambiente di produzione:${NC}"
echo -e "  cd $ROOT_DIR"
echo -e "  make prod"

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}  Inizializzazione completata con successo!        ${NC}"
echo -e "${GREEN}==================================================${NC}"

# Version: 1.0.0