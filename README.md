# DataFormatter
This is a plugin for the Sails framework for node.js that allows you to specify new keys and set a new format on data pulled from a database.  
I originally built this to handle legacy data structures and convert it to a more usable format for modern apps.  


## Usage
npm install https://github.com/mikemike26/DataFormatter.git

This is meant to extend the model object, but Sails doesn't have an elegant way to do this yet so include the following in your config/models.js:

    var dataFormatter = require('dataFormatter');
    
Then add this inside your module.exports.models

    normalize: function(items, config) {
      return dataFormatter.format(items, this, config);
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
    
## Example of Usage

Incoming data from our model:
    
    data = [
      {
        site1_address1: "someValue",
        site1_address2: "someValue",
        site1_city: "someValue",
        site1_zip: "someValue",
        site1_state: "someValue",
        site2_address1: "someValue",
        site2_address2: "someValue",
        site2_city: "someValue",
        site2_zip: "someValue",
        site2_state: "someValue",
        site3_address1: "someValue",
        site3_address2: "someValue",
        site3_city: "someValue",
        site3_zip: "someValue",
        site3_state: "someValue"
      }
    ]

Apply our desired format:

    formatData: {
        SWAP_VALUES: {
          site1_address1: ["address1", "addresses/site1/address"],
          site1_address2: ["address2", "addresses/site1/address"],
          site1_city: ["city", "addresses/site1"],
          site1_zip: ["zip", "addresses/site1"],
          site1_state: ["state", "addresses/site1"],
          site2_address1: ["address1", "addresses/site2/address"],
          site2_address2: ["address2", "addresses/site2/address"],
          site2_city: ["city", "addresses/site2"],
          site2_zip: ["zip", "addresses/site2"],
          site2_state: ["state", "addresses/site2"],
          site3_address1: ["address1", "addresses/site3/address"],
          site3_address2: ["address2", "addresses/site3/address"],
          site3_city: ["city", "addresses/site3"],
          site3_zip: ["zip", "addresses/site3"],
          site3_state: ["state", "addresses/site3"]
        },
        NEW_OBJECTS: {
          addresses: [
            {
              type: "site1",
              siteName: "Site One"
            },
            {
              type: "site2",
              siteName: "Site Two"
            },
            {
              type: "site3",
              siteName: "Site Three"
            }
          ]
        }
      }
        
Resulting output: 

       data: {
          addresses: [
            {
              type: "site1",
              siteName: "Site One",
              address: {
                address1: "someValue",
                address2: "someValue",
              },
              city: "someValue",
              zip: "someValue",
              state: "someValue"
            },
            {
              type: "site2",
              siteName: "Site Two",
              address: {
                address1: "someValue",
                address2: "someValue",
              },
              city: "someValue",
              zip: "someValue",
              state: "someValue"
            },
            {
              type: "site3",
              siteName: "Site Three",
              address: {
                address1: "someValue",
                address2: "someValue",
              },
              city: "someValue",
              zip: "someValue",
              state: "someValue"
            }
          ]
        }
        
Notice that "type" is required since we're specifying an array of addresses, we added the key "siteName", and the address object was created for each item even though we didn't specify it in our NEW_OBJECTS

### Todo: 

write tests and expand to support inserting new format into new database tables