# Deployment

## Request flow

### Cozynet

`cozynet.app` is managed in Cloudflare DNS and points to this server.

Requests pass through:

1. Cloudflare
2. nginx (`/etc/nginx/sites-available/cozynet.conf`)
3. Static frontend files in `/var/www/cozynet/dist`
4. API requests proxied to `127.0.0.1:3000`
5. The `cozynet` PM2 process defined in `ecosystem.config.cjs`

### Asphyxia

The configured hostname is `asphyxia.cozynet.network`, not
`asphyxia.cozynet.app`.

Requests pass through:

1. DNS directly to this server
2. nginx (`/etc/nginx/sites-available/asphyxia.conf`)
3. nginx Basic Auth
4. The `asphyxia.service` systemd unit
5. `/srv/asphyxia/asphyxia-core` on `127.0.0.1:8083`

Asphyxia is a native service and is intentionally managed by systemd rather
than PM2.

## Deploy Cozynet

Run from `/var/www/cozynet`:

```sh
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run build
pm2 startOrReload ecosystem.config.cjs
pm2 save
```

All PM2 applications are indexed centrally at
`/home/polaris/services/pm2/ecosystem.config.cjs`. See
`/home/polaris/services/pm2/README.md` for the complete inventory and common
operations.

The PM2 startup unit is `pm2-polaris.service`. It must be regenerated after
changing the active Node.js installation because its executable paths are
version-specific:

```sh
pm2 startup systemd -u polaris --hp /home/polaris
```

Run the `sudo` command printed by PM2, then:

```sh
pm2 save
sudo systemctl restart pm2-polaris
systemctl is-active pm2-polaris
```

The final command must print `active`. Do not leave PM2 running only from an
interactive shell, because systemd will not supervise or restart that daemon.

## Health checks

```sh
pm2 status
systemctl status asphyxia nginx pm2-polaris
curl -I https://cozynet.app
curl -I https://asphyxia.cozynet.network
```

Expected results:

- `cozynet.app`: `200`
- `asphyxia.cozynet.network`: `401` without Basic Auth
- `asphyxia.cozynet.app`: does not resolve unless separately added to DNS,
  nginx, and the TLS certificate
