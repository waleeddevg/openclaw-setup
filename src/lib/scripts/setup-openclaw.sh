#!/bin/bash

# OpenClaw AI Auto-Setup Script
# Purpose: Full automation for ClawSetup AI
# Variables are injected as environment variables by the deployment service
# Do NOT pass these as shell arguments — they are set via 'export' before this script runs

set -e # Exit on error

# Validate required env vars
if [ -z "$CLAWSETUP_API_KEY" ]; then
    echo "ERROR: CLAWSETUP_API_KEY is not set."
    exit 1
fi

if [ -z "$CLAWSETUP_PROVIDER" ]; then
    CLAWSETUP_PROVIDER="openai"
fi

# Alias to shorter names for readability
API_KEY="$CLAWSETUP_API_KEY"
VPS_IP="$CLAWSETUP_VPS_IP"
PROVIDER="$CLAWSETUP_PROVIDER"

echo "Starting OpenClaw AI Setup for Provider: $PROVIDER..."

# 1. System Update
echo "Updating system packages..."
DEBIAN_FRONTEND=noninteractive apt-get update && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -q

# 2. Install Dependencies
echo "Installing base dependencies..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -q curl git build-essential software-properties-common

# 3. Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed."
fi

# 4. Install Node.js 22
echo "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
DEBIAN_FRONTEND=noninteractive apt-get install -y -q nodejs

# 5. Clone OpenClaw
echo "Cloning OpenClaw Repository..."
cd /root
if [ -d "openclaw" ]; then
    echo "Directory openclaw already exists. Updating..."
    cd openclaw
    git pull
else
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
fi

# 6. Configure Environment
echo "Configuring environment for $PROVIDER..."
case $PROVIDER in
    "gemini")
        ENV_VAR="GEMINI_API_KEY"
        ;;
    "groq")
        ENV_VAR="GROQ_API_KEY"
        ;;
    "anthropic")
        ENV_VAR="ANTHROPIC_API_KEY"
        ;;
    "kimi")
        ENV_VAR="KIMI_API_KEY"
        ;;
    "deepseek")
        ENV_VAR="DEEPSEEK_API_KEY"
        ;;
    *)
        ENV_VAR="OPENAI_API_KEY"
        ;;
esac

cat > .env << EOF
$ENV_VAR=$API_KEY
PORT=3000
EOF

# 7. Install & Build
echo "Installing NPM dependencies..."
npm install

# 8. Start with PM2
echo "Setting up PM2..."
npm install -g pm2
pm2 delete openclaw || true
pm2 start npm --name "openclaw" -- start

# 9. Save PM2 list
pm2 save
pm2 startup

echo "OpenClaw AI Setup Completed Successfully!"
echo "Server is running on port 3000."
