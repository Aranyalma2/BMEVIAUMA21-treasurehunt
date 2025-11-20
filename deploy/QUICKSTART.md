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

Check ```/ssl```

### 4. Deploy!

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh deploy
```
