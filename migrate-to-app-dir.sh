#!/bin/bash
# Script di migrazione ottimizzato per la struttura app/ in Nuxt 4
# Versione: 1.1.0

# Colori per l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MIGRAZIONE A NUXT CON STRUTTURA app/ ===${NC}"
echo -e "${YELLOW}Avvio della migrazione alla struttura con directory app/${NC}"
echo

# 1. Crea backup del progetto
echo "Creazione backup del progetto..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../nuxt_backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp -R ./* "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup creato in $BACKUP_DIR${NC}"
echo

# 2. Crea la directory app/ se non esiste
if [ ! -d "app" ]; then
  mkdir -p app
  echo -e "${GREEN}✓ Directory app/ creata${NC}"
else
  echo -e "${YELLOW}! Directory app/ già esistente${NC}"
fi
echo

# 3. Sposta le directory e i file principali in app/
directories=("assets" "components" "layouts" "middleware" "pages" "plugins" "stores" "locales" "utils" "composables" "public")

echo "Spostamento delle directory in app/..."
for dir in "${directories[@]}"; do
  if [ -d "$dir" ]; then
    echo -n "  Spostamento di $dir/ → app/$dir/ "
    mkdir -p "app/$dir"
    cp -R "$dir"/* "app/$dir/"
    echo -e "${GREEN}✓${NC}"
  fi
done
echo -e "${GREEN}✓ Migrazione delle directory completata${NC}"
echo

# 4. Gestione del file nuxt.config.ts
echo "Configurazione di nuxt.config.ts..."
if [ -f "nuxt.config.ts" ]; then
  # Backup del file di configurazione originale
  cp nuxt.config.ts nuxt.config.ts.bak
  echo -e "${GREEN}✓ Backup di nuxt.config.ts creato come nuxt.config.ts.bak${NC}"

  # Suggerimenti per la modifica manuale
  echo -e "${YELLOW}Per completare la migrazione, aggiorna nuxt.config.ts con le seguenti modifiche:${NC}"
  echo -e "${BLUE}1. Aggiungi la proprietà srcDir:${NC}"
  echo "   srcDir: 'app/',"
  echo
  echo -e "${BLUE}2. Aggiorna i percorsi CSS (se presenti):${NC}"
  echo "   css: ["
  echo "     'bootstrap/dist/css/bootstrap.min.css',"
  echo "     '@/assets/css/main.css'  // Usa @/ invece di ./"
  echo "   ],"
  echo
  echo -e "${BLUE}3. Aggiorna i percorsi dei plugin:${NC}"
  echo "   plugins: ["
  echo "     '@/plugins/debug.ts',"
  echo "     '@/plugins/axios.ts',"
  echo "     '@/plugins/bootstrap.client.ts'"
  echo "   ],"
  echo
  echo -e "${BLUE}4. Aggiungi configurazioni app aggiuntive:${NC}"
  echo "   app: {"
  echo "     // Configurazioni esistenti..."
  echo "     rootId: 'app',"
  echo "     buildAssetsDir: '/assets/'"
  echo "   },"
else
  echo -e "${RED}File nuxt.config.ts non trovato!${NC}"
fi
echo

echo -e "${YELLOW}Importante: Non eliminare le directory originali finché non verifichi che tutto funziona correttamente!${NC}"
echo -e "${GREEN}Migrazione completata. Verifica l'applicazione con:${NC}"
echo -e "${BLUE}  npm run dev${NC}"
echo -e "${BLUE}  # oppure${NC}"
echo -e "${BLUE}  yarn dev${NC}"
echo
echo -e "${YELLOW}Per una pulizia dopo la verifica, esegui lo script cleanup-after-migration.sh${NC}"