# Production Deployment

This guide describes a general production deployment using nginx, PM2, pnpm,
and a TLS certificate. Adjust paths, usernames, domains, ports, and service
names for the target server.

## Architecture

A typical request passes through:

1. DNS or a CDN/proxy
2. nginx on ports `80` and `443`
3. Static frontend files from `dist`
4. API requests proxied to the application server
5. The application process managed by PM2
6. MySQL

The application server listens on `SERVER_PORT`, which defaults to `3000`.
Expose nginx publicly and keep the application port private when possible.

## Requirements

- Linux server with systemd
- Node.js and pnpm
- nginx
- PM2
- MySQL
- A domain pointing to the server
- A TLS certificate, such as one issued by Let's Encrypt

## Application directory

Clone the repository into a stable production path:

```sh
sudo mkdir -p /var/www/application
sudo chown "$USER":"$USER" /var/www/application
git clone REPOSITORY_URL /var/www/application
cd /var/www/application
```

Do not run production processes from a temporary directory or a developer's
working copy.

## Environment

Create `.env` from `.env.example` and configure all required values:

```sh
cp .env.example .env
chmod 600 .env
```

Important production values include:

```dotenv
NODE_ENV=production
DOMAIN=example.com
SERVER_PORT=3000

JWT_SECRET=replace-with-a-strong-random-secret

PROD_MYSQL_HOST=127.0.0.1
PROD_MYSQL_USERNAME=application
PROD_MYSQL_PASSWORD=replace-with-a-secret
PROD_MYSQL_DATABASE=application
```

Also configure Turnstile, CDN, and other optional integration values when
used. Keep `.env` out of version control.

## Install and build

```sh
cd /var/www/application
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

Run database migrations or other release preparation before restarting the
application when a release requires them.

## PM2

The repository includes `ecosystem.config.cjs`. Update its process name or
resource limits when needed, then start the application:

```sh
cd /var/www/application
pm2 startOrReload ecosystem.config.cjs
pm2 save
```

Verify:

```sh
pm2 status
pm2 describe APPLICATION_NAME
pm2 logs APPLICATION_NAME --lines 100
curl -I http://127.0.0.1:3000/api/
```

An authenticated API may return `401`, which still confirms that the server is
reachable.

Configure PM2 to start after reboot:

```sh
pm2 startup systemd -u "$USER" --hp "$HOME"
```

Run the root command printed by PM2, then:

```sh
pm2 save
sudo systemctl restart "pm2-$USER"
systemctl is-active "pm2-$USER"
```

Regenerate the startup unit after changing the active Node.js or PM2
installation because its executable paths may be version-specific.

## nginx

Create `/etc/nginx/sites-available/application.conf`:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://example.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    root /var/www/application/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}

server {
    listen 443 ssl http2;
    server_name www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    return 301 https://example.com$request_uri;
}
```

Enable and validate the configuration:

```sh
sudo ln -s /etc/nginx/sites-available/application.conf \
	/etc/nginx/sites-enabled/application.conf
sudo nginx -t
sudo systemctl reload nginx
```

## TLS

After DNS points to the server, request a certificate:

```sh
sudo certbot --nginx -d example.com -d www.example.com
```

Verify automatic renewal:

```sh
systemctl list-timers --all | grep certbot
sudo certbot renew --dry-run
```

When using a CDN or reverse proxy, configure its SSL mode to validate the
origin certificate.

## Deploy an update

```sh
cd /var/www/application
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pm2 startOrReload ecosystem.config.cjs
pm2 save
```

Then verify both the local API and public endpoint:

```sh
pm2 status
curl -I http://127.0.0.1:3000/api/
curl -I https://example.com
```

## Roll back

Check out the previous known-good revision, reinstall dependencies if the lock
file changed, rebuild, and reload:

```sh
git checkout PREVIOUS_REVISION
pnpm install --frozen-lockfile
pnpm run build
pm2 startOrReload ecosystem.config.cjs
pm2 save
```

Avoid rolling back database migrations unless a tested reverse migration
exists.

## Troubleshooting

Check each layer independently:

```sh
dig example.com
curl -I http://127.0.0.1:3000/api/
pm2 status
pm2 logs APPLICATION_NAME --lines 100
sudo nginx -t
systemctl status nginx
curl -I https://example.com
```

Common failures:

- `ERR_NAME_NOT_RESOLVED`: DNS record is missing or negatively cached.
- `502 Bad Gateway`: nginx cannot reach the application port.
- Certificate warning: certificate is expired, does not match the hostname, or
  the browser cached an earlier invalid certificate.
- Application missing after reboot: the PM2 systemd unit is inactive or the
  saved process list is stale.
