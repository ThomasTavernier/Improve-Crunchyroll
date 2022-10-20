test -f ./$(git rev-parse --abbrev-ref HEAD)-*.zip && rm ./$(git rev-parse --abbrev-ref HEAD)-*.zip
git archive --format zip --output "$(git rev-parse --abbrev-ref HEAD)-$(git show HEAD:manifest.json | grep '"version"' | cut -d\" -f4)".zip HEAD
