 var _prop, _swapValues, _currentData, _insertValue,
   /**
    * looks in our swapValues list to see if a value needs to be normalized
    *
    * @param  {String} key
    * @return {object}
    */
    _compareSwap = function(key) {
      return _swapValues[key] ? true : false;
    },
   /**
    * Traverses arrays in our data and applies the format.
    *
    * @param  {Array} compareKeys
    * @param  {Object} data
    * @param  {string} newKey
    * @return {Array}
    */
    _traverseArr = function(compareKeys, data, newKey) {
      var thisKey = compareKeys.shift(), thisData;
      for(var a= 0, b=data.length; a<b; a++) {
        thisData = data[a];
        //type is a required key if arrays are specified
        if(!thisData.type) {
          throw new Error(thisData + " type key is required if an array is specified in NEW_OBJECTS");
        }
        if(thisData.type === thisKey) {
          if(compareKeys.length > 0) {
            data[a] = _traverseObj(compareKeys, thisData, newKey);
          }else {
            data[a][newKey] = _insertValue;
          }
          break;
        }
      }
      return data;
    },

   /**
    * checks if an object, not an array.
    *
    * @param  {Object} data
    * @return {Boolean}
    */
    _checkIfObjOnly = function(data) {
      return typeof data === "object" && !Array.isArray(data);
    },
   /**
    * Traverses objects in our data and applies format.
    *
    * @param  {Array} compareKeys
    * @param  {Object} data
    * @param  {string} newKey
    * @return {Object}
    */
    _traverseObj = function(compareKeys, data, newKey) {
      var thisKey = compareKeys.shift();
      if(data[thisKey]) {
        if (compareKeys.length > 0) {
          //if an object and not an array
          if (_checkIfObjOnly(data[thisKey])) {
            data[thisKey] = _traverseObj(compareKeys, data[thisKey], newKey);
          }
          //if an array
          if (Array.isArray(data[thisKey])) {
            data[thisKey] = _traverseArr(compareKeys, data[thisKey], newKey);
          }
        } else {
          if (typeof data !== "object") {
            data[thisKey] = {};
          }
          data[thisKey][newKey] = _insertValue;
        }
        //automatically builds an object if key doesn't exist in NEW_OBJECTS
        // if(data[thisKey])
      }else {
        if(!_checkIfObjOnly(data)) {
          data = {};
        }
        data[thisKey] = {};
        //if additional compare keys exists
        if (compareKeys.length > 0) {
          data[thisKey] = _traverseObj(compareKeys, data[thisKey], newKey);
        } else {
          data[thisKey][newKey] = _insertValue;
        }
      }
      return data;
    },
     /**
      * Adds the specified swap value to existing data.
      *
      * @return {Object}
      */
    _addSwapValue = function() {
      var swap = _swapValues[_prop],
          keyMap,
          newKey = swap[0];
      //check to see if new parent is specified
      if(swap[1]) {
        //splits if many
        keyMap = swap[1].split("/");
        //if no "/" split will return an empty array and we need to assign our 1 value instead
        keyMap = keyMap.length === 0 ? [swap[1]] : keyMap;
        _currentData = _traverseObj(keyMap, _currentData, newKey);
      }else {
        _currentData[swap[0]] = _insertValue;
      }
      return _currentData;
    },
   /**
    * Builds each new data entry from config object.
    *
    * @param  {Object} item
    * @param  {Object} model
    * @param  {object} config
    * @return {Object}
    */
   _buildEach = function(item, model, config) {
     _currentData = {};
     if(config || model) {
       _currentData = JSON.parse(JSON.stringify(config ? config.formatData.NEW_OBJECTS : model.formatData.NEW_OBJECTS));
     }
     _swapValues = config ? config.formatData.SWAP_VALUES : model.formatData.SWAP_VALUES;
     for(var thisProp in item) {
       //check if this is a prototype method
       if(item.hasOwnProperty(thisProp)) {
         _insertValue = item[thisProp];
         _prop = thisProp;
         //if this property is on the swap list
         //get swap value
         if(_compareSwap(thisProp, _swapValues)) {
           _currentData = _addSwapValue();
         }else {
           _currentData[thisProp] = _insertValue;
         }
       }
     }
     return _currentData;
   },
   /**
    * this normalizes all items from our model for use on the client
    *
    * @param  {Array} data
    * @param  {Object} model
    * @param  {object} config
    * @return {Object}
    */
    normalize = function(data, model, config) {
      var output = [], thisData;
      for(var a= 0, b=data.length; a<b; a++) {
        thisData = data[a];
        output.push(_buildEach(thisData, model, config));
      }
      return output;
    };

module.exports.format = normalize;
