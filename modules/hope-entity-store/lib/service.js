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
 * service store
 * @module entity-store/service
 */
var B = require("hope-base");
var CommonStore = require("./common.js");
var _ = require("lodash");
var check = B.check;
module.exports = ServiceStore;
var log = B.log.for_category("entity-store/service");

var service_schema = {};

// check whether the service obj obey the service schema
// service: {
//  id: string||number
//  name: string
//  spec: string||number 
//  thing: string||number
//  path: string, optional
//  is_connect: boolean
//  type: string
//  own_spec: boolean

// }
function check_service_schema (value) {
  try {
    check(_.isString(value.id) || _.isNumber(value.id), "entity-store/service", "invalid id", value);
    check(_.isString(value.spec) || _.isNumber(value.spec), "entity-store/service", "invalid spec", value);
    check(_.isString(value.thing) || _.isNumber(value.thing), "entity-store/service", "invalid thing", value);
    check(_.isString(value.name), "entity-store/service", "invalid name", value);
    check(_.isString(value.type), "entity-store/service", "invalid type", value);
    check(_.isBoolean(value.is_connect), "entity-store/service", "invalid is_connect", value);
    check(_.isBoolean(value.own_spec), "entity-store/service", "invalid own_spec", value);

    return true;
  } catch (e) {
    log.error("check_schema", e);
    return false;
  }
}


//check_service_func_object has two members
//"one": the check pair function, return boolean
//"batch": the check pair array function, return array of valid pairs
var check_service_func_object = CommonStore.generate_check_schema(check_service_schema, service_schema);
var check_service_pair =  check_service_func_object.one;
var check_service_pair_array = check_service_func_object.batch;
/**
 * @class service-store class
 * @extends CommonStore
 * @param {String} type pass to CommonStore
 * @param {Object} config pass to CommonStore
 */
function ServiceStore(type, config) {
  this.type = "service";
  CommonStore.call(this, type, config);
}

B.type.inherit(ServiceStore, CommonStore);

ServiceStore.prototype.set$ = function(key, value, list) {
  if (check_service_pair(key, value)) {
    return this._set$(key, value, list);
  }
  else {
    return Promise.reject(new Error(CommonStore.CHECK_FAIL));
  }
};

ServiceStore.prototype.batch_set$ = function(pair_array, list) {
  var valid_array = check_service_pair_array(pair_array);
  if (!_.isEqual(pair_array, valid_array)) {
    return Promise.reject(CommonStore.new_batch_error(CommonStore.CHECK_FAIL, pair_array, []));
  }
  else {
    return this._batch_set$(valid_array, list);
  }
};
