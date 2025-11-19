import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from 'src/auth/auth.service';

import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { User as UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new user
   * @param createUserDto - The user data
   * @returns The created user
   * @throws {BadRequestException} - If the username or email already exists
   */
  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      createUserDto.password = await this.authService.hashPassword(createUserDto.password);
      const { password, ...rest } = await this.prisma.user.create({ data: createUserDto });
      return rest as ResponseUserDto;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta.target as string[];
          if (target.includes('username')) {
            throw new BadRequestException(`Username already exists: ${createUserDto.username}`);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Find all users
   * @returns All users
   */
  async findAll(): Promise<ResponseUserDto[]> {
    return await this.prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });
  }

  /**
   * Has admin user?
   * @returns true if there is at least one admin user
   */
  async hasAdminUser(): Promise<boolean> {
    return (await this.prisma.user.count({ where: { role: 'ADMIN' } })) > 0;
  }

  /**
   * Find a user by ID
   * @param id - The user ID
   * @returns The user
   * @throws {NotFoundException} - If no user is found
   */
  async findOne(id: number): Promise<ResponseUserDto> {
    const userObject = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            completedMissions: true,
          },
        },
      },
    });
    if (!userObject) {
      throw new NotFoundException(`User not found with ID: ${id}`);
    }

    // Calculate score based on completed missions
    const score = userObject._count.completedMissions;
    const completedTaskCount = userObject._count.completedMissions;

    const { _count, ...rest } = userObject;
    return {
      ...rest,
      score,
      completedTaskCount,
    } as ResponseUserDto;
  }

  /**
   * Find a user by username
   * @param username - The username
   * @returns The user
   * @throws {NotFoundException} - If no user is found
   */
  async findUserByUsername(username: string, includePassword: boolean = false): Promise<ResponseUserDto | UserEntity> {
    const selectFields = includePassword
      ? undefined // Return all fields if includePassword is true
      : { id: true, username: true, name: true, email: true, role: true, createdAt: true }; // Select specific fields otherwise

    const userObject = await this.prisma.user.findUnique({
      where: { username },
      select: selectFields,
    });

    if (!userObject) {
      throw new NotFoundException(`User not found with username: ${username}`);
    }
    return userObject;
  }

  /**
   * Update a user
   * @param id - The user ID
   * @param updateUserDto - The user data to update
   * @returns The updated user
   * @throws {NotFoundException} - If no user is found
   * @throws {BadRequestException} - If the or email already exists
   */
  async update(id: number, updateUserDto: UpdateUserDto | UpdateUserAdminDto): Promise<ResponseUserDto> {
    try {
      // Hash the password if it is provided
      if (updateUserDto.password) {
        updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
      }

      // Update the user
      const { password, ...rest } = await this.prisma.user.update({ where: { id }, data: updateUserDto });
      return rest;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User not found with ID: ${id}`);
        }
      }
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id - The user ID
   * @throws {NotFoundException} - If no user is found
   */
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User not found with ID: ${id}`);
        }
      }
      throw error;
    }
  }

  /**
   * Get completed missions for a user
   * @param userId - The user ID
   * @returns List of completed missions with details
   */
  async getCompletedMissions(userId: number) {
    const completedMissions = await this.prisma.completedMission.findMany({
      where: { userId },
      include: {
        mission: {
          select: {
            id: true,
            name: true,
            description: true,
            longitude: true,
            latitude: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return completedMissions.map((cm) => ({
      id: cm.mission.id,
      name: cm.mission.name,
      description: cm.mission.description,
      longitude: cm.mission.longitude,
      latitude: cm.mission.latitude,
      completedAt: cm.completedAt,
    }));
  }
}
