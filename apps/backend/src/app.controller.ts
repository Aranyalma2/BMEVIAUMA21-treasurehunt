import { Controller, Get, ImATeapotException } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Just throw a Teapot on you.' })
  @ApiResponse({ status: 418, description: "I'm a teapot" })
  getRoot(): void {
    throw new ImATeapotException();
  }
}
