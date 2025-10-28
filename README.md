# BMEVIAUMA21-treasurehunt
BMEVIAUMA21 - Tresure Hunt homework application

## Getting Started

### Prerequisites

- Node.js 22.16+
- Yarn 1.22.22
- PostgreSQL 18.0+

### Production installation and run

You only need to install dependencies in the root directory.

```bash
yarn install --prod
```

#### Create .env file

Use .env.example file as a template.
*Set NODE_ENV to production*

#### Build & Run

You can build and run each module separately:

**Backend server**
*Database required (R/W)*
```bash
yarn build:backend
yarn start:backend:prod
```

**Frontend page**
*Backend server required*
```bash
yarn build:frontend
yarn start:frontend:prod
```

**Admin page**
*Backend server required*
```bash
yarn build:admin
yarn start:admin:prod
```

## Dev & Git Branches

* **main**: (default) Collect every modification here, do NOT commit directly there, create a pull request for merge in other branches.

> [!IMPORTANT]
> For high velocity one module development use module branches (backend, admin, etc...)\
> For one feature across multiple module development create an issue with feature description and create an auto (dedicated) branch for it.

For other dev stuff check [DEV.md](DEV.md)
