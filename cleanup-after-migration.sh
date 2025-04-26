#!/bin/bash
# Script per la pulizia post-migrazione alla struttura app/ in Nuxt 4
# Versione: 1.1.0

# Colori per l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PULIZIA POST-MIGRAZIONE ===${NC}"
echo -e "${RED}⚠️  ATTENZIONE: Questo script rimuoverà le directory originali.${NC}"
echo -e "${YELLOW}Assicurati di aver verificato che l'applicazione funzioni correttamente con la nuova struttura.${NC}"
echo
echo -e "${YELLOW}È consigliabile eseguire i seguenti test prima di procedere:${NC}"
echo -e "  1. Verifica che l'applicazione si avvii correttamente: ${BLUE}npm run dev${NC}"
echo -e "  2. Verifica che le rotte funzionino correttamente"
echo -e "  3. Verifica che i componenti si carichino correttamente"
echo -e "  4. Verifica che le API vengano chiamate correttamente"
echo -e "  5. Verifica che le pagine protette da middleware funzionino"
echo

read -p "Vuoi procedere con la pulizia? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  directories=("assets" "components" "layouts" "middleware" "pages" "plugins" "stores" "locales" "utils" "composables" "public")

  echo "Rimozione delle directory originali..."
  for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
      echo -n "  Rimozione di $dir/ "
      rm -rf "$dir"
      echo -e "${GREEN}✓${NC}"
    fi
  done

  echo -e "${GREEN}✓ Pulizia completata con successo.${NC}"
  echo
  echo -e "${BLUE}Struttura del progetto aggiornata:${NC}"
  echo -e "├── app/"
  echo -e "│   ├── assets/"
  echo -e "│   ├── components/"
  echo -e "│   ├── layouts/"
  echo -e "│   ├── middleware/"
  echo -e "│   ├── pages/"
  echo -e "│   ├── plugins/"
  echo -e "│   └── other directories..."
  echo -e "├── nuxt.config.ts (aggiornato)"
  echo -e "└── altri file di configurazione"
  echo
  echo -e "${GREEN}La migrazione è ora completa. Buon lavoro con Nuxt 4!${NC}"
else
  echo -e "${YELLOW}Operazione annullata. Le directory originali non sono state rimosse.${NC}"
fi
