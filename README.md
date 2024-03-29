# Project Finished - moving on to 
* https://github.com/Mathews2115/AutoDashBackEnd
* https://github.com/Mathews2115/AutoDashFrontEnd


# Teslonda Front-end (Dashboard)

Front-end for the Teslonda Super Car Dash
* Used in conjection with [Teslonda Server](https://github.com/Mathews2115/TeslondaServer)
* [RPI setup](https://gist.github.com/Mathews2115/ed3dbd8623ee815a7bed363dbc7c73a6)

![Image of dash](https://i.imgur.com/mIar8jR.jpg)
![Image of dash](https://i.imgur.com/hzBzcPA.jpg)
* https://i.imgur.com/LsskNRd.mp4
* https://i.imgur.com/rSgDKpG.mp4

## Introduction

This project contains the front-end software to run the Teslonda Dashboard. This was used in conjunction with the Teslonda NodeJS server.

### In defense of myself;

- Why HTML5? Why Angular?  Why everything??
This was a rapid developed, prototype software to get something fun and rad up and running as soon as possible.  By no means expect proper style guide technique or any tests what so ever.  (I'm not a good role model)  I chose Angular 5 with Typescript because I needed to get up to speed with those two technologies and I wanted to get as much bang for my buck when diving into a new project, also, I'm a glutton for punishment.   Hey, this was done in my free time when I was trying to be a good husband AND being a Dark Souls fanatic.

The first screen started out as a 7" display at 800x480. It was mostly designed to run using the HTML5 canvas. Later on, the second screen was a 10" display, at 1080x720. The routes used for this was mostly just css3 widgets.

Binary Websockets are the main connection to the NodeJS server for the data.

### How do I force resolutions on my RPI?
See [here](https://gist.github.com/Mathews2115/ed3dbd8623ee815a7bed363dbc7c73a6#forcing-monitor-resolutions-if-the-edid-supports-it-of-course)

### Questions?
Feel free to contact me at cloroxman at gmail dot com.  Or find me on [Instagram](https://www.instagram.com/cloroxman/)

### General Overview

The stack is Angular 5; (on top of a NodeJS server with express). Default root route is the main dash screen; the `/main` will load the add-on screen.
For the main/default route:

- When there is no active websocket connection, the dash will go into an "idle" mode where it will display a demo title screen, high score screen and a 'demo' dash screen.
- When disconnected from an active websocket screen, a "continue" screen will appear.

## Development server

Then Run `ng serve` or `yarn start` `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# automated bs goes below

## Code scaffolding

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.3.

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

1. Install NodeJS 10 or larger
2. make sure you have the latest version of NodeJS (and Yarn or NPM)

Run `ng build` (or through your package manager like `yarn build` or `npm build`) to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

1. `ng build --prod --build-optimizer --aot`
2. `cp -r ./dist ../can-server/public`
3. `scp -r ../can-server/public pi@yourPi.local:/home/pi/can-server/`
4. `canplayer vcan0=can0 -l i -I ~/can-server/dump/test-hsr-can-dump.log`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
