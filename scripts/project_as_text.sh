#! /usr/bin/env bash
#  by: Andrew Velez 2026

main() {
    local root filelist output
    root=${0%/*}/..
    filelist=("${root}/build.js" "${root}/bun.lock" "${root}/bunfig.toml" "${root}/package.json"
        "${root}/tsconfig.json" "${root}/src/core.js" "${root}/src/routes.js" "${root}/web/app.js"
        "${root}/web/index.html" "${root}/web/manifest.json" "${root}/web/styles.css" "${root}/web/sw.js")

    {
        for filename in "${filelist[@]}"; do
            printf '```%s\n' "${filename##*/}"
            bat -p -P "${filename}"
            printf '\n```\n\n'
        done
    } > "link-up.txt"

}

main "@"
