#!/usr/bin/env bash
set -e

UPSTREAM_REMOTE="upstream"
ORIGIN_REMOTE="origin"
MAIN_BRANCH="master"
DEV_BRANCH="dev"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting fork synchronization...${NC}"

if ! git remote | grep -q "$UPSTREAM_REMOTE"; then
    echo -e "${YELLOW}Error: Remote '$UPSTREAM_REMOTE' not found.${NC}"
    echo "Please add it using: git remote add $UPSTREAM_REMOTE <original-repo-url>"
    exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

echo -e "\n${GREEN}Fetching changes from $UPSTREAM_REMOTE...${NC}"
git fetch "$UPSTREAM_REMOTE"

sync_branch() {
    local branch=$1
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo -e "\n${GREEN}Syncing $branch...${NC}"
        git checkout "$branch"
        git merge "$UPSTREAM_REMOTE/$branch"
        git push "$ORIGIN_REMOTE" "$branch"
    else
        echo -e "\n${YELLOW}Skipping $branch (local branch not found)${NC}"
    fi
}

sync_branch "$DEV_BRANCH"
sync_branch "$MAIN_BRANCH"

if [ "$CURRENT_BRANCH" != "$DEV_BRANCH" ] && [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo -e "\n${GREEN}Switching back to $CURRENT_BRANCH...${NC}"
    git checkout "$CURRENT_BRANCH"
    
    echo -e "\n${YELLOW}Do you want to rebase '$CURRENT_BRANCH' onto '$DEV_BRANCH'? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[yY][eE][sS]|[yY]$ ]]; then
        echo -e "${GREEN}Rebasing $CURRENT_BRANCH onto $DEV_BRANCH...${NC}"
        git rebase "$DEV_BRANCH"
        echo -e "${GREEN}Rebase done. If you have already pushed this branch, you will need to force push:${NC}"
        echo "git push -f $ORIGIN_REMOTE $CURRENT_BRANCH"
    fi
fi

echo -e "\n${GREEN}Synchronization complete!${NC}"
