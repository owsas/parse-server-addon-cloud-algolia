# Parse Server Addon Cloud Algolia

![Travis](https://travis-ci.org/owsas/parse-server-addon-cloud-algolia.svg?branch=master)

Keeps in sync your database with Algolia, adding new behaviours on the `afterSave` and `afterDelete` functions on the Cloud Code. 

This is an addon for [ParseCloudClass](https://github.com/owsas/parse-cloud-class), and [parse-server](https://github.com/parse-community/parse-server)

## Installation

```
npm install --save parse-server-addon-cloud-class-algolia
```

Note: This package is Typescript friendly and comes with Intellisense :)

## Features
* Adds new objects in your class to algolia
* Updates the objects in algolia when they change
* Deletes the objects in algolia as they get removed from your database
* Works for both PostgresSQL and MongoDB

## How to use

This package requires you to check first `parse-server-addon-cloud-class` and how it works.

```js
// cloud/main.js
import { 
  ParseCloudClass 
} from 'parse-server-addon-cloud-class';

import { 
  AlgoliaCloudAddon 
} from 'parse-server-addon-cloud-class-algolia';


const algoliaAddon = new AlgoliaCloudAddon()
  // initialize this with your credentials
  .initialize('ALGOLIA_APP_ID', 'ALGOLIA_KEY', 'INDEX_NAME')
  // set the keys you want to index in algolia
  // for each of your objects
  .setKeysToIndex([ 'name', 'location', 'numShares', 'otherObj' ]);


// Now we create the configuration for our class. For more information, refer to its docs
// here: https://github.com/owsas/parse-cloud-class
const classConfig = new ParseCloudClass();
classConfig.useAddon(algoliaAddon);


// Now we finish configuring the class to 
// use our given configuration
ParseCloudClass.configureClass(Parse, 'MyParseClass', classConfig);
```

## The result

You will have a sync between your desired Parse class, stored in PostgreSQL or MongoDB and Algolia for efficient searching.

This addon will setup the following hooks:
* __afterSave__
* __afterDelete__


## Extending the Algolia Cloud Addon

You can easily extend the Algolia Cloud Addon as it is a normal Javascript class, doing the following: 

```ts
import { 
  AlgoliaCloudAddon 
} from 'parse-server-addon-cloud-class-algolia';

export class MyModified extends AlgoliaCloudAddon {
  // your new implementations to the lyfecycle functions
}
```

Note: Check all the possibilities [here](https://github.com/owsas/parse-cloud-class)

## Credits

Developed by Juan Camilo Guarín Peñaranda,  
Otherwise SAS, Colombia  
2017

## License 

MIT.

## Support us on Patreon
[![patreon](./repo/patreon.png)](https://patreon.com/owsas)
