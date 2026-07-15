#! /usr/bin/env bash
#  SPDX-FileCopyrightText: 2026 Andrew Velez
#  SPDX-License-Identifier: GPL-3.0-or-later
#  @summary concatenates all project files to a single txt suitable for chatgpt

main() {
    local root filelist output dirs

    if [[ "$#" -ne 1 ]]; then
        printf 'Usage: %s PROJECT_ROOT\n' "${0##*/}" >&2
        return 2
    fi

    root="$(cd -- "$1" && pwd)" || return
    dirs=("${root}/src" "${root}/public" "${root}/public/css" "${root}/public/js")

    filelist=("${root}/AGENTS.md" "${root}/build.js" "${root}/bun.lock" "${root}/bunfig.toml" "${root}/package.json"
        "${root}/tsconfig.json")

    shopt -s nullglob

    for dir in "${dirs[@]}"; do
        if [[ -d "${dir}" ]] && [[ "${dir:0:1}" != "." ]]; then
            for file in "${dir}"/*; do
                if [[ -f "${file}" ]] && [[ "${file:0:1}" != "." ]]; then
                    filelist+=("${file}")
                fi
            done
        fi
    done

    {
        for filename in "${filelist[@]}"; do
            printf '```%s\n' "${filename##*/}"
            bat -p -P "${filename}"
            printf '\n```\n\n'
        done
    } > "project-source.txt"

}

main "$@"
