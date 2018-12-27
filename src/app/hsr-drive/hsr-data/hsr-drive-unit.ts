// https://hsrmotors.com/hsr/products/performance_large_du
// just model specs

export const inputVMax = 404;         // Input voltage (traction power)	240-404V DC (Limits configurable)
export const inputVLogicMax = 16;     // Input voltage (logic)	10.5-16V DC
export const inputALogicMax = 5;      // Input current (logic)	< 5A (max) (10A fuse suggested)
export const inputCurrentMax = 1150;  // Input current (HV, peak)	1150A DC
export const inputPowerMax = 400;     // Input power (peak)	400 kW (536 HP)
export const p2w = '1.842 HP per lb'; // Power to weight (peak)
export const rpmMax = 15200;          // Motor speed (max)	15,200 RPM
export const torqueMax = 600;         // Torque (peak output)	600 Nm (~443 ft/lb)
export const torqueRegenMax = 110;    // Torque (regenerative braking, peak)	110 Nm
export const regenMax = 70;           // Output power (regenerative braking, peak)	70 kW
export const regenAMax = 250;         // Output current (regenerative braking, peak)	250A
export const inputPowerContinous = 35;// Input power (continuous)	35 kW (approximate)
export const inputPower15min = 90;    // Input power (15 minute)	90 kW (approximate)
