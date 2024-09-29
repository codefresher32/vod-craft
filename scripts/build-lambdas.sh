#!/bin/bash

set -eu

trap 'exit 1' ERR

max_parallel_jobs=$(nproc)
max_parallel_jobs=$((max_parallel_jobs > 5 ? 5 : max_parallel_jobs))

ZIPPED_LAMBDAS_DIR="zipped-lambdas"

build_and_zip() {
    local dir="$1"
    [ -d "$dir" ] || return
    function_name=${dir/functions\//""}
    pushd "$dir"
    [ -f "package.json" ] && npm run build && npm run zip
    popd
}

move_zip() {
    local folder="$1"
    local filename=$(basename "$folder").zip
    [ -e "$folder/$filename" ] && mv "$folder/$filename" "$ZIPPED_LAMBDAS_DIR/$filename" || echo "File $filename does not exist in $folder. Skipped"
}

rm -rf $ZIPPED_LAMBDAS_DIR
mkdir -p $ZIPPED_LAMBDAS_DIR

job_ids=()
for dir in services/lambdas/*; do
    while [ $(jobs -p | wc -l) -ge "$max_parallel_jobs" ]; do
        sleep 1
    done
    build_and_zip "$dir" &
    job_ids+=("$!")
done

for job_id in "${job_ids[@]}"; do
    wait "$job_id"
done

echo "Done building & zipping"
echo "Moving zipped files..."

pids=""
for l in services/lambdas/*; do
    move_zip "$l" &
    pids+=" $!"
done

for pid in $pids; do
    wait $pid
done

echo "Done"
