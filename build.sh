test -f *.zip && rm *.zip
ignoreAttributes=(.gitattributes .gitignore .prettierrc README.md build.sh css-parser)
printf "%s export-ignore\n" "${ignoreAttributes[@]}" >.git/info/attributes
git archive --format zip --output $(git show master:manifest.json | grep '"version"' | cut -d\" -f4).zip master
