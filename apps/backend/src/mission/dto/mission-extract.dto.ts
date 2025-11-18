import { PickType } from '@nestjs/swagger';

import { Mission } from '../entities/mission.entity';

export class MissionExtractDto extends PickType(Mission, ['id', 'name', 'longitude', 'latitude', 'description']) {}
