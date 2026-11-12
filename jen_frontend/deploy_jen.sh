#!/usr/bin/env bash
# ==============================================================================
# Deployment Script for "Jesus Enthroned" React Application
# Domain: jesusenthroned.royalsoftwares.co.ke
# Environment: Ubuntu (Bun + Nginx)
# ==============================================================================

set -euo pipefail

# --- Color Definitions ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Configuration & Paths ---
EXPECTED_DIR="/root/projects/jen"
TARGET_DIR="/var/www/jesusenthroned-react"
NGINX_CONF="/etc/nginx/sites-available/jesusenthroned"
DOMAIN="jesusenthroned.royalsoftwares.co.ke"

# --- Error Handler ---
trap 'echo -e "\n${RED}✗ [ERROR] Deployment failed at line $LINENO. See error output above.${NC}\n"' ERR

# Helper functions for formatted output
log_step() {
    echo -e "\n${YELLOW}==>${NC} ${BOLD}$1${NC}"
}

log_info() {
    echo -e "    ${CYAN}ℹ${NC} $1"
}

log_success() {
    echo -e "    ${GREEN}✓${NC} $1"
}

# ------------------------------------------------------------------------------
# STEP 1: Verify execution directory
# ------------------------------------------------------------------------------
log_step "1/10: Verifying working directory..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$SCRIPT_DIR" == "$EXPECTED_DIR" || "$PWD" == "$EXPECTED_DIR" ]]; then
    cd "$EXPECTED_DIR"
elif [[ -d "$EXPECTED_DIR" && -f "$EXPECTED_DIR/package.json" ]]; then
    cd "$EXPECTED_DIR"
    log_info "Switched to expected directory: $EXPECTED_DIR"
elif [[ -f "$SCRIPT_DIR/package.json" ]]; then
    cd "$SCRIPT_DIR"
    log_info "Running from current project root: $SCRIPT_DIR"
else
    echo -e "${RED}Error: Must be run from $EXPECTED_DIR or a directory containing package.json.${NC}"
    exit 1
fi
log_success "Current directory: $(pwd)"

# ------------------------------------------------------------------------------
# STEP 2: Pull latest code from Git
# ------------------------------------------------------------------------------
log_step "2/10: Pulling latest code from Git..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    TARGET_BRANCH="main"

    # Fall back to master if main does not exist
    if ! git show-ref --verify --quiet "refs/heads/main" && git show-ref --verify --quiet "refs/heads/master"; then
        TARGET_BRANCH="master"
    fi

    log_info "Fetching origin and switching to $TARGET_BRANCH (current: $CURRENT_BRANCH)..."
    git fetch origin
    git checkout "$TARGET_BRANCH"
    git pull origin "$TARGET_BRANCH"
    log_success "Git code updated to latest $(git rev-parse --short HEAD) on branch '$TARGET_BRANCH'"
else
    echo -e "${RED}Error: Current directory is not a Git repository.${NC}"
    exit 1
fi

# ------------------------------------------------------------------------------
# STEP 3: Install dependencies using Bun
# ------------------------------------------------------------------------------
log_step "3/10: Installing dependencies with Bun..."
# Ensure Bun is available in PATH
if ! command -v bun &>/dev/null; then
    if [[ -x "$HOME/.bun/bin/bun" ]]; then
        export PATH="$HOME/.bun/bin:$PATH"
    elif [[ -x "/root/.bun/bin/bun" ]]; then
        export PATH="/root/.bun/bin:$PATH"
    else
        echo -e "${RED}Error: 'bun' command not found in PATH or ~/.bun/bin. Please install Bun.${NC}"
        exit 1
    fi
fi

log_info "Using $(bun --version | sed 's/^/Bun /')"
bun install
log_success "Dependencies installed successfully"

# ------------------------------------------------------------------------------
# STEP 4: Build production bundle using Bun
# ------------------------------------------------------------------------------
log_step "4/10: Building production assets (bun run build)..."
bun run build

# Determine output directory
BUILD_OUTPUT=""
if [[ -d "dist" && -f "dist/index.html" ]]; then
    BUILD_OUTPUT="dist"
elif [[ -d "build" && -f "build/index.html" ]]; then
    BUILD_OUTPUT="build"
elif [[ -d "dist" ]]; then
    BUILD_OUTPUT="dist"
else
    echo -e "${RED}Error: Build directory ('dist' or 'build') not found after build.${NC}"
    exit 1
fi
log_success "Production build completed successfully in './$BUILD_OUTPUT/'"

# ------------------------------------------------------------------------------
# STEP 5: Safely clean the live directory
# ------------------------------------------------------------------------------
log_step "5/10: Cleaning live production directory ($TARGET_DIR)..."
mkdir -p "$TARGET_DIR"

# Clean directory contents without removing the directory itself
find "$TARGET_DIR" -mindepth 1 -delete
log_success "Live directory cleaned safely"

# ------------------------------------------------------------------------------
# STEP 6: Copy newly built files to live directory
# ------------------------------------------------------------------------------
log_step "6/10: Copying built assets to $TARGET_DIR..."
cp -r "$BUILD_OUTPUT"/* "$TARGET_DIR"/
log_success "Assets copied to $TARGET_DIR"

# ------------------------------------------------------------------------------
# STEP 7: Set ownership and permissions
# ------------------------------------------------------------------------------
log_step "7/10: Configuring ownership and permissions..."
log_info "Setting ownership to root:root..."
chown -R root:root "$TARGET_DIR"

log_info "Setting directory permissions to 755..."
find "$TARGET_DIR" -type d -exec chmod 755 {} +

log_info "Setting file permissions to 644..."
find "$TARGET_DIR" -type f -exec chmod 644 {} +
log_success "Ownership (root:root) and permissions (755/644) applied"

# ------------------------------------------------------------------------------
# STEP 8: Test Nginx configuration
# ------------------------------------------------------------------------------
log_step "8/10: Testing Nginx configuration..."
if command -v nginx &>/dev/null; then
    nginx -t
    log_success "Nginx syntax test passed"
else
    echo -e "${YELLOW}Warning: 'nginx' command not found, skipping syntax test.${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 9: Reload Nginx
# ------------------------------------------------------------------------------
log_step "9/10: Reloading Nginx..."
if command -v systemctl &>/dev/null; then
    systemctl reload nginx
    log_success "Nginx service reloaded via systemctl"
elif command -v nginx &>/dev/null; then
    nginx -s reload
    log_success "Nginx reloaded via 'nginx -s reload'"
else
    echo -e "${YELLOW}Warning: Could not reload Nginx automatically.${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 10: Success Message
# ------------------------------------------------------------------------------
log_step "10/10: Verifying deployment..."
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}${BOLD}✓ DEPLOYMENT SUCCEEDED!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "  ${BOLD}Application:${NC}  Jesus Enthroned (React SPA)"
echo -e "  ${BOLD}Domain:${NC}       https://${DOMAIN}"
echo -e "  ${BOLD}Live Path:${NC}    ${TARGET_DIR}"
echo -e "  ${BOLD}Commit:${NC}       $(git rev-parse --short HEAD) - $(git log -1 --pretty=%B | head -n 1)"
echo -e "  ${BOLD}Timestamp:${NC}    $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "${GREEN}======================================================================${NC}\n"
