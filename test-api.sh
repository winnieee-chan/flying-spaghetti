#!/bin/bash

# Quick API Test Script
# Tests the main server endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing Server API..."
echo "========================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get all jobs
echo -e "\n${YELLOW}1. Testing GET /jd${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/jd")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success${NC}"
    JOB_ID=$(echo "$BODY" | jq -r '.[0].id // empty' 2>/dev/null)
    if [ -n "$JOB_ID" ]; then
        echo "   First job ID: $JOB_ID"
    else
        echo -e "${YELLOW}   Warning: No jobs found${NC}"
    fi
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
fi

# Test 2: Get candidates for first job
if [ -n "$JOB_ID" ]; then
    echo -e "\n${YELLOW}2. Testing GET /$JOB_ID/cd${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/$JOB_ID/cd")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        CANDIDATE_ID=$(echo "$BODY" | jq -r '.[0].id // empty' 2>/dev/null)
        CANDIDATE_COUNT=$(echo "$BODY" | jq 'length' 2>/dev/null)
        if [ -n "$CANDIDATE_ID" ]; then
            echo "   Found $CANDIDATE_COUNT candidates"
            echo "   First candidate ID: $CANDIDATE_ID"
        else
            echo -e "${YELLOW}   Warning: No candidates found${NC}"
        fi
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
else
    echo -e "\n${YELLOW}2. Skipping candidate test (no job ID)${NC}"
fi

# Test 3: Update candidate stage
if [ -n "$JOB_ID" ] && [ -n "$CANDIDATE_ID" ]; then
    echo -e "\n${YELLOW}3. Testing PUT /$JOB_ID/cd/$CANDIDATE_ID/stage${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/$JOB_ID/cd/$CANDIDATE_ID/stage" \
        -H "Content-Type: application/json" \
        -d '{"stageId": "engaged"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
else
    echo -e "\n${YELLOW}3. Skipping stage update test (no job/candidate ID)${NC}"
fi

# Test 4: Send message
if [ -n "$JOB_ID" ] && [ -n "$CANDIDATE_ID" ]; then
    echo -e "\n${YELLOW}4. Testing POST /$JOB_ID/cd/$CANDIDATE_ID/messages${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/$JOB_ID/cd/$CANDIDATE_ID/messages" \
        -H "Content-Type: application/json" \
        -d '{"content": "Test message from API test script"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
else
    echo -e "\n${YELLOW}4. Skipping message test (no job/candidate ID)${NC}"
fi

# Test 5: AI Analyze (if candidate exists)
if [ -n "$JOB_ID" ] && [ -n "$CANDIDATE_ID" ]; then
    echo -e "\n${YELLOW}5. Testing POST /$JOB_ID/cd/$CANDIDATE_ID/ai/analyze${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/$JOB_ID/cd/$CANDIDATE_ID/ai/analyze" \
        -H "Content-Type: application/json" \
        -d '{}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
        echo "$BODY"
    fi
else
    echo -e "\n${YELLOW}5. Skipping AI analyze test (no job/candidate ID)${NC}"
fi

echo -e "\n========================="
echo -e "${GREEN}Tests completed!${NC}"
echo ""
echo "Note: Make sure the server is running on port 3000"
echo "      Start it with: cd server && npm run dev"
