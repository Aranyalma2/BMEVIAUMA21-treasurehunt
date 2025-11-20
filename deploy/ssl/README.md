# SSL Certificates

```bash
docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot -p 80:80 certbot/certbot certonly --standalone --email your-email@domain.com --agree-tos --no-eff-email -d your-domain.com
docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot -p 80:80 certbot/certbot certonly --standalone --email your-email@domain.com --agree-tos --no-eff-email -d admin.your-domain.com
```

```bash
mkdir frontend
mkdir admin
sudo cp /etc/letsencrypt/live/your-domain/frontend/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain/frontend/privkey.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain/admin/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain/admin/privkey.pem ./ssl/
sudo chmod 644 ./ssl/*.pem
```
