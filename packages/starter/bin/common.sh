#!/usr/bin/env bash

SKIP_PRETTIER=false
SKIP_ESLINT=false
SKIP_KNIP=false
for arg in "$@"; do
  case "$arg" in
    --skip-prettier) SKIP_PRETTIER=true ;;
    --skip-eslint)   SKIP_ESLINT=true ;;
    --skip-knip)     SKIP_KNIP=true ;;
  esac
done

function knip() {
    if $SKIP_KNIP; then
        return
    fi

    knipBin="${SCRIPT_DIR}/../node_modules/knip/bin/knip.js"
    knipConfig="${SCRIPT_DIR}/../dist/knip/knip.config.js"
    knipConfig=$(realpath --relative-to="${PWD}" "${knipConfig}")



    knip="$(node -p "require.resolve('knip')")"
    knipBin="$(dirname $knip)/../bin/knip.js"

    $knipBin "$@" --config "${knipConfig}" --directory .
}

function eslint() {
    if $SKIP_ESLINT; then
        return
    fi

    pnpm eslint . --max-warnings 0 "$@"
}

function prettier() {
    if $SKIP_PRETTIER; then
        return
    fi

    pnpm prettier . "$@" \
        --ignore-path "${SCRIPT_DIR}/.prettierignore" \
        --ignore-path .gitignore \
        --ignore-path .prettierignore
}


function display_error_box() {
    local title="$1"
    local message="$2"
    local extra="$3"

    echo -e "\n\033[1;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[1;31m❌ ERROR: ${title}\033[0m\n"
    echo -e "\033[1;37m${message}\033[0m"
    echo -e "\033[1;34m> ${extra}\033[0m"
    echo -e "\033[1;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m\n"
}