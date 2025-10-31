import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { SystemRolesDto } from './dto/roles.dto';

@Injectable()
export class RolesService {
  /**
   * Get all system roles
   * @returns All system roles
   */
  getSystem() {
    const response = new SystemRolesDto();
    response.roles = Object.values(Role);
    return response;
  }
}
