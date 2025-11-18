import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Status, TaskType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import {
  CompletableMultiChoiceTaskDto,
  CompletableSimpleQuestionTaskDto,
  CompletableTaskDto,
  CompletableTrueOrFalseTaskDto,
} from './dto/completable-task.dto';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionExtractDto } from './dto/mission-extract.dto';
import { ResponseMissionDto } from './dto/response-mission.dto';
import { MultiChoiceAnswerSubmitDto, SimpleQuestionAnswerDto, TrueOrFalseAnswerDto } from './dto/task-answer.dto';
import { MultiChoiceTaskDto, SimpleQuestionTaskDto, TaskDto, TrueOrFalseTaskDto } from './dto/task.dto';

@Injectable()
export class MissionService {
  // Distance in meters to consider mission as "nearby"
  private readonly NEARBY_DISTANCE_M = 1000;
  // Distance in meters to allow starting/submitting mission
  private readonly MISSION_RADIUS_M = 100;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi_1 = (lat1 * Math.PI) / 180;
    const phi_2 = (lat2 * Math.PI) / 180;
    const delta_phi = ((lat2 - lat1) * Math.PI) / 180;
    const delta_lambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) + Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if user is within mission radius
   */
  private isWithinMissionRadius(userLat: number, userLon: number, missionLat: number, missionLon: number): boolean {
    const distance = this.calculateDistance(userLat, userLon, missionLat, missionLon);
    return distance <= this.MISSION_RADIUS_M;
  }

  /**
   * Find nearby approved missions
   */
  async findNearby(longitude: number, latitude: number, userId: number): Promise<MissionExtractDto[]> {
    // Get all approved missions
    const missions = await this.prisma.mission.findMany({
      where: {
        status: Status.APPROVED,
      },
      select: {
        id: true,
        name: true,
        description: true,
        longitude: true,
        latitude: true,
        completedBy: {
          where: {
            userId: userId,
          },
        },
      },
    });

    // Filter by distance and exclude completed missions
    const nearbyMissions = missions
      .filter((mission) => {
        const distance = this.calculateDistance(latitude, longitude, mission.latitude, mission.longitude);
        const isCompleted = mission.completedBy.length > 0;
        return distance <= this.NEARBY_DISTANCE_M && !isCompleted;
      })
      .map((mission) => ({
        id: mission.id,
        name: mission.name,
        description: mission.description,
        longitude: mission.longitude,
        latitude: mission.latitude,
      }));

    return nearbyMissions;
  }

  /**
   * Get mission details (without task answers)
   */
  async findOne(id: number, userId?: number): Promise<MissionExtractDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id, status: Status.APPROVED },
      select: {
        id: true,
        name: true,
        description: true,
        longitude: true,
        latitude: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    return mission;
  }

  /**
   * Create a new mission
   */
  async create(createMissionDto: CreateMissionDto, userId: number): Promise<ResponseMissionDto> {
    const { location, task, ...missionData } = createMissionDto;

    // Create task based on type
    let taskData: any;
    switch (task.type) {
      case TaskType.TRUE_OR_FALSE:
        const tfTask = task.derivativeTask as TrueOrFalseTaskDto;
        taskData = {
          type: task.type,
          trueOrFalseTask: {
            create: {
              question: tfTask.question,
              answer: tfTask.answer,
            },
          },
        };
        break;

      case TaskType.MULTI_CHOICE:
        const mcTask = task.derivativeTask as MultiChoiceTaskDto;
        taskData = {
          type: task.type,
          multiChoiceTask: {
            create: {
              question: mcTask.question,
              answers: {
                create: mcTask.answers,
              },
            },
          },
        };
        break;

      case TaskType.SIMPLE_QUESTION:
        const sqTask = task.derivativeTask as SimpleQuestionTaskDto;
        taskData = {
          type: task.type,
          simpleQuestionTask: {
            create: {
              question: sqTask.question,
              answers: sqTask.answers,
            },
          },
        };
        break;
    }

    const mission = await this.prisma.mission.create({
      data: {
        ...missionData,
        longitude: location.longitude,
        latitude: location.latitude,
        createdBy: {
          connect: { id: userId },
        },
        task: {
          create: taskData,
        },
      },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
      },
    });

    return this.mapMissionToResponse(mission);
  }

  /**
   * Start a mission - returns task without answers
   */
  async startMission(id: number, userId: number, userLat: number, userLon: number): Promise<CompletableTaskDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id, status: Status.APPROVED },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
        completedBy: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    // Check if already completed
    if (mission.completedBy.length > 0) {
      throw new BadRequestException('Mission already completed by user');
    }

    // Check if user is within mission radius
    if (!this.isWithinMissionRadius(userLat, userLon, mission.latitude, mission.longitude)) {
      throw new ForbiddenException('User is not within mission radius');
    }

    // Return task without answers
    return this.mapTaskToCompletable(mission.task);
  }

  /**
   * Submit mission answer
   */
  async submitMission(
    id: number,
    userId: number,
    userLat: number,
    userLon: number,
    answer: any,
  ): Promise<{ result: 'Success' | 'Failed' }> {
    const mission = await this.prisma.mission.findUnique({
      where: { id, status: Status.APPROVED },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
        completedBy: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    // Check if already completed
    if (mission.completedBy.length > 0) {
      throw new BadRequestException('Mission already completed by user');
    }

    // Check if user is within mission radius
    if (!this.isWithinMissionRadius(userLat, userLon, mission.latitude, mission.longitude)) {
      throw new ForbiddenException('User is not within mission radius');
    }

    // Validate answer
    let isCorrect = false;
    switch (mission.task.type) {
      case TaskType.TRUE_OR_FALSE:
        const tfAnswer = answer as TrueOrFalseAnswerDto;
        isCorrect = tfAnswer.answer === mission.task.trueOrFalseTask.answer;
        break;

      case TaskType.MULTI_CHOICE:
        const mcAnswer = answer as MultiChoiceAnswerSubmitDto;
        const selectedAnswer = mission.task.multiChoiceTask.answers[mcAnswer.selectedIndex];
        isCorrect = selectedAnswer?.isTrue === true;
        break;

      case TaskType.SIMPLE_QUESTION:
        const sqAnswer = answer as SimpleQuestionAnswerDto;
        const normalizedAnswer = sqAnswer.answer.toLowerCase().trim();
        isCorrect = mission.task.simpleQuestionTask.answers.some((a) => a.toLowerCase().trim() === normalizedAnswer);
        break;
    }

    // If correct, mark as completed
    if (isCorrect) {
      await this.prisma.completedMission.create({
        data: {
          userId: userId,
          missionId: id,
        },
      });
    }

    return { result: isCorrect ? 'Success' : 'Failed' };
  }

  /**
   * Find all missions (admin)
   */
  async findAll(status?: Status): Promise<ResponseMissionDto[]> {
    const missions = await this.prisma.mission.findMany({
      where: status ? { status } : undefined,
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return missions.map((mission) => this.mapMissionToResponse(mission));
  }

  /**
   * Delete a mission (admin)
   */
  async remove(id: number): Promise<ResponseMissionDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    await this.prisma.mission.delete({
      where: { id },
    });

    return this.mapMissionToResponse(mission);
  }

  /**
   * Approve a mission (admin)
   */
  async approve(id: number, userId: number): Promise<ResponseMissionDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    if (mission.status !== Status.PENDING) {
      throw new BadRequestException('Mission is not pending approval');
    }

    const updated = await this.prisma.mission.update({
      where: { id },
      data: {
        status: Status.APPROVED,
        approvedBy: {
          connect: { id: userId },
        },
        approvedAt: new Date(),
      },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
      },
    });

    return this.mapMissionToResponse(updated);
  }

  /**
   * Reject a mission (admin)
   */
  async reject(id: number, userId: number): Promise<ResponseMissionDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      throw new NotFoundException(`Mission not found with ID: ${id}`);
    }

    if (mission.status !== Status.PENDING) {
      throw new BadRequestException('Mission is not pending approval');
    }

    const updated = await this.prisma.mission.update({
      where: { id },
      data: {
        status: Status.REJECTED,
        approvedBy: {
          connect: { id: userId },
        },
        approvedAt: new Date(),
      },
      include: {
        task: {
          include: {
            trueOrFalseTask: true,
            multiChoiceTask: {
              include: {
                answers: true,
              },
            },
            simpleQuestionTask: true,
          },
        },
      },
    });

    return this.mapMissionToResponse(updated);
  }

  /**
   * Helper: Map mission to response DTO
   */
  private mapMissionToResponse(mission: any): ResponseMissionDto {
    const task: TaskDto = {
      type: mission.task.type,
      derivativeTask: this.mapTaskDetails(mission.task),
    };

    return {
      id: mission.id,
      name: mission.name,
      description: mission.description,
      task,
      longitude: mission.longitude,
      latitude: mission.latitude,
      status: mission.status,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
      createdById: mission.createdById,
      approvedAt: mission.approvedAt,
      approvedById: mission.approvedById,
    };
  }

  /**
   * Helper: Map task to completable format (without answers)
   */
  private mapTaskToCompletable(task: any): CompletableTaskDto {
    let derivativeTask:
      | CompletableTrueOrFalseTaskDto
      | CompletableMultiChoiceTaskDto
      | CompletableSimpleQuestionTaskDto;

    switch (task.type) {
      case TaskType.TRUE_OR_FALSE:
        derivativeTask = {
          question: task.trueOrFalseTask.question,
        };
        break;

      case TaskType.MULTI_CHOICE:
        derivativeTask = {
          question: task.multiChoiceTask.question,
          answers: task.multiChoiceTask.answers.map((a: any) => ({ text: a.text })),
        };
        break;

      case TaskType.SIMPLE_QUESTION:
        derivativeTask = {
          question: task.simpleQuestionTask.question,
        };
        break;
    }

    return {
      type: task.type,
      derivativeTask,
    };
  }

  /**
   * Helper: Map task details with answers
   */
  private mapTaskDetails(task: any): TrueOrFalseTaskDto | MultiChoiceTaskDto | SimpleQuestionTaskDto {
    switch (task.type) {
      case TaskType.TRUE_OR_FALSE:
        return {
          question: task.trueOrFalseTask.question,
          answer: task.trueOrFalseTask.answer,
        };

      case TaskType.MULTI_CHOICE:
        return {
          question: task.multiChoiceTask.question,
          answers: task.multiChoiceTask.answers.map((a: any) => ({
            text: a.text,
            isTrue: a.isTrue,
          })),
        };

      case TaskType.SIMPLE_QUESTION:
        return {
          question: task.simpleQuestionTask.question,
          answers: task.simpleQuestionTask.answers,
        };
    }
  }
}
