#! /usr/bin/env bash
#  by: Andrew Velez 2026

main() {
    local root filelist output dirs
    root="$(cd -- "$1" && pwd)" || return
    dirs=("${root}/src" "${root}/web")

    filelist=("${root}/build.js" "${root}/bun.lock" "${root}/bunfig.toml" "${root}/package.json"
        "${root}/tsconfig.json")

    shopt -s nullglob

    for dir in "${dirs[@]}"; do
        for file in "${dir}"/*; do
            filelist+=("${file}")
        done
    done

    {
        for filename in "${filelist[@]}"; do
            printf '```%s\n' "${filename##*/}"
            bat -p -P "${filename}"
            printf '\n```\n\n'
        done
    } > "link-up.txt"

}

main "$@"
