import { config } from 'dotenv';
import { from } from 'env-var';

config({ path: '../../.env' });
const env = from(process.env, {});

export const BACKEND_PORT = env.get('BACKEND_PORT').default(3000).asPortNumber();
export const NODE_ENV = env.get('NODE_ENV').default('development').asString();
export const IN_PRODUCTION = NODE_ENV === 'production';
export const IN_DEVELOPMENT = NODE_ENV === 'development';
export const VERSION = env.get('npm_package_version').required().asString();
export const JWT_SECRET = env.get('JWT_SECRET').required().asString();
export const ADMIN_URL = env.get('ADMIN_URL').required().asArray();
export const FRONTEND_URL = env.get('FRONTEND_URL').required().asArray();
export const CORS_ORIGIN = [...ADMIN_URL, ...FRONTEND_URL];
