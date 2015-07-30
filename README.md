# DataFormatter
This is a plugin for the Sails framework for node.js that allows you to specify new keys and set a new format on data pulled from a database.  
I originally built this to handle legacy data structures and convert it to a more usable format for modern apps.  


## Usage
npm install https://github.com/mikemike26/DataFormatter.git

This is meant to extend the model object, but Sails doesn't have an elegant way to do this yet so include the following in your config/models.js:
    var dataFormatter = require('dataFormatter');
    
Then add this inside your module.exports.models
    normalize: function(items, config) {
      return dataFormatter.normalize(items, this, config);
    }
    
    
Add a new data format to any of your models by adding keys and values to SWAP_VALUES:
    formatData: {
        SWAP_VALUES: {
          original_key_from_db: ["new_key"]
        }
      }
      
Additionally, you can specify structure to the new values by adding a path string as a second value in your settings array.
You can specify an array with NEW_OBJECTS.  You have to declare the order in NEW_OBJECTS using the key "type" if you want to insert into a new array.
If no structure is specified in NEW_OBJECTS a new object parent will automatically be created.
You can also add new keys and values as well in NEW_OBJECTS.  This is especially useful if you need to take very specific data and generalize it.

    formatData: {
        SWAP_VALUES: {
          original_key_from_db: ["new_key", "newParent1/newParent2"]
        },
        NEW_OBJECTS: {
          newParent1: [
            {
              type: "newParent2",
              newKey1: "newValue1",
              newKey2: "newValue2",
            }
          ]
    
        }
      }
      
After that's all set up, use this in your controller after you retrieve data from your database
    module.exports = {
      find: function(req, res) {
        yourModel.query(query, function(err, results) {
          if(err) {
            return res.negotiate(err);
          }
          return res.json(yourModel.normalize(results));
        });
      }
    };