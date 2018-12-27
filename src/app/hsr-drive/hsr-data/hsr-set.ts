import { HSR_CAN_IDS, HsrObj } from '../hsr-data/base-hsr';
import { DiTemperature } from '../hsr-data/di-temperature';
import { DiTemperature2 } from '../hsr-data/di-temperature2';
import { DiMaxTemperature } from '../hsr-data/di-max-temperature';
import { SpeedData } from '../hsr-data/speed-data';
import { TorquePowerData } from '../hsr-data/torque-power-data';
import { GeneralStates } from '../hsr-data/general-states';
import { CruiseState } from '../hsr-data/cruise-state';
import { HvlvData } from '../hsr-data/hvlv-data';
import { PowerData } from '../hsr-data/power-data';
import { PowerData2 } from '../hsr-data/power-data2';
import { TorqueLimits } from '../hsr-data/torque-limits';
import { SpeedLimit } from '../hsr-data/speed-limit';
import { PedalPos } from '../hsr-data/pedal-pos';

export class HsrSet {
  hsrData: HsrObj[];
  constructor() {
    // create HSR data map (using array instead of Map due to lookup performance)
    this.hsrData = [];
    let objs = <HsrObj[]> [
      new DiTemperature(),
      new DiTemperature2(),
      new DiMaxTemperature(),
      new SpeedData(),
      new TorquePowerData(),
      new GeneralStates(),
      new CruiseState(),
      new HvlvData(),
      new PowerData(),
      new PowerData2(),
      new TorqueLimits(),
      new SpeedLimit(),
      new PedalPos()
    ];

    for (let obj of objs) {
      this.hsrData[obj.canID] = obj;
    }
  }

  getHsrObj<T extends HsrObj>(id: HSR_CAN_IDS): T {
    if (this.hsrData[id] != null) {
      return (<T>this.hsrData[id]);
    } else {
      return null;
    }
  }

  exists(id: HSR_CAN_IDS): boolean {
    return !!this.hsrData[id]
  }

  update(id:HSR_CAN_IDS, data: ArrayBuffer): void {
    if (this.exists(id)) {
      this.hsrData[id].update(data);
    }
  }

  get DiTemperature(): DiTemperature {
    return this.getHsrObj(DiTemperature.rxID)
  }
  get DiTemperature2(): DiTemperature2 {
    return this.getHsrObj(DiTemperature2.rxID)
  }
  get DiMaxTemperature(): DiMaxTemperature {
    return this.getHsrObj(DiMaxTemperature.rxID)
  }
  get SpeedData(): SpeedData {
    return this.getHsrObj(SpeedData.rxID)
  }
  get TorquePowerData(): TorquePowerData {
    return this.getHsrObj(TorquePowerData.rxID)
  }
  get GeneralStates(): GeneralStates {
    return this.getHsrObj(GeneralStates.rxID)
  }
  get CruiseState(): CruiseState {
    return this.getHsrObj(CruiseState.rxID)
  }
  get HvlvData(): HvlvData {
    return this.getHsrObj(HvlvData.rxID)
  }
  get PowerData(): PowerData {
    return this.getHsrObj(PowerData.rxID)
  }
  get PowerData2(): PowerData2 {
    return this.getHsrObj(PowerData2.rxID)
  }
  get TorqueLimits(): TorqueLimits {
    return this.getHsrObj(TorqueLimits.rxID)
  }
  get SpeedLimit(): SpeedLimit {
    return this.getHsrObj(SpeedLimit.rxID)
  }
  get PedalPos(): PedalPos {
    return this.getHsrObj(PedalPos.rxID)
  }
}
