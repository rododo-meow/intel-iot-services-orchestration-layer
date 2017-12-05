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
/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var cheerio = require('cheerio');

    function CheerioNode(n) {
        RED.nodes.createNode(this,n);
        this.tag = n.tag || "h1";
        this.ret = n.ret || "html";
        this.as = n.as || "single";
        var node = this;
        this.on("input", function(msg) {
            if (msg.hasOwnProperty("payload")) {
                try {
                    var $ = cheerio.load(msg.payload);
                    var pay = [];
                    $(node.tag).each(function() {
                        if (node.as === "multi") {
                            var pay2 = null;
                            if (node.ret === "html") { pay2 = cheerio.load($(this).html().trim()).xml(); }
                            if (node.ret === "text") { pay2 = $(this).text(); }
                            if (node.ret === "attr") { pay2 = this.attribs; }
                            //if (node.ret === "val")  { pay2 = $(this).val(); }
                            /* istanbul ignore else */
                            if (pay2) {
                                msg.payload = pay2;
                                node.send(msg);
                            }
                        }
                        if (node.as === "single") {
                            if (node.ret === "html") { pay.push( cheerio.load($(this).html().trim()).xml() ); }
                            if (node.ret === "text") { pay.push( $(this).text() ); }
                            if (node.ret === "attr") { pay.push( this.attribs ); }
                            //if (node.ret === "val")  { pay.push( $(this).val() ); }
                        }
                    });
                    if ((node.as === "single") && (pay.length !== 0)) {
                        msg.payload = pay;
                        node.send(msg);
                    }
                } catch (error) {
                    node.error(error.message,msg);
                }
            }
            else { node.send(msg); } // If no payload - just pass it on.
        });
    }
    RED.nodes.registerType("html",CheerioNode);
}
