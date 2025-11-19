import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsObject, IsString, ValidateNested } from 'class-validator';

export class MultiChoiceAnswerDto {
  @ApiProperty({
    description: 'Answer text',
    type: String,
    example: '1902',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Is this the correct answer',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  isTrue: boolean;
}

export class TrueOrFalseTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'The Hungarian Parliament Building was completed in 1902. True or False?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The correct answer (true or false)',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  answer: boolean;
}

export class MultiChoiceTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'In which year was the Hungarian Parliament Building completed?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Array of possible answers',
    type: [MultiChoiceAnswerDto],
    example: [
      { text: '1885', isTrue: false },
      { text: '1902', isTrue: true },
      { text: '1920', isTrue: false },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MultiChoiceAnswerDto)
  answers: MultiChoiceAnswerDto[];
}

export class SimpleQuestionTaskDto {
  @ApiProperty({
    description: 'The question text',
    type: String,
    example: 'Which river flows next to the Hungarian Parliament?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Array of acceptable answers',
    type: [String],
    example: ['Danube', 'danube', 'Duna', 'The Danube'],
  })
  @IsArray()
  @IsString({ each: true })
  answers: string[];
}

export class TaskDto {
  @ApiProperty({
    description: 'Type of task',
    enum: TaskType,
    example: TaskType.TRUE_OR_FALSE,
  })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({
    description: 'Task details based on type',
    example: {
      question: 'The Hungarian Parliament Building was completed in 1902. True or False?',
      answer: true,
    },
  })
  @IsObject()
  derivativeTask: TrueOrFalseTaskDto | MultiChoiceTaskDto | SimpleQuestionTaskDto;
}
