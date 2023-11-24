
show_help() {
    echo "Usage: upload.sh [options] <...tables>"
    echo "Options:"
    echo "  -h, --help                      Show this help message and exit"
    echo "  -d, --directory                 Directory containing the assets and metadata.json"
    echo "  -v, --runtimeVersion            Runtime version to use"
    echo "  -r, --releaseName               Release name to use"
    echo "  --onlyStatus                    Only show HTTP status code from the response"
    echo "Example: ./scripts/upload.sh -d ./dist -v 1.0.0 -r production https://${server}/api/update/expo/upload"
}
# if permission denied: chmod +x ./scripts/upload.sh

# show help message when no arguments are provided or when -h or --help is provided
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--directory)
            directory="$2"
            shift
            shift
            ;;
        -v|--runtimeVersion)
            runtimeVersion="$2"
            shift
            shift
            ;;
        -r|--releaseName)
            releaseName="$2"
            shift
            shift
            ;;
        --onlyStatus)
            onlyStatus=true
            shift
            ;;
        -*|--*)
            echo "Unknown option $1"
            show_help
            exit 1
            ;;
        *)
            POSITIONAL_ARGS+=("$1") # save positional arg
            shift # past argument
        ;;
    esac
done
set -- "${POSITIONAL_ARGS[@]}" # restore positional parameters

host="$1"

# if no directory is provided throw an error
if [ -z "$directory" ]; then
    echo "No directory provided"
    show_help
    exit 1
fi

# if no runtime version is provided throw an error
if [ -z "$runtimeVersion" ]; then
    echo "No runtime version provided"
    show_help
    exit 1
fi

# if no release name is provided throw an error
if [ -z "$releaseName" ]; then
    echo "No release name provided"
    show_help
    exit 1
fi

# if no host is provided throw an error
if [ -z "$host" ]; then
    echo "No host provided"
    show_help
    exit 1
fi

files=()
for file in $directory/assets/*; do
    files+=(-F "assets=@$file")
done

for file in $directory/bundles/*; do
  files+=(-F "assets=@$file")
done

metadata=$(cat $directory/metadata.json)


expoClient=$(node ./scripts/exportClientExpoConfig.js)


# Set default curl options
curlOptions=(-X POST \
    -F "runtimeVersion=$runtimeVersion" \
    -F "releaseName=$releaseName" \
    -F "metadata=$metadata" \
    -F "expoClient=$expoClient" \
    "${files[@]}" \
    "$host")

if [ "$onlyStatus" = true ]; then
    # Add options to only show HTTP status code
    curlOptions=(-s -o /dev/null -w "%{http_code}" "${curlOptions[@]}")
fi

# Perform the curl call with the appropriate options
curl "${curlOptions[@]}"
