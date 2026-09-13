#!/bin/bash
set -e

echo "=== Обновляю пакеты ==="
apt update -y

echo "=== Ставлю Nginx и Certbot ==="
apt install -y nginx certbot python3-certbot-nginx

echo "=== Создаю конфиг Nginx ==="
cat > /etc/nginx/sites-available/ink <<'NGINX'
server {
    listen 80;
    server_name api.ink-chat.ru;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ink /etc/nginx/sites-enabled/ink
rm -f /etc/nginx/sites-enabled/default

echo "=== Проверяю конфиг ==="
nginx -t

echo "=== Перезапускаю Nginx ==="
systemctl restart nginx

echo "=== Выпускаю SSL-сертификат Let's Encrypt ==="
certbot --nginx -d api.ink-chat.ru \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect

echo "=== Финальный перезапуск Nginx ==="
systemctl reload nginx

echo ""
echo "ГОТОВО! Проверь: https://api.ink-chat.ru/"
