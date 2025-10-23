#!/bin/bash
# Deployment Monitoring Dashboard
# Real-time monitoring of production deployments
#
# Usage: ./scripts/ops/deployment-dashboard.sh [--watch]
#
# @see DEVOPS-018

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="hotdash-production"
HEALTH_ENDPOINT="https://hotdash-production.fly.dev/health"
MONITORING_ENDPOINT="https://hotdash-production.fly.dev/api/monitoring/dashboard?period=1h"
WATCH_MODE=false

# Parse arguments
if [ "$1" = "--watch" ]; then
    WATCH_MODE=true
fi

# Function to display dashboard
show_dashboard() {
    clear
    echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║         Production Deployment Monitoring Dashboard            ║${NC}"
    echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "App: $APP_NAME"
    echo ""
    
    # 1. Application Status
    echo -e "${BOLD}${CYAN}1. Application Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if command -v flyctl &> /dev/null && [ -n "$FLY_API_TOKEN" ] || flyctl auth whoami &> /dev/null; then
        STATUS_JSON=$(flyctl status --app "$APP_NAME" --json 2>/dev/null || echo "{}")
        
        if [ "$STATUS_JSON" != "{}" ]; then
            APP_STATUS=$(echo "$STATUS_JSON" | jq -r '.Status // "unknown"')
            MACHINES=$(echo "$STATUS_JSON" | jq -r '.Machines | length // 0')
            HEALTHY=$(echo "$STATUS_JSON" | jq -r '[.Machines[] | select(.State == "started")] | length // 0')
            
            if [ "$APP_STATUS" = "running" ]; then
                echo -e "Status: ${GREEN}●${NC} Running"
            else
                echo -e "Status: ${YELLOW}●${NC} $APP_STATUS"
            fi
            
            echo "Machines: $HEALTHY/$MACHINES healthy"
            
            # Show machine details
            echo "$STATUS_JSON" | jq -r '.Machines[] | "  - \(.ID[0:8]): \(.State) (\(.Region))"' 2>/dev/null || true
        else
            echo -e "${YELLOW}⚠️ Unable to fetch status${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Fly CLI not available or not authenticated${NC}"
    fi
    
    echo ""
    
    # 2. Recent Deployments
    echo -e "${BOLD}${CYAN}2. Recent Deployments${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if command -v flyctl &> /dev/null && [ -n "$FLY_API_TOKEN" ] || flyctl auth whoami &> /dev/null; then
        RELEASES=$(flyctl releases --app "$APP_NAME" --json 2>/dev/null | jq -r '.[:5]' || echo "[]")
        
        if [ "$RELEASES" != "[]" ]; then
            echo "$RELEASES" | jq -r '.[] | "  v\(.Version): \(.Description // "No description") (\(.CreatedAt | split("T")[0]))"' 2>/dev/null || echo "  No releases found"
        else
            echo "  No releases found"
        fi
    else
        echo -e "${YELLOW}⚠️ Unable to fetch releases${NC}"
    fi
    
    echo ""
    
    # 3. Health Checks
    echo -e "${BOLD}${CYAN}3. Health Checks${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Basic health check
    HEALTH_START=$(date +%s%N)
    HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
    HEALTH_END=$(date +%s%N)
    HEALTH_TIME=$(( (HEALTH_END - HEALTH_START) / 1000000 ))
    
    if [ "$HEALTH_CODE" = "200" ] || [ "$HEALTH_CODE" = "302" ]; then
        echo -e "Basic Health: ${GREEN}✅ HEALTHY${NC} (${HEALTH_TIME}ms)"
    else
        echo -e "Basic Health: ${RED}❌ UNHEALTHY${NC} (HTTP $HEALTH_CODE)"
    fi
    
    # Monitoring health check
    MON_START=$(date +%s%N)
    MON_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MONITORING_ENDPOINT" 2>/dev/null || echo "000")
    MON_END=$(date +%s%N)
    MON_TIME=$(( (MON_END - MON_START) / 1000000 ))
    
    if [ "$MON_CODE" = "200" ]; then
        echo -e "Monitoring API: ${GREEN}✅ HEALTHY${NC} (${MON_TIME}ms)"
    else
        echo -e "Monitoring API: ${YELLOW}⚠️ WARNING${NC} (HTTP $MON_CODE)"
    fi
    
    echo ""
    
    # 4. Performance Metrics
    echo -e "${BOLD}${CYAN}4. Performance Metrics (Last Hour)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$MON_CODE" = "200" ]; then
        METRICS=$(curl -s "$MONITORING_ENDPOINT" 2>/dev/null || echo "{}")
        
        if [ "$METRICS" != "{}" ] && echo "$METRICS" | jq -e '.data' > /dev/null 2>&1; then
            # Extract metrics
            ERROR_TOTAL=$(echo "$METRICS" | jq -r '.data.errors.total // 0')
            ERROR_CRITICAL=$(echo "$METRICS" | jq -r '.data.errors.critical // 0')
            ROUTE_P95=$(echo "$METRICS" | jq -r '.data.performance.routes.p95 // 0')
            API_P95=$(echo "$METRICS" | jq -r '.data.performance.apis.p95 // 0')
            UPTIME=$(echo "$METRICS" | jq -r '.data.uptime.overall // 100')
            ALERTS=$(echo "$METRICS" | jq -r '.data.alerts.unacknowledged // 0')
            
            # Display metrics
            if [ "$ERROR_CRITICAL" -gt 0 ]; then
                echo -e "Errors: ${RED}$ERROR_TOTAL total, $ERROR_CRITICAL critical${NC}"
            elif [ "$ERROR_TOTAL" -gt 0 ]; then
                echo -e "Errors: ${YELLOW}$ERROR_TOTAL total${NC}"
            else
                echo -e "Errors: ${GREEN}$ERROR_TOTAL total${NC}"
            fi
            
            if [ "$ROUTE_P95" -gt 3000 ]; then
                echo -e "Route P95: ${YELLOW}${ROUTE_P95}ms${NC} (target: <3000ms)"
            else
                echo -e "Route P95: ${GREEN}${ROUTE_P95}ms${NC}"
            fi
            
            if [ "$API_P95" -gt 2000 ]; then
                echo -e "API P95: ${YELLOW}${API_P95}ms${NC} (target: <2000ms)"
            else
                echo -e "API P95: ${GREEN}${API_P95}ms${NC}"
            fi
            
            UPTIME_INT=$(echo "$UPTIME" | cut -d. -f1)
            if [ "$UPTIME_INT" -lt 99 ]; then
                echo -e "Uptime: ${RED}${UPTIME}%${NC} (target: >99%)"
            else
                echo -e "Uptime: ${GREEN}${UPTIME}%${NC}"
            fi
            
            if [ "$ALERTS" -gt 0 ]; then
                echo -e "Alerts: ${YELLOW}$ALERTS unacknowledged${NC}"
            else
                echo -e "Alerts: ${GREEN}$ALERTS unacknowledged${NC}"
            fi
        else
            echo "Unable to fetch metrics"
        fi
    else
        echo "Monitoring API unavailable"
    fi
    
    echo ""
    
    # 5. Recent Logs
    echo -e "${BOLD}${CYAN}5. Recent Logs (Last 10 lines)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if command -v flyctl &> /dev/null && [ -n "$FLY_API_TOKEN" ] || flyctl auth whoami &> /dev/null; then
        flyctl logs --app "$APP_NAME" --lines 10 2>/dev/null | tail -10 || echo "Unable to fetch logs"
    else
        echo -e "${YELLOW}⚠️ Unable to fetch logs${NC}"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$WATCH_MODE" = true ]; then
        echo "Refreshing in 30 seconds... (Ctrl+C to exit)"
    else
        echo "Run with --watch to enable auto-refresh"
    fi
}

# Main loop
if [ "$WATCH_MODE" = true ]; then
    while true; do
        show_dashboard
        sleep 30
    done
else
    show_dashboard
fi

