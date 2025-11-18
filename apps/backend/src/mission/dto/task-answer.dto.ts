import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';

export class TrueOrFalseAnswerDto {
  @ApiProperty({
    description: 'User answer for true/false question',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  answer: boolean;
}

export class MultiChoiceAnswerSubmitDto {
  @ApiProperty({
    description: 'Index of selected answer',
    type: Number,
    example: 1,
  })
  @IsNumber()
  selectedIndex: number;
}

export class SimpleQuestionAnswerDto {
  @ApiProperty({
    description: 'User answer text',
    type: String,
    example: 'Danube',
  })
  @IsString()
  answer: string;
}

export class TaskAnswerDto {
  @ApiProperty({
    description: 'Mission ID',
    type: Number,
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'User answer based on task type',
    oneOf: [
      { $ref: '#/components/schemas/TrueOrFalseAnswerDto' },
      { $ref: '#/components/schemas/MultiChoiceAnswerSubmitDto' },
      { $ref: '#/components/schemas/SimpleQuestionAnswerDto' },
    ],
  })
  answer: TrueOrFalseAnswerDto | MultiChoiceAnswerSubmitDto | SimpleQuestionAnswerDto;
}
