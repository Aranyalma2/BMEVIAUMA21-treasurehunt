name: Static Analysis

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  lint-check:
    name: ESLint Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: yarn install

      - name: Run ESLint check
        run: yarn lint

  format-check:
    name: Prettier Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: yarn install

      - name: Run Prettier check
        run: yarn format:check

  build-backend:
    name: Build Backend
    runs-on: ubuntu-latest
    needs:
      - lint-check
      - format-check
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build:backend
  
  build-frontend:
    name: Build Frontend
    runs-on: ubuntu-latest
    needs:
      - lint-check
      - format-check
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build:frontend

  build-admin:
    name: Build Admin-panel
    runs-on: ubuntu-latest
    needs:
      - lint-check
      - format-check
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build:admin