var m = require("mraa");

const LCD_ADDRESS = 0x7c >> 1;
const RGB_ADDRESS = 0xc4 >> 1;

const WHITE = 0;
const RED = 1;
const GREEN = 2;
const BLUE = 3;

const REG_RED = 0x04; // pwm2
const REG_GREEN = 0x03; // pwm1
const REG_BLUE = 0x02; // pwm0

const REG_MODE1 = 0x00;
const REG_MODE2 = 0x01;
const REG_OUTPUT = 0x08;

const LCD_CLEARDISPLAY = 0x01;
const LCD_RETURNHOME = 0x02;
const LCD_ENTRYMODESET = 0x04;
const LCD_DISPLAYCONTROL = 0x08;
const LCD_CURSORSHIFT = 0x10;
const LCD_FUNCTIONSET = 0x20;
const LCD_SETCGRAMADDR = 0x40;
const LCD_SETDDRAMADDR = 0x80;

const LCD_ENTRYRIGHT = 0x00;
const LCD_ENTRYLEFT = 0x02;
const LCD_ENTRYSHIFTINCREMENT = 0x01;
const LCD_ENTRYSHIFTDECREMENT = 0x00;

const LCD_DISPLAYON = 0x04;
const LCD_DISPLAYOFF = 0x00;
const LCD_CURSORON = 0x02;
const LCD_CURSOROFF = 0x00;
const LCD_BLINKON = 0x01;
const LCD_BLINKOFF = 0x00;

const LCD_DISPLAYMOVE = 0x08;
const LCD_CURSORMOVE = 0x00;
const LCD_MOVERIGHT = 0x04;
const LCD_MOVELEFT = 0x00;

const LCD_8BITMODE = 0x10;
const LCD_4BITMODE = 0x00;
const LCD_2LINE = 0x08;
const LCD_1LINE = 0x00;
const LCD_5x10DOTS = 0x04;
const LCD_5x8DOTS = 0x00;

function delayer(timeout) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, timeout);
  });
}

LCD = function() {
  this.i2c = new m.I2c(6);
  this.displayFunc = 0;
  this.displayCtrl = 0;
  this.i2c.address(LCD_ADDRESS);
  this.i2c.frequency(m.I2C_STD);
};
LCD.prototype.command = function(c) {
  this.i2c.writeReg(0x80, c);
};
LCD.prototype.setRGBReg = function(reg, v) {
  this.i2c.address(RGB_ADDRESS);
  this.i2c.writeReg(reg, v);
  this.i2c.address(LCD_ADDRESS);
};
LCD.prototype.setRGB = function(r, g, b) {
  this.setRGBReg(REG_RED, r);
  this.setRGBReg(REG_GREEN, g);
  this.setRGBReg(REG_BLUE, b);
};
LCD.prototype.display = function() {
  this.displayCtrl |= LCD_DISPLAYON;
  this.command(LCD_DISPLAYCONTROL | this.displayCtrl);
};
LCD.prototype.write = function(s) {
  for (var i = 0; i < s.length; i++) this.i2c.writeReg(0x40, s.charCodeAt(i));
};
LCD.prototype.begin = function() {
  var that = this;
  this.displayFunc |= LCD_2LINE;
  this.command(LCD_FUNCTIONSET | this.displayFunc);
  return delayer(5)
    .then(function() {
      that.command(LCD_FUNCTIONSET | that.displayFunc);
      return delayer(1);
    })
    .then(function() {
      that.command(LCD_FUNCTIONSET | that.displayFunc);
      that.command(LCD_FUNCTIONSET | that.displayFunc);
      that.displayCtrl = LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF;
      that.display();
      return that.clear();
    })
    .then(function() {
      that.displayMode = LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT;
      that.command(LCD_ENTRYMODESET | that.displayMode);
      that.setRGBReg(REG_MODE1, 0);
      that.setRGBReg(REG_OUTPUT, 0xff);
      that.setRGBReg(REG_MODE2, 0x20);
      that.setRGB(255, 255, 255);
      return Promise.resolve();
    });
};
LCD.prototype.clear = function() {
  this.command(LCD_CLEARDISPLAY);
  return delayer(2);
};
LCD.prototype.display = function() {
  this.displayCtrl |= LCD_DISPLAYON;
  this.command(LCD_DISPLAYCONTROL | this.displayCtrl);
};
shared.lcd = new LCD();
shared.lcd.begin().then(function() {
  done();
});
