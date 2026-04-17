#!/bin/bash

# Script de instalación y setup del proyecto SocialERP

set -e

echo "🚀 SocialERP - Setup automático"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funciones
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 no está instalado${NC}"
        echo "  Instala desde: $2"
        exit 1
    else
        echo -e "${GREEN}✓ $1 disponible${NC}"
    fi
}

install_dependencies() {
    local dir=$1
    local name=$2
    
    echo ""
    echo -e "${BLUE}📦 Instalando dependencias de $name...${NC}"
    cd "$dir"
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    echo -e "${GREEN}✓ Dependencias de $name instaladas${NC}"
    cd - > /dev/null
}

# Verificar requisitos
echo -e "${BLUE}Verificando requisitos previos...${NC}"
check_command "node" "https://nodejs.org"
check_command "npm" "https://nodejs.org"

echo ""
echo -e "${BLUE}Verificando MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB instalado localmente${NC}"
else
    echo -e "${BLUE}⚠ MongoDB no encontrado localmente${NC}"
    echo "  Opciones:"
    echo "  1. Instala MongoDB: https://docs.mongodb.com/manual/installation/"
    echo "  2. Usa MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas"
    echo ""
    read -p "¿Continuar de todos modos? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Obtener ruta del directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Backend
echo ""
echo -e "${BLUE}=== Backend ===${NC}"
if [ -d "$SCRIPT_DIR/backend" ]; then
    install_dependencies "$SCRIPT_DIR/backend" "Backend"
    
    # Verificar .env
    if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
        echo ""
        echo -e "${BLUE}Creando archivo .env del backend...${NC}"
        cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
        echo -e "${GREEN}✓ Archivo .env creado${NC}"
        echo "  Edita $SCRIPT_DIR/backend/.env si es necesario"
    else
        echo -e "${GREEN}✓ .env ya existe${NC}"
    fi
else
    echo -e "${RED}✗ No se encontró carpeta backend${NC}"
    exit 1
fi

# Frontend
echo ""
echo -e "${BLUE}=== Frontend ===${NC}"
if [ -d "$SCRIPT_DIR/frontend" ]; then
    install_dependencies "$SCRIPT_DIR/frontend" "Frontend"
    
    # Verificar .env
    if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
        echo ""
        echo -e "${BLUE}Creando archivo .env del frontend...${NC}"
        cp "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env"
        echo -e "${GREEN}✓ Archivo .env creado${NC}"
        echo "  Edita $SCRIPT_DIR/frontend/.env si es necesario"
    else
        echo -e "${GREEN}✓ .env ya existe${NC}"
    fi
else
    echo -e "${RED}✗ No se encontró carpeta frontend${NC}"
    exit 1
fi

# Resumen
echo ""
echo "================================"
echo -e "${GREEN}✅ Setup completado!${NC}"
echo "================================"
echo ""
echo "🚀 Próximos pasos:"
echo ""
echo "1. En una terminal, inicia el backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. En otra terminal, inicia el frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Abre http://localhost:3001 en tu navegador"
echo ""
echo "📖 Documentación:"
echo "   - QUICKSTART.md - Inicio rápido"
echo "   - README.md - Documentación completa"
echo "   - DEVELOPMENT.md - Guía para desarrolladores"
echo ""
