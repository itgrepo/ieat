#!/bin/bash
cat > /etc/nginx/sites-available/sso-portal << 'NGINX_EOF'
server {
    listen 8080;
    listen 80;
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    location / {
        root /var/www/html/sso-portal;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /backend/ {
        rewrite ^/backend/(.*)$ /$1 break;
        proxy_pass http://192.168.10.207:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

systemctl restart nginx
