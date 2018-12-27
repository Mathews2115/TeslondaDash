import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *  HSR_speedData
 *
 *  Example CAN data:  [00 1A  00 02  00 02]
 *        value:           30      2      2
 *
 */

// Offsets in bytes
export enum SD_OFFSETS {
  MOTOR_RPM,
  CALCULATED_VEHICLE_SPEED = 2,
  TESLA_FIRMWARE_SPEED = 4,
}

export class SpeedData extends BaseHsr {
  readonly offset: 0.1;                // incoming data is offset by (value * 10.0)
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.SPEED_DATA; // CAN ID for receiving from HSR  (get data)
  static txID: HSR_CAN_IDS = HSR_CAN_IDS.SPEED_DATA; // CAN ID for transmitting to HSR (set data)
  constructor(data?: DataView) {
    super(6, data);
  }

  demo(mph:number=1000): void {
    this.data.setInt16(SD_OFFSETS.MOTOR_RPM, mph);
  }

  get canID(): HSR_CAN_IDS {
    return SpeedData.rxID;
  }

  get motorRPM(): number {
    return Math.round(this.data.getInt16(SD_OFFSETS.MOTOR_RPM, this.littleEndian));
  }

  /**
   * Calculated Vechicle Speed (MPH)
   */
  get vehicleSpeed(): number {
    return Math.abs(Math.round(this.data.getInt16(SD_OFFSETS.CALCULATED_VEHICLE_SPEED, this.littleEndian) * this.offset))
  }

  /**
   * Tesla firmware provided Vehicle Speed (MPH)
   */
  get teslaVehicleSpeed(): number {
    return Math.abs(Math.round(this.data.getInt16(SD_OFFSETS.TESLA_FIRMWARE_SPEED, this.littleEndian) * this.offset));
  }

  get teslondaSpeed(): number {
    return Math.round((this.motorRPM * 28.8) / 3269.28);
  }
}
