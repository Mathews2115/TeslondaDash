export const appSize = {
  width: 800,  // see below
  height: 480,  // if you change this, so a grep for all the other ones I hardcoded
  dashHeight: 426, //
  top: 16,
  left: 34 // common left start
};

export const colors = {
  background: 'black', // app background
  bgMain: '#7d2b12',  // dark brown
  fgMain: '#f17500',  // bright orange
  fgMainSecondary: '#00da29', //green
  bgMainSecondary: '#005522', // dark green
  fgMainOff: '#6b3400'  // dark orange
};


// see styles.css for color matching
export const percColors = {
  low: '#00b4f0',
  lownormal: '#f0b400',
  normal: colors.fgMain,
  medium: '#f16800',
  warning: '#ff6100',
  alert: '#ff0000',
};

export const fonts = {
  staticReadout: 'Press Start 2P',
  digitalReadout: 'Pixel LCD-7',
  block: 'No Continue',
  other: 'Kemco Pixel Bold'
};


export const SERVER_URL = 'http://10.66.66.1:4000';  // This should match the static IP we did in the Pi (TODO: pass this shit down instead of hardcoding it)
// export const SERVER_URL = 'http://192.168.2.186:4000';  // usually for wireless development (check ip on host if it changed)
// export const SERVER_URL = 'http://192.168.44.66:4000'
// export const SERVER_URL = 'http://localhost:4000';

export const EXTRAS_URL = '/extra'
