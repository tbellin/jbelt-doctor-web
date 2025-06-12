#!/bin/bash

# Script per avviare il server di sviluppo con debug attivato
echo "🔍 Avvio server di sviluppo con debug attivato..."
echo "📌 Il pannello debug sarà visibile nell'angolo in basso a destra"
echo "📌 Tutte le chiamate API verranno loggate nel pannello"
echo "🧹 Pulizia cache e directory di build..."
echo ""

# Pulisci le directory di build e avvia con debug
pnpm run dev:debug