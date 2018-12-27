import { HSR_CAN_IDS } from "./hsr-data/base-hsr";

export interface StreamDataPoint {
  ts: number; // elapsed milliseconds 
  data: DataView;
  id: HSR_CAN_IDS;
  //GPS data?
}
