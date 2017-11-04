import * as Parse from 'parse/node';

const addObjectMock = jest.fn();
const deleteObjectMock = jest.fn();

// The mock for the algolia's initIndex function
const initIndexMock = jest.fn(() => ({ 
  addObject: addObjectMock,
  deleteObject: deleteObjectMock,
}));

// The mock for the algolia module
const algoliaMock = jest.fn(() => ({
  initIndex: initIndexMock,
}));

// Now we mock the module
const mock = jest.mock('algoliasearch', () => algoliaMock);

// We import the module here, because we 
// needed to set the algolia's mock first
import { AlgoliaCloudAddon } from '../src/index';

beforeEach(() => {
  jest.clearAllMocks();
});

test('should be able to create an instance without errors', () => {
  const instance = new AlgoliaCloudAddon();
});

describe('#initialize', () => {
  test('should not throw', () => {
    const instance = new AlgoliaCloudAddon();
    instance.initialize('appId','myKey','indexName');
  });

  test('should return an instance of the class', () => {
    const instance = new AlgoliaCloudAddon();  
    const result = instance.initialize('appId','myKey','indexName');
    expect(result).toEqual(instance);
  });

  test('should initialize algolia', () => {
    const instance = new AlgoliaCloudAddon();
    const result = instance.initialize('appId','myKey','indexName');
    expect(algoliaMock).toHaveBeenCalledTimes(1);
    expect(algoliaMock).toHaveBeenCalledWith('appId','myKey');
  });

  test('should set the value for instance.algoliaIndex', () => {
    const instance = new AlgoliaCloudAddon();
    const result = instance.initialize('appId','myKey','indexName');
    expect(instance.algoliaIndex).toBeTruthy();
    expect(instance.algoliaIndex.addObject).toBeTruthy();
  });
});

describe('#setKeysToIndex', () => {
  test('should set the keys for the instance.keysToIndex', () => {
    const instance = new AlgoliaCloudAddon();
    instance.setKeysToIndex(['name','otherValue']);
    expect(instance.keysToIndex).toEqual(['name','otherValue']);
  });

  test('should return an instance of the class', () => {
    const instance = new AlgoliaCloudAddon();  
    const result = instance.setKeysToIndex(['name','otherValue']);    
    expect(result).toEqual(instance);
  });
});

describe('#afterSave', () => {
  // tslint:disable-next-line
  test('should return the same object if there are no operations to make, and should not call algolia', async () => {
    const instance = new AlgoliaCloudAddon();
    const obj = new Parse.Object('Test');
    const result = await instance.afterSave({ object: obj });

    // no operations means no calls to algolia
    expect(addObjectMock).not.toHaveBeenCalled();

    expect(result).toEqual(obj);
  });

  test('should work well with Parse.GeoPoint', async () => {
    const instance = new AlgoliaCloudAddon()
      .initialize('appId','myKey','indexName');
    
    instance.setKeysToIndex(['location']);

    const obj = new Parse.Object('Test');
    obj.set('location', new Parse.GeoPoint(11,12));
    obj.id = '123';

    const result = await instance.afterSave({ object: obj });
    
    expect(addObjectMock).toHaveBeenCalledTimes(1);
    expect(addObjectMock).toHaveBeenCalledWith(
      {
        _geoloc: { latitude: 11, longitude: 12 },
      },
      '123',
    ); 
  });

  test('should work well with Parse.File', async () => {
    const instance = new AlgoliaCloudAddon()
      .initialize('appId','myKey','indexName');
    
    instance.setKeysToIndex(['file']);

    const obj = new Parse.Object('Test');
    obj.set('file', { url: () => 'https://somefile' });
    obj.id = 'id123';

    const result = await instance.afterSave({ object: obj });
    
    expect(addObjectMock).toHaveBeenCalledTimes(1);
    expect(addObjectMock).toHaveBeenCalledWith(
      {
        file: 'https://somefile',
      },
      'id123',
    ); 
  });

  test('should work well with Parse.Relation of 1:1', async () => {
    const instance = new AlgoliaCloudAddon()
      .initialize('appId','myKey','indexName');
    
    instance.setKeysToIndex(['owner']);

    const other = new Parse.Object('Other');
    other.id = 'other123';

    const obj = new Parse.Object('Test');
    obj.set('owner', other);
    obj.id = 'id123';

    const result = await instance.afterSave({ object: obj });
    
    expect(addObjectMock).toHaveBeenCalledTimes(1);
    expect(addObjectMock).toHaveBeenCalledWith(
      {
        owner: 'other123',
      },
      'id123',
    ); 
  });

  test('should work well with other values', async () => {
    const instance = new AlgoliaCloudAddon()
      .initialize('appId','myKey','indexName');
    
    instance.setKeysToIndex(['string', 'number', 'boolean', 'array']);

    const obj = new Parse.Object('Test');
    obj.set('string', 'hello');
    obj.set('number', 456);
    obj.set('boolean', true);
    obj.set('array', ['test']);
    obj.id = 'id456';

    const result = await instance.afterSave({ object: obj });
    
    expect(addObjectMock).toHaveBeenCalledTimes(1);
    expect(addObjectMock).toHaveBeenCalledWith(
      {
        array: ['test'],
        boolean: true,
        number: 456,
        string: 'hello',
      },
      'id456',
    ); 
  });
});

describe('#afterDelete', () => {
  test('should delete the object from algolia and return the same object', async () => {
    const instance = new AlgoliaCloudAddon()
      .initialize('appId','myKey','indexName');

    const obj = new Parse.Object('Test');
    obj.set('location', new Parse.GeoPoint(11,12));
    obj.id = 'deleteId789';

    const result = await instance.afterDelete({ object: obj });
    
    expect(deleteObjectMock).toHaveBeenCalledTimes(1);
    expect(deleteObjectMock).toHaveBeenCalledWith('deleteId789');

    expect(result).toEqual(obj);
  });

});
