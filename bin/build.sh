cd $(git rev-parse --show-toplevel)
mkdir -p build
output=./build/$(git rev-parse --abbrev-ref HEAD)-$(git show HEAD:manifest.json | grep '"version"' | cut -d\" -f4).zip
test -f $output && rm $output
git archive --format=zip --output=$output HEAD
