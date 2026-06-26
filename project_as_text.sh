#! /usr/bin/env bash
#  by: Andrew Velez 2026

main() {
    local root filelist output dirs

    if [[ "$#" -ne 1 ]]; then
        printf 'Usage: %s PROJECT_ROOT\n' "${0##*/}" >&2
        return 2
    fi

    root="$(cd -- "$1" && pwd)" || return
    dirs=("${root}/src" "${root}/web")

    filelist=("${root}/build.js" "${root}/bun.lock" "${root}/bunfig.toml" "${root}/package.json"
        "${root}/tsconfig.json" "${root}/.gitignore")

    shopt -s nullglob

    for dir in "${dirs[@]}"; do
        if [[ -d "${dir}" ]]; then
            for file in "${dir}"/*; do
                [[ -f "${file}" ]] && filelist+=("${file}")
            done
        fi
    done

    {
        for filename in "${filelist[@]}"; do
            printf '```%s\n' "${filename##*/}"
            bat -p -P "${filename}"
            printf '\n```\n\n'
        done
    } > "project-source-code.txt"

}

main "$@"
