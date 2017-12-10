/******************************************************************************
Copyright (c) 2016, Intel Corporation

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Intel Corporation nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*****************************************************************************/
var m = require("mraa");
var fs = require("fs");
const LMH = { L: 0, M: 12, H: 24 };
const doremi = { "1": 0, "2": 2, "3": 4, "4": 5, "5": 7, "6": 9, "7": 11 };
const tune = [
  262,
  277,
  294,
  311,
  330,
  349,
  370,
  392,
  415,
  440,
  466,
  494,
  523,
  554,
  587,
  622,
  659,
  698,
  740,
  784,
  831,
  880,
  932,
  988,
  1046,
  1109,
  1175,
  1245,
  1318,
  1397,
  1480,
  1568,
  1661,
  1760,
  1865,
  1976
];

function parseTune(s) {
  if (s == "0") return 0;
  var ret = LMH[s[0]] + doremi[s[1]];
  if (s.length > 2) {
    switch (s[2]) {
      case "b":
        ret -= 1;
        break;
      case "#":
        ret += 1;
        break;
      default:
        return 0;
    }
  }
  return tune[ret];
}
Player = function(pin) {
  this.pwm = new m.Pwm(pin);
  this.playing = null;
  this.setVolume(0.005);
  return this;
};
Player.prototype.play = function(path) {
  return new Promise(function(resolve, reject) {
    var that = this;
    if (this.playing != null) this.stop();
    var music = JSON.parse(fs.readFileSync(path));
    var T = 60000 / music[0] * 4;
    var i = 1;
    function step() {
      if (music[i][1] == 0) {
        that.buzzerQuiet();
        resolve();
        return;
      }
      that.buzzerSound(parseTune(music[i][0]));
      that.playing = setTimeout(step, T * music[i][1] / 16);
      i = i + 1;
    }
    step();
  });
};
Player.prototype.stop = function() {
  if (this.playing != null) {
    clearTimeout(this.playing);
    this.playing = null;
  }
  this.buzzerQuiet();
};
Player.prototype.buzzerSound = function(freq) {
  if (freq < 10 || freq > 20000) this.buzzerQuiet();
  else {
    //    this.pwm.enable(false);
    this.pwm.period_us(1000000 / freq);
    //    this.pwm.enable(true);
  }
};
Player.prototype.buzzerQuiet = function() {
  this.pwm.enable(false);
};
Player.prototype.setVolume = function(volume) {
  if (volume < 0) volume = 0;
  if (volume > 0.3) volume = 0.3;
  this.pwm.write(volume);
};
Player.prototype.isPlaying = function() {
  return this.playing != null;
};
shared.player = new Player(CONFIG.pin);
done();
