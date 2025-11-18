import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPointsByTaskTypeDto } from './dto/user-points-by-task-type.dto';
import { UserPointsDto } from './dto/user-points.dto';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get summarized leaderboard',
    description: 'Returns leaderboard with total points per user, sorted by points descending',
  })
  @ApiResponse({ status: 200, type: [UserPointsDto], description: 'Leaderboard data' })
  getLeaderboard(): Promise<UserPointsDto[]> {
    return this.leaderboardService.getLeaderboard();
  }

  @Get('bytasks')
  @ApiOperation({
    summary: 'Get leaderboard grouped by task type',
    description: 'Returns separate leaderboards for each task type',
  })
  @ApiResponse({ status: 200, type: [UserPointsByTaskTypeDto], description: 'Leaderboard data grouped by task type' })
  getLeaderboardByTasks(): Promise<UserPointsByTaskTypeDto[]> {
    return this.leaderboardService.getLeaderboardByTasks();
  }
}
