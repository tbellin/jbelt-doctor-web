#!/bin/bash

# JBelt Doctor Web - Database Backup Script
# =========================================

set -e

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="jbelt-postgres"
DB_NAME="jbeltMapSrv"
DB_USER="jbeltMapSrv"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Check if database container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        print_error "Database container '$CONTAINER_NAME' is not running"
        exit 1
    fi
    print_success "Database container is running"
}

# Create database backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/jbelt_backup_$timestamp.sql"
    
    print_status "Creating database backup..."
    print_status "Backup file: $backup_file"
    
    # Create SQL dump
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$backup_file"
    
    # Compress backup
    gzip "$backup_file"
    backup_file="$backup_file.gz"
    
    # Get file size
    local file_size=$(du -h "$backup_file" | cut -f1)
    
    print_success "Backup created successfully"
    print_success "File: $backup_file"
    print_success "Size: $file_size"
    
    return 0
}

# Clean old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    find "$BACKUP_DIR" -name "jbelt_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0 | while IFS= read -r -d '' file; do
        rm "$file"
        print_status "Deleted old backup: $(basename "$file")"
        ((deleted_count++))
    done
    
    if [ $deleted_count -eq 0 ]; then
        print_status "No old backups to clean"
    else
        print_success "Cleaned up $deleted_count old backup(s)"
    fi
}

# List existing backups
list_backups() {
    print_status "Existing backups:"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        print_warning "No backups found"
        return
    fi
    
    echo ""
    printf "%-30s %-15s %-20s\n" "FILENAME" "SIZE" "DATE"
    printf "%-30s %-15s %-20s\n" "--------" "----" "----"
    
    for backup in "$BACKUP_DIR"/jbelt_backup_*.sql.gz; do
        if [ -f "$backup" ]; then
            local filename=$(basename "$backup")
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
            printf "%-30s %-15s %-20s\n" "$filename" "$size" "$date"
        fi
    done
    echo ""
}

# Restore database from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file to restore"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Restoring database from: $backup_file"
    
    # Check if file is compressed
    if [[ "$backup_file" == *.gz ]]; then
        zcat "$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
    else
        cat "$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
    fi
    
    print_success "Database restored successfully"
}

# Show help
show_help() {
    echo "JBelt Doctor Web - Database Backup Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup   - Create new database backup (default)"
    echo "  list     - List existing backups"
    echo "  restore  - Restore database from backup file"
    echo "  cleanup  - Clean up old backups"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Create backup"
    echo "  $0 backup                            # Create backup"
    echo "  $0 list                              # List backups"
    echo "  $0 restore backups/backup_file.sql.gz  # Restore backup"
    echo "  $0 cleanup                           # Clean old backups"
    echo ""
}

# Main function
main() {
    local command="${1:-backup}"
    
    case "$command" in
        "backup")
            create_backup_dir
            check_container
            create_backup
            cleanup_old_backups
            ;;
        "list")
            list_backups
            ;;
        "restore")
            check_container
            restore_backup "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"