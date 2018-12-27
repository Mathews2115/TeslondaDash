import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_cruiseState
 *  Length 2 bytes
 *  10Hz
 *
 */

// Current Cruise State
export enum CRUISE_STATE {
  DISABLED,
  STANDBY,
  ACTIVE
}

// Cruise State byte offsets
enum CRUISE_STATE_OFFSETS  {
  STATE,
  SET_SPEED
}

// Cruise State
export class CruiseState extends BaseHsr {
  readonly offset: 0.5;     // incoming data is offset by (value * 2.0)
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.CRUISE_STATE;
  constructor() {
    super(2);
  }

  demo():void {}

  get canID(): HSR_CAN_IDS {
    return CruiseState.rxID;
  }

  get state(): CRUISE_STATE {
    return this.data.getUint8(CRUISE_STATE_OFFSETS.STATE);
  }

  /** Cruise Set Speed (MPH) */
  get speed(): number {
    return this.data.getUint8(CRUISE_STATE_OFFSETS.SET_SPEED) * this.offset;
  }

  set state(newState: CRUISE_STATE) {
    this.data.setUint8(CRUISE_STATE_OFFSETS.STATE, newState);
  }

  /** Cruise Set Speed (MPH) */
  set speed(newValue: number) {
    this.data.setUint8(CRUISE_STATE_OFFSETS.SET_SPEED, newValue * this.offset);
  }
}
