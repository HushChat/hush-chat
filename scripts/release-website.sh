#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT="web"

# Function to get the latest tag for a project
get_latest_tag() {
    local project=$1
    local latest_tag=$(git tag -l "${project}-v*" | grep -E "^${project}-v[0-9]+\.[0-9]+\.[0-9]{1,2}$" | sort -V | tail -n 1)
    echo "$latest_tag"
}

# Function to increment version
increment_version() {
    local version=$1
    local project=$2

    if [[ -z "$version" ]]; then
        echo "${project}-v0.0.01"
        return
    fi

    local version_number=$(echo "$version" | sed "s/${project}-v//")

    IFS='.' read -r major minor patch <<< "$version_number"

    major=$((10#$major))
    minor=$((10#$minor))
    patch=$((10#$patch))

    if (( patch >= 99 )); then
        patch=1
        ((minor++))

        if (( minor > 9 )); then
            minor=0
            ((major++))
        fi
    else
        ((patch++))
    fi

    printf "${project}-v%d.%d.%02d" "$major" "$minor" "$patch"
}

# Main script
main() {
    echo -e "${BLUE}=== HushChat Website Deployment ===${NC}\n"

    # Fetch latest tags from remote
    echo -e "${YELLOW}Fetching latest tags from remote...${NC}"
    git fetch --tags
    echo ""

    # Get latest tag
    LATEST_TAG=$(get_latest_tag "$PROJECT")

    if [[ -z "$LATEST_TAG" ]]; then
        echo -e "${YELLOW}No existing tags found for ${PROJECT}${NC}"
    else
        echo -e "Latest tag: ${GREEN}${LATEST_TAG}${NC}"
    fi

    # Generate next tag
    NEXT_TAG=$(increment_version "$LATEST_TAG" "$PROJECT")
    echo -e "Next tag: ${GREEN}${NEXT_TAG}${NC}\n"

    # Create the tag
    echo -e "${YELLOW}Creating tag ${NEXT_TAG}...${NC}"
    git tag "$NEXT_TAG"

    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ Tag created successfully!${NC}"

        # Push the tag
        echo -e "\n${YELLOW}Pushing tag to remote...${NC}"
        git push origin "$NEXT_TAG"

        if [[ $? -eq 0 ]]; then
            echo -e "\n${GREEN}✓ Tag ${NEXT_TAG} pushed successfully!${NC}"
            echo -e "${GREEN}✓ HushChat Website deployment triggered!${NC}"
        else
            echo -e "\n${RED}✗ Failed to push tag${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Failed to create tag${NC}"
        exit 1
    fi
}

main "$@"
