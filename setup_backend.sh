#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt-get install -y nodejs
npm install -g pm2
cd /home/admin1/sso-backend
# In case it is already running
pm2 delete sso-backend 2>/dev/null || true
pm2 start dist/index.js --name sso-backend
pm2 save
pm2 startup | tail -n 1 > /tmp/pm2_startup.sh
chmod +x /tmp/pm2_startup.sh
/tmp/pm2_startup.sh
