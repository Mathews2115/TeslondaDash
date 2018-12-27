import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';
import { Input } from '@angular/core';


/**
 *  NOT COMPLETE YET
 *
 *  HSR_inputAck
 *  Length 8 bytes
 *
 */

// inputAck
export class InputAck extends BaseHsr {
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.INPUT_ACK;
  constructor() {
    super(8);
  }
  get canID(): HSR_CAN_IDS {
    return InputAck.rxID;
  }

  demo(): void {}
}
