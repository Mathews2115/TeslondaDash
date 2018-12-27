import { BaseHsr, HSR_CAN_IDS, HsrTx } from "./base-hsr";

// HSR_setTorqueLimits
// ● Default CAN ID: 0x222
// ● Length: 2
// ● Data:
//    ○ Data[0] = Value to set
// ■ 0 = Regen %
// ■ 1 = Output Torque %
// ■ 2 = Regen Disabled
// ■ 3 = Crude Traction Control Enabled
// ■ 4 = Torque Creep Enabled
//    ○ Data[1] = Value of chosen setting
// ■ Regen % is 0-250 (0.4%/unit)
// ■ Output Torque % is 0-250 (0.4%/unit)
// ■ Regen Disabled is 0=Regen_Enabled, 1=Regen_Disabled
// ■ Crude Traction Control Enabled is 0=TC_Disabled, 1=TC_Enabled
// ● Effectiveness of crude traction control is extremely limited and
// may not work in many cases. Use with caution.
// ■ Torque Creep Enabled = 0=Creep_Disabled, 1=Creep_Enabled
//    ○ Changes may require shifting to neutral and/or a complete stop to take effect

export enum TYPE {
  REGEN_PERCENT = 0,
  TORQUE_PERCENT = 1,
  REGEN_DISABLED = 2,
  CRUDE_TRACTION_CONTROL_ENABLED = 3,
  TORQUE_CREEP_ENABLED = 4
}

const percent_offset = 0.4;

export class SetTorqueLimits extends BaseHsr implements HsrTx {
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.SET_TORQUE_LIMITS;
  static txID: HSR_CAN_IDS = HSR_CAN_IDS.SET_TORQUE_LIMITS;
  constructor(type: TYPE) {
    super(2);
    this.data.setUint8(0, type);
  }

  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return SetTorqueLimits.rxID;
  }

  get sendCanID(): HSR_CAN_IDS {
    return SetTorqueLimits.txID;
  }

  get type(): TYPE {
    return this.data.getUint8(0);
  }

  get value(): number | boolean {
    switch (this.data.getUint8(0)) {
      case TYPE.REGEN_PERCENT:
        return this.getPercent();
      case TYPE.TORQUE_PERCENT:
        return this.getPercent();
      case TYPE.REGEN_DISABLED:
        return !!this.data.getUint8(1);  //0=Regen_Enabled, 1=Regen_Disabled
      case TYPE.CRUDE_TRACTION_CONTROL_ENABLED:
        return !!this.data.getUint8(1); // 0=TC_Disabled, 1=TC_Enabled
      case TYPE.TORQUE_CREEP_ENABLED:    // 0=Creep_Disabled, 1=Creep_Enabled
        return !!this.data.getUint8(1);
      default:
        break;
    }
  }



  get outputRegen(): number {
    return this.getPercent();
  }
  set outputRegen(percent: number) {
    this.data.setUint8(1, percent / percent_offset); // convert to 0-250 range
  }

  get outputTorque(): number {
    return this.getPercent();
  }
  set outputTorque(percent: number) {
    this.data.setUint8(1, percent / percent_offset); // convert to 0-250 range
  }

  get disableRegen(): boolean {
    return !!this.data.getUint8(1);
  }
  set disableRegen(bool: boolean) {
    this.data.setUint8(1,  (bool ? 1 : 0));  //0=Regen_Enabled, 1=Regen_Disabled
  }

  get tractionControl(): boolean {
    return !!this.data.getUint8(1);
  }
  set tractionControl(bool: boolean) {
    this.data.setUint8(1,  (bool ? 1 : 0));
  }

  get enableCreep(): boolean {
    return !!this.data.getUint8(1);
  }
  set enableCreep(bool: boolean) {
    this.data.setUint8(1,  (bool ? 1 : 0));
  }

  private getPercent(): number {
    return Math.round(this.data.getUint8(1) * percent_offset);  // 0-250 value
  }
}
