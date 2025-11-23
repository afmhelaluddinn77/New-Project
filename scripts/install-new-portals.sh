#!/bin/bash

# Install and Setup Script for New Portals
# This script installs dependencies and sets up Nurses and IT portals

set -e

echo "🚀 Installing dependencies for new portals..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to install portal dependencies
install_portal() {
    local portal_name=$1
    local portal_dir=$2

    echo -e "${YELLOW}Installing $portal_name...${NC}"

    if [ -d "$portal_dir" ]; then
        cd "$portal_dir"

        # Install dependencies
        echo "Installing npm packages..."
        npm install

        echo -e "${GREEN}✓ $portal_name dependencies installed${NC}"
        cd - > /dev/null
    else
        echo -e "${RED}✗ Directory $portal_dir not found${NC}"
    fi
}

# Main installation
main() {
    echo "===================================="
    echo "New Portals Installation"
    echo "===================================="

    # Install Nurses Portal
    install_portal "Nurses Portal" "nurses-portal"

    # Install IT Portal
    install_portal "IT Portal" "it-portal"

    echo ""
    echo -e "${GREEN}===================================="
    echo "✓ Installation Complete!"
    echo "====================================${NC}"
    echo ""
    echo "To start the portals, run:"
    echo ""
    echo "  Nurses Portal:"
    echo "    cd nurses-portal && npm run dev"
    echo "    Access at: http://localhost:5180"
    echo ""
    echo "  IT Portal:"
    echo "    cd it-portal && npm run dev"
    echo "    Access at: http://localhost:5181"
    echo ""
    echo "Note: The TypeScript/JSX errors will resolve after installation"
    echo "      and TypeScript server restart."
}

# Run main installation
main "$@"
