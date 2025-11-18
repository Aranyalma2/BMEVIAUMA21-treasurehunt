import { Injectable } from '@nestjs/common';
import { TaskType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { UserPointsByTaskTypeDto } from './dto/user-points-by-task-type.dto';
import { UserPointsDto } from './dto/user-points.dto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get summarized leaderboard with total points per user
   */
  async getLeaderboard(): Promise<UserPointsDto[]> {
    const completedMissions = await this.prisma.completedMission.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // Count missions per user
    const userPointsMap = new Map<string, { name: string; points: number }>();

    for (const completed of completedMissions) {
      const key = completed.user.username;
      const existing = userPointsMap.get(key);

      if (existing) {
        existing.points += 1;
      } else {
        userPointsMap.set(key, {
          name: completed.user.name || completed.user.username,
          points: 1,
        });
      }
    }

    // Convert to array and sort by points descending
    const leaderboard = Array.from(userPointsMap.values()).sort((a, b) => b.points - a.points);

    return leaderboard;
  }

  /**
   * Get leaderboard grouped by task type
   */
  async getLeaderboardByTasks(): Promise<UserPointsByTaskTypeDto[]> {
    const completedMissions = await this.prisma.completedMission.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        mission: {
          include: {
            task: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    });

    // Group by task type
    const taskTypeMap = new Map<TaskType, Map<string, { name: string; points: number }>>();

    for (const completed of completedMissions) {
      const taskType = completed.mission.task.type;
      const username = completed.user.username;

      if (!taskTypeMap.has(taskType)) {
        taskTypeMap.set(taskType, new Map());
      }

      const userMap = taskTypeMap.get(taskType);
      const existing = userMap.get(username);

      if (existing) {
        existing.points += 1;
      } else {
        userMap.set(username, {
          name: completed.user.name || completed.user.username,
          points: 1,
        });
      }
    }

    // Convert to array format
    const result: UserPointsByTaskTypeDto[] = [];

    for (const [type, userMap] of taskTypeMap.entries()) {
      const userPoints = Array.from(userMap.values()).sort((a, b) => b.points - a.points);

      result.push({
        type,
        userPoints,
      });
    }

    // Sort by task type for consistency
    result.sort((a, b) => a.type.localeCompare(b.type));

    return result;
  }
}
