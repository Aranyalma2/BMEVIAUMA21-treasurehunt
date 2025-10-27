# For developers

### Prerequisites

- Node.js 22.16+
- Yarn 1.22.22
- PostgreSQL 18.0+

### Installation

You only need to install dependencies in the root directory.

```bash
yarn install
```

### Formatter Configuration

It is a must to use  Prettier in this project.

Set up Prettier in your IDE and check `fix on save` or `format on save` options.

You can run the following commands to check formatting issues.

```bash
yarn format:check
# or
yarn format
```

### Development

#### Create .env file

Use .env.example file as a template.

#### Good to know scripts

You can run each module separately. **(dev use only)**

```bash
yarn start:backend
```

```bash
yarn start:frontend
```

```bash
yarn start:compile
```

Migrate the DB scheme

```bash
yarn prisma migrate dev --skip-generate erd
```

Fill DB with test datas **(NEVER USE this in production, it will re-init the DB)**

```bash
yarn prisma:mock
```

Regenerate the DB scheme [ER-diagram](docs/specification/gfx/db-scheme.svg)

```bash
yarn prisma generate --generator erd
```

Start database WebUI

```bash
yarn prisma studio
```

#### Merging to main

There are recommended GitHub Actions workflows for this setup, which will fail if one of the following commands fails:

```bash
yarn lint
```

```bash
yarn format:check
```

```bash
yarn build:backend
```

```bash
yarn build:frontend
```

```bash
yarn build:admin
```