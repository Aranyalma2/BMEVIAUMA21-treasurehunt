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
# Generate SSL Cert with Certbot
docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot -p 80:80 certbot/certbot certonly --standalone --email your-email@domain.com --agree-tos --no-eff-email -d your-domain.com
docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot -p 80:80 certbot/certbot certonly --standalone --email your-email@domain.com --agree-tos --no-eff-email -d admin.your-domain.com
```

```bash
# Copy certificates to ssl directories
mkdir -p ssl/{frontend,admin}
sudo cp /etc/letsencrypt/live/your-domain.com/{fullchain,privkey}.pem ./ssl/frontend/
sudo cp /etc/letsencrypt/live/admin.your-domain.com/{fullchain,privkey}.pem ./ssl/admin/
sudo chmod 644 ./ssl/*/*.pem
```

### 4. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
sudo ./deploy.sh deploy
```

### 5. Setup database

```bash
sudo ./deploy.sh migrate
sudo ./deploy.sh setupdb
```