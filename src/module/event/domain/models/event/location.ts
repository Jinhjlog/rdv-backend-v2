import { ValueObject } from '@lib/domain';

export interface LocationProps {
  address: string;
  latitude: string;
  longitude: string;
}

export class Location extends ValueObject<LocationProps> {
  constructor(props: LocationProps) {
    super(props);
  }

  get address(): string {
    return this.props.address;
  }

  get latitude(): string {
    return this.props.latitude;
  }

  get longitude(): string {
    return this.props.longitude;
  }

  static create(value: LocationProps): Location {
    return new Location(value);
  }

  static unsafeCreate(value: LocationProps): Location {
    return new Location(value);
  }
}
