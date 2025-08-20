#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}🔍 TypeScript Checker Starting...${NC}"
echo ""

# Run svelte-check and capture output
if ! bun run svelte-check --tsconfig ./tsconfig.app.json --threshold error --watch 2>&1 | while IFS= read -r line; do
  if [[ $line == *"Error:"* ]]; then
    echo -e "${RED}${BOLD}❌ $line${NC}"
  elif [[ $line == *"found"*"errors"* ]]; then
    echo -e "${RED}${BOLD}🚨 $line${NC}"
  elif [[ $line == *"Getting Svelte diagnostics"* ]]; then
    echo -e "${BLUE}📊 $line${NC}"
  elif [[ $line == *"Watching for file changes"* ]]; then
    echo -e "${GREEN}${BOLD}👀 $line${NC}"
  elif [[ $line == *"Loading svelte-check"* ]]; then
    echo -e "${YELLOW}🔄 $line${NC}"
  else
    echo "$line"
  fi
done; then
  echo -e "${GREEN}${BOLD}✅ No TypeScript errors found!${NC}"
else
  echo -e "${RED}${BOLD}💥 TypeScript check failed with errors${NC}"
fi
