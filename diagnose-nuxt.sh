#!/bin/bash
# diagnostics.sh - Script di diagnostica per Nuxt.js 4
# Versione 1.0.0

echo "=== DIAGNOSTICA NUXT.JS ==="
echo "Data: $(date)"
echo "==========================="

# Verifica variabili d'ambiente
echo -e "\n📋 VARIABILI D'AMBIENTE"
echo "NODE_ENV: ${NODE_ENV:-non impostato}"
echo "NUXT_DEBUG: ${NUXT_DEBUG:-non impostato}"
echo "NUXT_PUBLIC_API_BASE: ${NUXT_PUBLIC_API_BASE:-non impostato}"

# Verifica file .env
if [ -f ".env" ]; then
  echo -e "\n📄 FILE .ENV TROVATO"
  cat .env | grep -v '^#' | grep .
else
  echo -e "\n⚠️ FILE .ENV NON TROVATO"
  echo "Creazione file .env con debug abilitato..."
  echo "NUXT_DEBUG=true" > .env
  echo "NODE_ENV=development" >> .env
  echo "NUXT_PUBLIC_API_BASE=http://localhost:8080/api" >> .env
  echo "File .env creato."
fi

# Verifica dipendenze
echo -e "\n📦 DIPENDENZE NUXT"
if grep -q "nuxt" package.json; then
  NUXT_VERSION=$(grep -A 5 '"dependencies"' package.json | grep nuxt | sed 's/.*"\^*\([0
  