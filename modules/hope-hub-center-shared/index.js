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
var B = require("hope-base");
var fs = require("fs");


exports.protocol = require("./lib/protocol");


/**
 * Generate the id for a HOPE instance.
 *
 * The returned id is the hash of a concated string consisted of the following:
 *
 *  - content from deployment_id_path (would create one if it doesn't exist)
 *    this normally indicates a deployment of the HOPE
 *  - the path of config file to start the HOPE
 *    this normally indicates a process on the deployment
 *  
 * 
 * 
 * @param {String} config_path The path for the configuration
 * @return {String} The id generated
 */
exports.get_instance_id = function(deployment_id_path, config_path) {
  config_path = config_path || "##NULL##";

  if (!B.fs.file_exists(deployment_id_path)) {
    fs.writeFileSync(deployment_id_path, B.unique_id("DEPLOYMENT_"));
  }
  return B.hash_string(fs.readFileSync(deployment_id_path) + config_path);
};



exports.process_config = require("./lib/config").process;
