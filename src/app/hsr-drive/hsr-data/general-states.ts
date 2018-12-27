import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_generalStates
 *  Length 8 bytes
 *  100Hz
 *
 *  00 04 00 00 00 00 00 01
 *
 */

// GENERAL_STATES_OFFSETS - Offsets in bytes
export enum GENERAL_STATES_OFFSETS {
  RAW_INPUT_STATES,
  RAW_OUTPUT_STATES,
  BRAKE_LIGHT_STATUS,
  REVERSE_LIGHT_STATUS,
  REGENERATIVE_BRAKING_OVER_BRAKE_LIGHT_THRESHOLD,
  BRAKE_PEDAL_PRESSED,
  TORQUE_CREEP_ENABLED,
  CURRENT_ACCEPTED_GEAR,
}

/** 12V general inputs */
export interface RawInputStates {
  gearNeutral: boolean; // white w/orange
  gearReverse: boolean; // white w/purple
  gearDrive: boolean;   // white w/black
  creepOn: boolean;     // white w/brown
  regenOff: boolean;    // white w/grey
  brakeOn: boolean;     // white w/blue
}

enum INPUT_STATES_MASK {
  GEAR_NEUTRAL = 0x0001, //      0001
  GEAR_REVERSE = 0x0002, //      0010
  GEAR_DRIVE =   0x0004, //      0100
  CREEP_ON =     0x0008, //      1000
  REGEN_OFF =    0x0010, // 0001 0000
  BRAKE_ON =     0x0020, // 0010 0000
}

/** Relay Control output states */
export interface RawOutputStates {
  brakeLight: boolean;
  reverseLight: boolean;
  driveLight: boolean;
  neutralLight: boolean;
}

enum OUTPUT_STATES_MASK {
  RELAY_BRAKE_LIGHT = 1,
  RELAY_REVERSE_LIGHT = 2,
  RELAY_DRIVE_LIGHT = 4,
  RELAY_NEUTRAL_LIGHT = 8
}

export enum GEARS {
  DRIVE = 1,
  REVERSE = 2,
  NEUTRAL = 3
}

export class GeneralStates extends BaseHsr {
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.GENERAL_STATES;
  constructor() {
    super(8);
  }

  demo(): void { }

  get canID(): HSR_CAN_IDS {
    return GeneralStates.rxID
  }

  /**
   * Raw Input States
   * Bit flags for the value of each of the six 12v genearl inputs
   * Only enabled inputs can show '1's
   */
  get rawInputStates(): RawInputStates {
    const statesData = this.data.getUint8(GENERAL_STATES_OFFSETS.RAW_INPUT_STATES);
    const states = {
      gearNeutral: !!(statesData & INPUT_STATES_MASK.GEAR_NEUTRAL),
      gearReverse: !!(statesData & INPUT_STATES_MASK.GEAR_REVERSE),
      gearDrive: !!(statesData & INPUT_STATES_MASK.GEAR_DRIVE),
      creepOn: !!(statesData & INPUT_STATES_MASK.CREEP_ON),
      regenOff: !!(statesData & INPUT_STATES_MASK.REGEN_OFF),
      brakeOn: !!(statesData & INPUT_STATES_MASK.BRAKE_ON)
    };
    return states;
  }

  /**
   * Raw Output States
   * Bit flags for the value of each of the Relay Control Outputs
   * Only enabled outputs can show '1's
   * 1 = relay enabled (ground tied)
   */
  get rawOutputStates(): RawOutputStates {
    const statesData = this.data.getUint8(GENERAL_STATES_OFFSETS.RAW_OUTPUT_STATES);
    const states = {
      brakeLight: !!(statesData & OUTPUT_STATES_MASK.RELAY_BRAKE_LIGHT),
      reverseLight: !!(statesData & OUTPUT_STATES_MASK.RELAY_REVERSE_LIGHT),
      driveLight: !!(statesData & OUTPUT_STATES_MASK.RELAY_DRIVE_LIGHT),
      neutralLight: !!(statesData & OUTPUT_STATES_MASK.RELAY_NEUTRAL_LIGHT)
    };
    return states;
  }

  get brakeLight(): boolean {
    return !!this.data.getUint8(GENERAL_STATES_OFFSETS.BRAKE_LIGHT_STATUS);
  }

  get reverseLight(): boolean {
    return !!this.data.getUint8(GENERAL_STATES_OFFSETS.REVERSE_LIGHT_STATUS);
  }

  // True when regen is strong enough to "show brake lights"
  get regenBrakingOverBrakeLightTorqueThreshold(): boolean {
    return !!this.data.getUint8(GENERAL_STATES_OFFSETS.REGENERATIVE_BRAKING_OVER_BRAKE_LIGHT_THRESHOLD);
  }

  get brakePedalPressed(): boolean {
    return !!this.data.getUint8(GENERAL_STATES_OFFSETS.BRAKE_PEDAL_PRESSED);
  }

  get torqueCreepEnabled(): boolean {
    return !!this.data.getUint8(GENERAL_STATES_OFFSETS.TORQUE_CREEP_ENABLED);
  }

  get currentAcceptedGear(): GEARS {
    return this.data.getUint8(GENERAL_STATES_OFFSETS.CURRENT_ACCEPTED_GEAR) || 0;
  }

  get regenDisabled(): boolean {
    return !!this.rawInputStates.regenOff
  }
}
