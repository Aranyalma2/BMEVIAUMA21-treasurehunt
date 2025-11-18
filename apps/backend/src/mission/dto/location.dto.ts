import { PickType } from '@nestjs/swagger';

import { Mission } from '../entities/mission.entity';

export class LocationDto extends PickType(Mission, ['longitude', 'latitude']) {}
