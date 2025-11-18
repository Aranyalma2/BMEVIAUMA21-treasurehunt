import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, Status } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtUserDto } from '../auth/dto/jwt-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompletableTaskDto } from './dto/completable-task.dto';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionExtractDto } from './dto/mission-extract.dto';
import { ResponseMissionDto } from './dto/response-mission.dto';
import { StartMissionDto } from './dto/start-mission.dto';
import { SubmitMissionDto } from './dto/submit-mission.dto';
import { MissionService } from './mission.service';

@ApiTags('mission')
@Controller('mission')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get()
  @ApiOperation({
    summary: 'List missions near the user',
    description: 'Returns a simplified array of missions with ids, position, and name for rendering on map',
  })
  @ApiQuery({ name: 'longitude', type: Number, required: true, description: 'User longitude coordinate' })
  @ApiQuery({ name: 'latitude', type: Number, required: true, description: 'User latitude coordinate' })
  @ApiResponse({ status: 200, type: [MissionExtractDto], description: 'List of nearby missions' })
  findNearby(
    @Query('longitude') longitude: string,
    @Query('latitude') latitude: string,
    @CurrentUser() user: JwtUserDto,
  ): Promise<MissionExtractDto[]> {
    return this.missionService.findNearby(Number(longitude), Number(latitude), user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'List all missions',
    description: 'ADMIN role necessary. Returns all missions, optionally filtered by status.',
  })
  @ApiQuery({
    name: 'status',
    enum: Status,
    required: false,
    description: 'Filter missions by status',
  })
  @ApiResponse({ status: 200, type: [ResponseMissionDto], description: 'List of all missions' })
  findAll(@Query('status') status?: Status): Promise<ResponseMissionDto[]> {
    return this.missionService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific mission' })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiQuery({ name: 'longitude', type: Number, required: false, description: 'User longitude coordinate' })
  @ApiQuery({ name: 'latitude', type: Number, required: false, description: 'User latitude coordinate' })
  @ApiResponse({ status: 200, type: MissionExtractDto, description: 'Mission details' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUserDto): Promise<MissionExtractDto> {
    return this.missionService.findOne(Number(id), user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new mission request' })
  @ApiResponse({ status: 201, type: ResponseMissionDto, description: 'Created mission' })
  @ApiResponse({ status: 400, description: 'Invalid mission data' })
  create(@Body() createMissionDto: CreateMissionDto, @CurrentUser() user: JwtUserDto): Promise<ResponseMissionDto> {
    return this.missionService.create(createMissionDto, user.id);
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Start a mission on location',
    description: 'Server returns the task without answers. User must be within mission radius.',
  })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiResponse({ status: 200, type: CompletableTaskDto, description: 'Task to complete' })
  @ApiResponse({ status: 400, description: 'Mission already completed' })
  @ApiResponse({ status: 403, description: 'User is not within mission radius' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  startMission(
    @Param('id') id: string,
    @Body() startMissionDto: StartMissionDto,
    @CurrentUser() user: JwtUserDto,
  ): Promise<CompletableTaskDto> {
    return this.missionService.startMission(
      Number(id),
      user.id,
      startMissionDto.location.latitude,
      startMissionDto.location.longitude,
    );
  }

  @Post(':id/submissions')
  @ApiOperation({
    summary: 'Submit a completed mission answer',
    description: 'User must be within mission radius. Returns success or failure.',
  })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Answer validation result',
    schema: { type: 'object', properties: { result: { type: 'string', enum: ['Success', 'Failed'] } } },
  })
  @ApiResponse({ status: 400, description: 'Mission already completed' })
  @ApiResponse({ status: 403, description: 'User is not within mission radius' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  submitMission(
    @Param('id') id: string,
    @Body() submitMissionDto: SubmitMissionDto,
    @CurrentUser() user: JwtUserDto,
  ): Promise<{ result: 'Success' | 'Failed' }> {
    return this.missionService.submitMission(
      Number(id),
      user.id,
      submitMissionDto.location.latitude,
      submitMissionDto.location.longitude,
      submitMissionDto.task.answer,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a specific mission',
    description: 'ADMIN role necessary',
  })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiResponse({ status: 200, type: ResponseMissionDto, description: 'Deleted mission' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  remove(@Param('id') id: string): Promise<ResponseMissionDto> {
    return this.missionService.remove(Number(id));
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Approve a pending mission',
    description: 'ADMIN role necessary. Changes mission status from PENDING to APPROVED.',
  })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiResponse({ status: 200, type: ResponseMissionDto, description: 'Approved mission' })
  @ApiResponse({ status: 400, description: 'Mission is not pending approval' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  approve(@Param('id') id: string, @CurrentUser() user: JwtUserDto): Promise<ResponseMissionDto> {
    return this.missionService.approve(Number(id), user.id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Reject a pending mission',
    description: 'ADMIN role necessary. Changes mission status from PENDING to REJECTED.',
  })
  @ApiParam({ name: 'id', description: 'Mission ID', required: true, type: Number })
  @ApiResponse({ status: 200, type: ResponseMissionDto, description: 'Rejected mission' })
  @ApiResponse({ status: 400, description: 'Mission is not pending approval' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  reject(@Param('id') id: string, @CurrentUser() user: JwtUserDto): Promise<ResponseMissionDto> {
    return this.missionService.reject(Number(id), user.id);
  }
}
