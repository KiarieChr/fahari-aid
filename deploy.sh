#!/usr/bin/env bash
# Direct shortcut to deploy/deploy.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/deploy/deploy.sh" ]; then
    bash "${SCRIPT_DIR}/deploy/deploy.sh" "$@"
else
    echo "Error: deploy/deploy.sh not found."
    exit 1
fi

