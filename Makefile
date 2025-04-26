# Makefile per semplificare comandi Docker
# ------------------------------------

# Variabili
PROJECT_NAME=nuxt-jwt-tutorial
DOCKER_COMPOSE=docker-compose
DOCKER_COMPOSE_DEV=$(DOCKER_COMPOSE) -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD=$(DOCKER_COMPOSE) -f docker-compose.yml

# Comandi e target principali
.PHONY: help dev dev-build dev-down prod prod-build prod-down logs prune

# Target predefinito
help:
	@echo "Comandi disponibili:"
	@echo "  make dev         - Avvia ambiente di sviluppo con hot-reload"
	@echo "  make dev-build   - Ricostruisce e avvia ambiente di sviluppo"
	@echo "  make dev-down    - Arresta ambiente di sviluppo"
	@echo "  make prod        - Avvia ambiente di produzione"
	@echo "  make prod-build  - Ricostruisce e avvia ambiente di produzione"
	@echo "  make prod-down   - Arresta ambiente di produzione"
	@echo "  make logs        - Mostra i log dell'ambiente attivo"
	@echo "  make logs-prod   - Mostra i log dell'ambiente di produzione"
	@echo "  make prune       - Rimuove container e immagini non utilizzate"

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

# Log
logs:
	@$(DOCKER_COMPOSE) logs -f

logs-prod:
	@$(DOCKER_COMPOSE_PROD) logs -f

# Pulizia
prune:
	@echo "Pulizia container e immagini non utilizzate..."
	@docker system prune -f

# Version: 1.0.0