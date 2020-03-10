for package in packages/*; do
    pushd "$package" > /dev/null
    share_file="./shared.txt"
    if [ -f "$share_file" ]; then

        cat "$share_file" | xargs cp
    fi
    popd > /dev/null
done