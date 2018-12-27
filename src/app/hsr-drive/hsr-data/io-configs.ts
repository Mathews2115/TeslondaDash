import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_ioCongigfs
 *  Length 8 bytes
 *  1 Hz
 *
 * Data:
    ○ Data[0] bit 7
      0 for inputs. 1 for outputs
    ○ Data[0] bits6-0
      Pin Count in group (for future compatibility)
    ○ Data[1 through pin_count]
      Bit 7 = Enabled
      Bits 6-0 = Function
      ● See IO Function table

 *  example data                                ----------------- first byte-------------------------   ----- 2nd byte ---------------------
 *   (general states - only drive is enabled)   [e] [count]
 * can0  124   [8]  06 82 83 84 85 86 87 00      0 000 0110   INPUTs,   6 pins in this group [input],   Data[1] = 1000 0010 -  func 2 is enabled
 * can0  124   [8]  84 82 83 84 85 00 00 04      1 000 0100   OUTPUTs,  4 pins in this group [output],  Data[1] = 1000 0010 -  func 2 is enabled
 *
 *
 */

 /** IO FUNCTIONS OUTPUT */
 enum HSR_IO_FUNCTIONS_OUTPUT {
  HSR_EXTIO_OUT_FUNC_DISABLED,
  HSR_EXTIO_OUT_FUNC_CAN_CONTROLLED, // if enabled, only HSR_outputOverride controls this pin
  HSR_EXTIO_OUT_FUNC_BRAKE_LIGHT,    // Enabled if brake pedal is pressed or regen torque is high
  HSR_EXTIO_OUT_FUNC_REVERSE_LIGHT,  // Enabled when in reverse gear
  HSR_EXTIO_OUT_FUNC_DRIVE_LIGHT,    // Enabled when in drive gear
  HSR_EXTIO_OUT_FUNC_NEUTRAL_LIGHT,  // Enabled when in neutral gear
  HSR_EXTIO_OUT_FUNC_CREEP_LIGHT,    // Enabled if creep is enabled
  HSR_EXTIO_OUT_FUNC_CRUISE_LIGHT,   // Enabled when cruise control is active
}

/**
 * IO FUNCTIONS INPUT
 *
 *  Notes: Input pins have debounce of approx 50mx
 */
enum HSR_IO_FUNCTIONS_INPUT {
  HSR_EXTIO_IN_FUNC_DISABLED,
  HSR_EXTIO_IN_FUNC_CAN_REPORTED,   // if enabled, the status of this pin is simply reported as HSR_generalStates
  HSR_EXTIO_IN_FUNC_GEAR_NEUTRAL,   // 12V on this pin attempted to change gear to neutral
  HSR_EXTIO_IN_FUNC_GEAR_REVERSE,   // 12V on this pin attempted to change gear to reverse
  HSR_EXTIO_IN_FUNC_GEAR_DRIVE,     // 12V on this pin attempted to change gear to drive
  HSR_EXTIO_IN_FUNC_ENABLE_CREEP,   // Holding 12V on this pin enables transmission torque creep
  HSR_EXTIO_IN_FUNC_DISABLE_REGEN,  // Holding 12V on this pin disabled regenartive braking
  HSR_EXTIO_IN_FUNC_BRAKE_SIGNAL,   // 12V on this pin means brake pedal is pressed
  HSR_EXTIO_IN_FUNC_BRAKE_SIGNAL_INVERTED, // 12V on this pin means brake pedal is NOT pressed
  HSR_EXTIO_IN_FUNC_CRUISE_TOGGLE,  // 12V on this pin toggles cruise master enable
  HSR_EXTIO_IN_FUNC_CRUISE_UP1ST,   // 12V on this pin bumps cruise speed up approx 1 MPH
  // 12V on this pin bumps cruise speed up approx 5 MPH, Also activated cruise at current speed if not active
  HSR_EXTIO_IN_FUNC_CRUISE_UP2ND,
  HSR_EXTIO_IN_FUNC_CRUISE_DOWN1ST, // 12V on this pin bumps cruise speed down approx 1 MPH
  // 12V on this pin bumps cruise speed down approx 5 MPH, Also activated cruise at current speed if not active
  HSR_EXTIO_IN_FUNC_CRUISE_DOWN2ND,
  HSR_EXTIO_IN_FUNC_CRUISE_FWD,     // 12V on this pin cancels active cruise control
  HSR_EXTIO_IN_FUNC_CRUISE_RWD,     // 12V on this pin resumes cruise control
}

enum IO_CONFIGS_MASKS {
  IO = 0x80, // 1000 0000

}

export class IoConfigs extends BaseHsr {
  inputData: DataView;
  outputData: DataView;
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.IO_CONFIGS;

  constructor() {
    super(8);
    this.inputData = new DataView(new ArrayBuffer(this.length));
    this.outputData = new DataView(new ArrayBuffer(this.length));
  }
  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return HSR_CAN_IDS.IO_CONFIGS;
  }
  
  // has it's own update function since the data can represent two different data types
  update(newData: ArrayBuffer): boolean {
    super.update(newData);
    if (this.data.getUint8(0) & IO_CONFIGS_MASKS.IO) {
      this.outputData = new DataView(newData);
    } else {
      this.inputData = new DataView(newData);
    }
    return this.valid;
  }
}
