#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${SCRIPT_DIR}/common.sh"

eslint
if [ $? -ne 0 ]; then
    display_error_box "ESLint failed, please fix the warnings and try again"
    exit 1
fi

prettier --check
if [ $? -ne 0 ]; then
    display_error_box "Some files are not formatted correctly" \
        "You can auto-format them by running the following command:" \
        "pnpm wx-lint-fix"
    exit 1
fi

knip
if [ $? -ne 0 ]; then
    display_error_box "There are unused exports, files or dependencies." \
        "Make sure to remove any unused code or try auto-fix with the following command:" \
        "pnpm wx-lint-fix"
    exit 1
fi
