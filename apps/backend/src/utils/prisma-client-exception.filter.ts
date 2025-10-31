import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientInitializationError) // Only catch PrismaClientInitializationError
export class PrismaInitializationErrorFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientInitializationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle the PrismaClientInitializationError (DB unreachable)
    return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database server is unreachable. Please try again later.',
    });
  }
}
