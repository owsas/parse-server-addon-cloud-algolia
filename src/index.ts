import * as Parse from 'parse/node';
import * as algolia from 'algoliasearch';
import { ParseCloudClass, IProcessRequest } from 'parse-server-addon-cloud-class';
import * as is from 'is';

export class AlgoliaCloudAddon extends ParseCloudClass {
  algoliaIndex: algolia.AlgoliaIndex;
  keysToIndex: string[] = [];

  /**
   * Call this before using the addon
   * @param appId 
   * @param apiKey 
   * @param indexName 
   */
  initialize(appId: string, apiKey: string, indexName: string): AlgoliaCloudAddon {
    this.algoliaIndex = algolia(appId, apiKey).initIndex(indexName);
    return this;
  }

  /**
   * Set the keys you want to index from your object
   * @param keys
   */
  setKeysToIndex(keys:string[]): AlgoliaCloudAddon {
    this.keysToIndex = keys;
    return this;
  }

  /**
   * Default afterSave saves an analytic of creation that references the object
   * @param req
   * @return The object that was saved
   */
  async afterSave(
    req: Parse.Cloud.AfterSaveRequest | IProcessRequest,
  ): Promise<Parse.Object> {
    const obj = req.object;
    const objToSave = {};

    for (const key of this.keysToIndex) {
      if (obj.get(key) instanceof Parse.GeoPoint) { // GeoPoints
        objToSave['_geoloc'] = { 
          latitude: obj.get(key).latitude, 
          longitude: obj.get(key).longitude,
        };
      } else if (
        obj.get(key) instanceof Parse.File || 
        is.function(obj.get(key) && obj.get(key).url)
      ) { // Files 
        objToSave[key] = obj.get(key).url();
      } else if (obj.get(key).id) { // Relation 1:1 Parse Objects
        objToSave[key] = obj.get(key).id;
      } else { // Other values (boolean, string, number)
        objToSave[key] = obj.get(key);
      }
    }

    if (Object.keys(objToSave).length) {
      // Add or update the object on Algolia
      this.algoliaIndex.addObject(objToSave, req.object.id);
    }

    return req.object;
  }

  /**
   * Default afterSave saves an analytic of creation that references the object
   * @param req
   * @return The object that was saved
   */
  async afterDelete(
    req: Parse.Cloud.AfterDeleteRequest | IProcessRequest,
  ): Promise<Parse.Object> {
    // Delete the object on Algolia
    this.algoliaIndex.deleteObject(req.object.id);
    return req.object;
  }
  
}
