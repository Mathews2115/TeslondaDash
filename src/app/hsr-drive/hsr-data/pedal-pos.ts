import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';
/**
 *
 *
 *  HSR_pedalPos
 *  Length 3 bytes
 *  10 Hz
 *
 */

enum PEDAL_POS_OFFSETS {
  PEDEL_POS,
  PEDEAL_POS_TRACK_A,
  PEDEAL_POS_TRACK_B
}

// Pedal Position
export class PedalPos extends BaseHsr {
  readonly offset: number = 0.4;  // incoming data is offset by (value * 0.4), example: 250 = 100%);
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.PEDAL_POS;
  constructor() {
    super(3);
  }
  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return PedalPos.rxID;
  }

  /** Pedal Position Percent [filtered] */
  get pedalPosition(): number {
    return this.data.getUint8(PEDAL_POS_OFFSETS.PEDEL_POS) * this.offset;
  }
  get pedalPositionRounded(): number {
    return Math.round(this.pedalPosition);
  }

  /** Pedal Position Track A Percent [unfiltered] */
  get pedalPositionTrackA(): number {
    return this.data.getUint8(PEDAL_POS_OFFSETS.PEDEAL_POS_TRACK_A) * this.offset;
  }
  get pedalPositionTrackARounded(): number {
    return Math.round(this.pedalPositionTrackA);
  }

  /** Pedal Position Track B Percent [unfiltered] */
  get pedalPositionTrackB(): number {
    return this.data.getUint8(PEDAL_POS_OFFSETS.PEDEAL_POS_TRACK_B);
  }
}
