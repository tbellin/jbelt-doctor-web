# Makefile per semplificare comandi Docker JBelt Doctor Web
# ---------------------------------------------------------

# Variabili
PROJECT_NAME=jbelt-doctor-web
DOCKER_COMPOSE=docker-compose
DOCKER_COMPOSE_DEV=$(DOCKER_COMPOSE) -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD=$(DOCKER_COMPOSE) -f docker-compose.yml
DOCKER_COMPOSE_INTEGRATED=$(DOCKER_COMPOSE) -f docker-compose.integrated.yml

# Comandi e target principali
.PHONY: help dev dev-build dev-down prod prod-build prod-down integrated integrated-build integrated-down logs prune network

# Target predefinito
help:
	@echo "🚀 JBelt Doctor Web - Comandi disponibili:"
	@echo ""
	@echo "📦 Frontend Solo (con backend esterno):"
	@echo "  make dev            - Avvia frontend Docker (sviluppo)"
	@echo "  make dev-build      - Ricostruisce e avvia frontend"
	@echo "  make dev-down       - Arresta frontend"
	@echo "  make prod           - Avvia frontend Docker (produzione)"
	@echo "  make prod-build     - Ricostruisce e avvia frontend produzione"
	@echo "  make prod-down      - Arresta frontend produzione"
	@echo ""
	@echo "🔗 Frontend + Backend Integrato:"
	@echo "  make integrated     - Avvia stack completo (frontend + backend)"
	@echo "  make integrated-build - Ricostruisce e avvia stack completo"
	@echo "  make integrated-down  - Arresta stack completo"
	@echo ""
	@echo "📊 Testing e Monitoring:"
	@echo "  make test-api       - Testa connessione API backend"
	@echo "  make logs           - Mostra i log frontend"
	@echo "  make logs-integrated - Mostra i log dello stack integrato"
	@echo "  make status         - Mostra lo stato dei servizi"
	@echo ""
	@echo "🧹 Utility:"
	@echo "  make network        - Crea la rete Docker jbelt-network"
	@echo "  make prune          - Rimuove container e immagini non utilizzate"

# Ambiente di sviluppo
dev:
	@echo "Avvio ambiente di sviluppo..."
	@$(DOCKER_COMPOSE_DEV) up

dev-build:
	@echo "Ricostruzione ambiente di sviluppo..."
	@$(DOCKER_COMPOSE_DEV) up --build

dev-down:
	@echo "Arresto ambiente di sviluppo..."
	@$(DOCKER_COMPOSE_DEV) down

# Ambiente di produzione
prod:
	@echo "Avvio ambiente di produzione..."
	@$(DOCKER_COMPOSE_PROD) up -d

prod-build:
	@echo "Ricostruzione ambiente di produzione..."
	@$(DOCKER_COMPOSE_PROD) up -d --build

prod-down:
	@echo "Arresto ambiente di produzione..."
	@$(DOCKER_COMPOSE_PROD) down

# Stack integrato Frontend + Backend
integrated:
	@echo "🚀 Avvio stack integrato JBelt Doctor..."
	@./start-integrated.sh

integrated-build:
	@echo "🔨 Ricostruzione stack integrato JBelt Doctor..."
	@$(DOCKER_COMPOSE_INTEGRATED) up --build -d

integrated-down:
	@echo "🛑 Arresto stack integrato JBelt Doctor..."
	@$(DOCKER_COMPOSE_INTEGRATED) down

# Network setup
network:
	@echo "📡 Creazione rete Docker jbelt-network..."
	@docker network create jbelt-network --driver bridge 2>/dev/null || echo "Rete jbelt-network già esistente"

# Testing
test-api:
	@echo "🔍 Test connessione API backend..."
	@NODE_ENV=development ./test-api-connection.sh

# Log e monitoring
logs:
	@$(DOCKER_COMPOSE_PROD) logs -f

logs-prod:
	@$(DOCKER_COMPOSE_PROD) logs -f

logs-integrated:
	@$(DOCKER_COMPOSE_INTEGRATED) logs -f

status:
	@echo "📊 Stato servizi JBelt Doctor:"
	@echo "Frontend standalone:"
	@$(DOCKER_COMPOSE_PROD) ps 2>/dev/null || echo "Frontend non avviato"
	@echo ""
	@echo "Stack integrato:"
	@$(DOCKER_COMPOSE_INTEGRATED) ps 2>/dev/null || echo "Stack integrato non avviato"

# Pulizia
prune:
	@echo "🧹 Pulizia container e immagini non utilizzate..."
	@docker system prune -f

# Version: 1.2.0