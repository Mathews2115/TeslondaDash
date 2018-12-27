import { BaseHsr, HsrTx, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_speedLimit
 *  Length 2 bytes
 *  10 Hz
 *
 */

// Speed Limit
export class SpeedLimit extends BaseHsr implements HsrTx {
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.SPEED_LIMIT;
  static txID: HSR_CAN_IDS = HSR_CAN_IDS.SET_SPEED_LIMIT;
  constructor(data?: DataView) {
    super(2, data);
  }
  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return SpeedLimit.rxID;
  }

  get sendCanID(): HSR_CAN_IDS {
    return SpeedLimit.txID;
  }

  /** Approximate RPM limit */
  get rpmLimit(): number {
    return this.data.getUint16(0, this.littleEndian);
  }
  
  get teslondaMPHLimit(): number {
    return Math.round((this.rpmLimit * 28.8) / 3269.28);
  }
  
  set rpmLimit(num: number) {
    this.data.setUint16(0, num, this.littleEndian);
  }
  
  set teslondaMPHLimit(speed: number) {
    this.rpmLimit = Math.round((speed * 3269.28) / 28.8);
  }
}
