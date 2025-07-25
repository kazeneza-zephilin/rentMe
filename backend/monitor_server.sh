#!/bin/bash

# Server Health Monitoring Script
# This script monitors the RentMe backend server and alerts if it becomes unresponsive

HEALTH_URL="http://localhost:3001/health"
LOG_FILE="/Users/caz/Desktop/rentMe/backend/health_monitor.log"
PID_FILE="/Users/caz/Desktop/rentMe/backend/server.pid"

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check server health
check_health() {
    response=$(curl -s -w "%{http_code}" -o /dev/null --max-time 10 "$HEALTH_URL")
    return $response
}

# Function to check if server process is running
check_process() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            log_message "❌ Server process $pid is not running (PID file exists but process is dead)"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        # Check by process name
        pid=$(pgrep -f "node server.js")
        if [ -n "$pid" ]; then
            echo "$pid" > "$PID_FILE"
            return 0
        else
            log_message "❌ No server process found"
            return 1
        fi
    fi
}

# Main monitoring function
monitor_server() {
    log_message "🔍 Starting server health check..."
    
    # Check if process is running
    if ! check_process; then
        log_message "🚨 Server process is not running!"
        return 1
    fi
    
    # Check health endpoint
    if check_health; then
        case $? in
            200)
                log_message "✅ Server is healthy (HTTP 200)"
                return 0
                ;;
            *)
                log_message "⚠️ Server responded with HTTP $? - may be having issues"
                return 1
                ;;
        esac
    else
        log_message "🚨 Server health check failed - server may be crashed or unresponsive"
        return 1
    fi
}

# Auto-restart function (use with caution)
auto_restart() {
    log_message "🔄 Attempting to restart server..."
    
    # Kill existing process
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        kill "$pid" 2>/dev/null
        sleep 3
        kill -9 "$pid" 2>/dev/null
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining node server.js processes
    pkill -f "node server.js"
    sleep 2
    
    # Start server
    cd /Users/caz/Desktop/rentMe/backend
    nohup node server.js > server_restart_$(date +%s).log 2>&1 &
    new_pid=$!
    echo "$new_pid" > "$PID_FILE"
    
    log_message "🚀 Server restarted with PID $new_pid"
    
    # Wait a moment and check if it started successfully
    sleep 5
    if monitor_server; then
        log_message "✅ Server restart successful"
        return 0
    else
        log_message "❌ Server restart failed"
        return 1
    fi
}

# Main script logic
case "${1:-monitor}" in
    "monitor")
        monitor_server
        exit $?
        ;;
    "restart")
        auto_restart
        exit $?
        ;;
    "watch")
        log_message "👀 Starting continuous monitoring (every 30 seconds)..."
        while true; do
            if ! monitor_server; then
                log_message "🚨 Health check failed! Server may need attention."
                # Uncomment the next line to enable auto-restart
                # auto_restart
            fi
            sleep 30
        done
        ;;
    *)
        echo "Usage: $0 {monitor|restart|watch}"
        echo "  monitor  - Check server health once"
        echo "  restart  - Restart the server"
        echo "  watch    - Continuously monitor server (every 30 seconds)"
        exit 1
        ;;
esac
