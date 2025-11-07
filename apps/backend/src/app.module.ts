import { HttpStatus, Module } from '@nestjs/common';
import { PrismaModule, providePrismaClientExceptionFilter } from 'nestjs-prisma';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true }), AuthModule, UserModule, RolesModule],
  controllers: [AppController],
  providers: [
    providePrismaClientExceptionFilter({
      // Prisma Error Code: HTTP Status Response
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  ],
})
export class AppModule {}
