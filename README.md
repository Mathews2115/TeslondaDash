# TeslondaDash

Front-end for the Teslonda Super Car Dash
* Used in conjection with Teslonda Server: https://github.com/Mathews2115/TeslondaServer
* RPI setup: https://gist.github.com/Mathews2115/ed3dbd8623ee815a7bed363dbc7c73a6

## Introduction

This project contains the front-end software to run the Teslonda Dashboard. This was used in conjunction with the Teslonda NodeJS server.

### In defense of myself;

This was a rapid, prototype software, so by no means expect proper style guide technique, any tests or even competent design. I was learning Typescript paradigms, Angular 5x and a few other one-offs, while at the same time trying to get something out as soon as possible. Hey, this was done in my free time when I was trying to be a good husband AND being a Dark Souls fanatic.

The first screen started out as a 7" display at 800x480. It was mostly designed to run using the HTML5 canvas. Later on, the second screen was a 10" display, at 1080x720. The routes used for this was mostly just css3 widgets.

Binary Websockets are the main connection to the NodeJS server for the data.

### General Overview

The stack is Angular 5; (on top of a NodeJS server with express). Default root route is the main dash screen; the `/main` will load the add-on screen.
For the main/default route:

- When there is no active websocket connection, the dash will go into an "idle" mode where it will display a demo title screen, high score screen and a 'demo' dash screen.
- When disconnected from an active websocket screen, a "continue" screen will appear.

## Development server

Then Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# automated bs goes below

## Code scaffolding

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.3.

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

1. `ng build --prod --build-optimizer --aot`
2. `cp -r ./dist ../can-server/public`
3. `scp -r ../can-server/public pi@yourPi.local:/home/pi/can-server/`
4. `canplayer vcan0=can0 -l i -I test-hsr-can-dump.log`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
