import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';
import { UserService } from 'src/user/user.service';

import { JwtUserDto } from './dto/jwt-user.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate a user by username and password
   * @param username The username of the user
   * @param pass The password of the user
   * @returns The user if the username and password are correct, null otherwise
   */
  async validateUser(username: string, pass: string): Promise<ResponseUserDto | null> {
    const { password, ...rest } = (await this.userService.findUserByUsername(username, true)) as User;
    if (await bcrypt.compare(pass, password)) {
      return rest;
    }
    return null;
  }

  /**
   * Hash a password
   * @param password The password to hash
   * @returns The hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Login a user
   * @param user The user to login
   * @returns The JWT token
   */
  async login(user: User): Promise<TokenDto> {
    const payload: JwtUserDto = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    } as TokenDto;
  }
}
