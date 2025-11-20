#!/bin/bash

# Deployment helper script for Treasure Hunt Application
# This script helps with common deployment tasks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        print_info "Please copy .env.example to .env and configure it"
        exit 1
    fi
    print_success ".env file exists"

    if [ ! -f "ssl/admin/fullchain.pem" ] || [ ! -f "ssl/admin/privkey.pem" ]; then
        print_warning "SSL certificates not found in ssl/admin/ directory"
        print_info "See ssl/README.md for instructions"
    else
        print_success "SSL certificates found for admin"
    fi

    if [ ! -f "ssl/frontend/fullchain.pem" ] || [ ! -f "ssl/frontend/privkey.pem" ]; then
        print_warning "SSL certificates not found in ssl/frontend/ directory"
        print_info "See ssl/README.md for instructions"
    else
        print_success "SSL certificates found for frontend"
    fi
}

configure_nginx() {
    print_info "Configuring Nginx..."
    
    if [ -z "$DOMAIN" ]; then
        print_error "DOMAIN environment variable not set in .env"
        exit 1
    fi
    
    if [ -f "nginx/conf.d/default.conf.template" ]; then
        envsubst '${DOMAIN}' < nginx/conf.d/default.conf.template > nginx/conf.d/default.conf
        print_success "Nginx configuration generated"
    else
        print_error "nginx/conf.d/default.conf.template not found"
        exit 1
    fi
}

build_services() {
    print_info "Building services..."
    sudo docker compose build --no-cache "$@"
    print_success "Build complete"
}

start_services() {
    print_info "Starting services..."
    sudo docker compose up -d "$@"
    print_success "Services started"
}

stop_services() {
    print_info "Stopping services..."
    sudo docker compose down
    print_success "Services stopped"
}

restart_services() {
    print_info "Restarting services..."
    sudodocker compose restart "$@"
    print_success "Services restarted"
}

show_logs() {
    sudo docker compose logs -f "$@"
}

show_status() {
    print_info "Service status:"
    sudo docker-compose ps
}

run_migrations() {
    print_info "Running database migrations..."
    sudo docker compose exec backend sh -c "cd ../database && yarn prisma migrate deploy"
    print_success "Migrations complete"
}

backup_database() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    print_info "Creating database backup: $BACKUP_FILE"
    sudo docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-treasurehunt}" "${POSTGRES_DB:-treasurehunt}" > "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

restore_database() {
    if [ -z "$1" ]; then
        print_error "Please specify backup file"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi
    
    print_warning "This will restore the database from $1"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Restore cancelled"
        exit 0
    fi
    
    print_info "Restoring database from $1"
    sudo docker compose exec -T postgres psql -U "${POSTGRES_USER:-treasurehunt}" "${POSTGRES_DB:-treasurehunt}" < "$1"
    print_success "Database restored"
}

show_help() {
    cat << EOF
Treasure Hunt Application - Deployment Helper

Usage: ./deploy.sh [command] [options]

Commands:
    setup           - Check prerequisites and configure nginx
    build           - Build all services
    build <service> - Build specific service (frontend, admin, backend)
    start           - Start all services
    stop            - Stop all services
    restart         - Restart all services
    restart <service> - Restart specific service
    logs            - Show logs from all services
    logs <service>  - Show logs from specific service
    status          - Show status of all services
    migrate         - Run database migrations
    backup          - Create database backup
    restore <file>  - Restore database from backup file
    deploy          - Full deployment (build + start)
    update          - Update and restart services
    help            - Show this help message

Examples:
    ./deploy.sh setup
    ./deploy.sh deploy
    ./deploy.sh logs backend
    ./deploy.sh restart nginx
    ./deploy.sh backup
    ./deploy.sh restore backup_20250119_120000.sql

EOF
}

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Main script logic
case "$1" in
    setup)
        check_prerequisites
        configure_nginx
        ;;
    build)
        check_prerequisites
        build_services "${@:2}"
        ;;
    start)
        check_prerequisites
        start_services "${@:2}"
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services "${@:2}"
        ;;
    logs)
        show_logs "${@:2}"
        ;;
    status)
        show_status
        ;;
    migrate)
        run_migrations
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    deploy)
        check_prerequisites
        configure_nginx
        build_services
        start_services
        print_success "Deployment complete!"
        show_status
        ;;
    update)
        print_info "Updating application..."
        build_services
        restart_services
        print_success "Update complete!"
        show_status
        ;;
    help|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
