#!/bin/bash

# JBelt Doctor Integrated Startup Script
# This script starts both frontend and backend services together

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting JBelt Doctor Integrated Stack${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Create external network if it doesn't exist
echo -e "${YELLOW}📡 Creating Docker network...${NC}"
docker network create jbelt-network --driver bridge 2>/dev/null || echo "Network jbelt-network already exists"

# Set default environment variables
export JBELT_APP_VERSION=${JBELT_APP_VERSION:-"3.1.1"}
export JBELT_APP_SPRING_NAME=${JBELT_APP_SPRING_NAME:-"jbeltmapsrv"}
export NODE_ENV=${NODE_ENV:-"development"}
export NUXT_DEBUG=${NUXT_DEBUG:-"false"}

# Database configuration
export POSTGRES_USERNAME=${POSTGRES_USERNAME:-"jbeltMapSrv"}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"jbeltMapSrv"}
export POSTGRES_DB=${POSTGRES_DB:-"jbeltMapSrv"}
export POSTGRES_URL=${POSTGRES_URL:-"jdbc:postgresql://postgresql:5432/"}

# PgAdmin configuration
export PGADMIN_EMAIL=${PGADMIN_EMAIL:-"info@ivytech.it"}
export PGADMIN_PASSWORD=${PGADMIN_PASSWORD:-"admin"}

echo -e "${YELLOW}🏗️ Building and starting services...${NC}"

# Check if we need to build the backend image
if [ "$1" = "--build-backend" ]; then
    echo -e "${YELLOW}🔨 Building backend image...${NC}"
    # This assumes you have a way to build the backend image
    # You may need to adjust this based on your backend build process
    if [ -f "../../backend/jbelt-map-srv/pom.xml" ]; then
        echo -e "${YELLOW}📦 Building Spring Boot application...${NC}"
        cd ../../backend/jbelt-map-srv
        ./mvnw clean package -DskipTests
        docker build -t ${JBELT_APP_SPRING_NAME}:${JBELT_APP_VERSION} .
        cd -
    fi
fi

# Start the integrated stack
docker-compose -f docker-compose.integrated.yml up --build -d

echo -e "${GREEN}✅ Services started successfully!${NC}"
echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose -f docker-compose.integrated.yml ps

echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "  Frontend (Nuxt): ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:80/api${NC}"
echo -e "  PgAdmin: ${GREEN}http://localhost:80/pgadmin${NC}"
echo -e "  Backend Health: ${GREEN}http://localhost:80/management/health${NC}"

echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "  View all logs: ${GREEN}docker-compose -f docker-compose.integrated.yml logs -f${NC}"
echo -e "  Frontend logs: ${GREEN}docker-compose -f docker-compose.integrated.yml logs -f jbelt-doctor-web${NC}"
echo -e "  Backend logs: ${GREEN}docker-compose -f docker-compose.integrated.yml logs -f app${NC}"

echo -e "${YELLOW}🛑 Stop services:${NC}"
echo -e "  Stop all: ${GREEN}docker-compose -f docker-compose.integrated.yml down${NC}"

echo -e "${GREEN}🎉 JBelt Doctor Stack is ready!${NC}"