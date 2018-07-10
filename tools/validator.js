var validator = require('mysql-validator');

const tools = require('./tools.js');

exports.check = function(keys, types, returnErrors) {
  var errors = [];

  if(Object.keys(keys).length < 1){
    return false;
  }

  for(var key in types) {
    if(!keys[key]){
      errors.push({ name: key, error: 'undefined param'})
    }

    var err = validator.check(keys[key], types[key]);

    if(err){
      errors.push({ name: key, error: err.message })
    };
  }

  if(returnErrors){
    return {
      valid: errors.length == 0,
      errors: errors
    }
  }

  if(errors.length){
    console.log('errors during validation');
    console.log(tools.error(errors));
  }

  return errors.length == 0;
};
