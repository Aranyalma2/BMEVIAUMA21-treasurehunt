# Quick Start Guide

## 1. Clone and Navigate

```bash
cd BMEVIAUMA21-tresurehunt/deploy
```

### 2. Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

### 3. Add SSL Certificates

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

### 4. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
sudo ./deploy.sh deploy
```

### 5. Setup database

```
sudo ./deploy.sh migrate
sudo ./deploy.sh setupdb
```