import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

export class MultiChoiceAnswerCompletableDto {
  @ApiProperty({
    description: 'Answer text',
    type: String,
    example: '1902',
  })
  @IsString()
  text: string;
}

export class CompletableTrueOrFalseTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'The Hungarian Parliament Building was completed in 1902. True or False?',
  })
  @IsString()
  question: string;
}

export class CompletableMultiChoiceTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'In which year was the Hungarian Parliament Building completed?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Array of possible answers (without isTrue flag)',
    type: [MultiChoiceAnswerCompletableDto],
    example: [{ text: '1885' }, { text: '1902' }, { text: '1920' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MultiChoiceAnswerCompletableDto)
  answers: MultiChoiceAnswerCompletableDto[];
}

export class CompletableSimpleQuestionTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'Which river flows next to the Hungarian Parliament?',
  })
  @IsString()
  question: string;
}

export class CompletableTaskDto {
  @ApiProperty({
    description: 'Type of task',
    enum: TaskType,
    example: TaskType.TRUE_OR_FALSE,
  })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({
    description: 'Task details based on type (without answers)',
    example: {
      question: 'The Hungarian Parliament Building was completed in 1902. True or False?',
    },
  })
  derivativeTask: CompletableTrueOrFalseTaskDto | CompletableMultiChoiceTaskDto | CompletableSimpleQuestionTaskDto;
}
