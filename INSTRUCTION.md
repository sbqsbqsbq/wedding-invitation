# dy-jeen-wedding.info HTTPS + Nginx 포워딩 (Ubuntu 24.04 / root / 3000)

## 0. 전제
- 서버: Ubuntu 24.04
- 계정: `root`
- 앱 포트: `3000`
- 도메인: `dy-jeen-wedding.info`

---

## 1. DNS 설정
도메인 관리 콘솔에서 A 레코드 추가:

- A 레코드
- 호스트: `@`
- 값: `서버 공인 IP`

---

## 2. Nginx 설치
```bash
apt update
apt install -y nginx
```

---

## 3. Nginx 리버스 프록시 설정
`/etc/nginx/sites-available/dy-jeen-wedding.info` 생성:

```nginx
server {
    listen 80;
    server_name dy-jeen-wedding.info;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

적용:
```bash
ln -s /etc/nginx/sites-available/dy-jeen-wedding.info /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 4. HTTPS 발급 (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d dy-jeen-wedding.info
```

- 설치 중 “HTTP → HTTPS 리다이렉트” 선택 권장.

---

## 5. 최종 Nginx 설정 예시 (자동 반영됨)
```nginx
server {
    listen 80;
    server_name dy-jeen-wedding.info;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name dy-jeen-wedding.info;

    ssl_certificate /etc/letsencrypt/live/dy-jeen-wedding.info/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dy-jeen-wedding.info/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 6. 자동 갱신 확인
```bash
certbot renew --dry-run
```

---

## 7. 확인
브라우저 접속:
- https://dy-jeen-wedding.info
