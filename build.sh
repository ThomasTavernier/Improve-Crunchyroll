test -f ./*.zip && rm ./*.zip
git archive --format zip --output "$(git show master:manifest.json | grep '"version"' | cut -d\" -f4)".zip master
