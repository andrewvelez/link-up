#! /usr/bin/env bash
#  by: Andrew Velez 2026

main() {
    local root
    root=${0%/*}/..
    bat -p -P "${root}"/build.js "${root}"/bun.lock "${root}"/bunfig.toml "${root}"/package.json \
        "${root}"/tsconfig.json "${root}"/src/* "${root}"/web/* > link-up.txt
}

main