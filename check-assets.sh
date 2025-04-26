#!/bin/bash

# Script per verificare l'esistenza dei file assets
# v1.0.0

echo "Verifica della struttura assets..."

# Verifica l'esistenza della cartella assets/css
if [ -d "./assets/css" ]; then
    echo "✅ La cartella assets/css esiste"
else
    echo "❌ La cartella assets/css NON esiste"
    echo "    Creazione cartella..."
    mkdir -p ./assets/css
fi

# Verifica l'esistenza del file main.css
if [ -f "./assets/css/main.css" ]; then
    echo "✅ Il file main.css esiste"
else
    echo "❌ Il file main.css NON esiste"
    echo "    Creazione file..."
    cat > ./assets/css/main.css << 'EOF'
/* assets/css/main.css */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-link {
  font-weight: bold;
  text-decoration: underline;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.sidebar {
  min-height: 100vh;
  background-color: #212529;
  color: white;
}

.main-content {
  min-height: 100vh;
}

.language-switcher {
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
EOF
fi

echo "Verifica completata!"