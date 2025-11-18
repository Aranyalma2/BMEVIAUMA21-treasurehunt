import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { BACKEND_PORT, CORS_ORIGIN, IN_DEVELOPMENT, IN_PRODUCTION } from './utils/environment';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { loadSwagger } from './dev-utils/swagger';
import { PrismaInitializationErrorFilter } from './utils/prisma-client-exception.filter';

async function bootstrap() {
  //Create app, init logger
  const app = await NestFactory.create(AppModule, {
    logger: IN_PRODUCTION ? ['log', 'error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api');

  //In development mode, start Swagger
  if (IN_DEVELOPMENT) {
    loadSwagger(app);
  }

  //Enable CORS
  app.enableCors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  });

  //Global pipes and filters
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new PrismaInitializationErrorFilter());
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  await app.listen(BACKEND_PORT);
}
bootstrap();
