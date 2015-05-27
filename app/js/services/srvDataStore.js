
angular.module('srvDataStore', [])

.factory('srvDataStore', function ($q, srvLocalStorage, srvFileStorage, md5, $rootScope) {
  return new SrvDataStore($q, srvLocalStorage, srvFileStorage , md5, $rootScope);
});


var SrvDataStore = (function() {
  'use strict';
  function Service(   qService, srvLocalStorage, srvFileStorage, md5, $rootScope) {

      this.q = qService;
      this.srvLocalStorage = srvLocalStorage;
      this.srvFileStorage = srvFileStorage;
      this.md5 = md5;
      this.rootScope = $rootScope;
      this.initDone = false;

      this.md5Items = [];
  }


  Service.prototype.init = function () {

      //NO needs
      if (this.initDone) return;
      a4p.InternalLog.log('srvData', "init is not needed");
      this.initDone = true;
  };



  Service.prototype.setItems = function (type, items, asOfficialSynchronizedItems) {
      if (!type || !items || !a4p.isDefined(items.length)) return false;

      a4p.InternalLog.log('srvDataStorage', 'setItems '+asOfficialSynchronizedItems+' t:'+type+' nb:'+items.length);

      var oI = 'C4P-data-'+type;
      var lI = 'C4P-data-'+type+'-local';
      var itemsListName = lI;
      if (asOfficialSynchronizedItems){
        itemsListName = oI;
      }

      // Check storage as mandatory
      var itemsAsString = a4p.Json.object2String(items);//items.toString()
      var fullItemsMd5 = this.md5.createHash(itemsAsString);//MLE calcMD5(itemsAsString);
      var fullPreviousItemsMd5 = this.md5Items[itemsListName];
      if (typeof fullPreviousItemsMd5 != 'undefined' && fullItemsMd5 == fullPreviousItemsMd5) {
          a4p.InternalLog.log('srvDataStorage','setItems : same md5 do not need to store');
      }
      else {
          a4p.InternalLog.log('srvDataStorage','setItems : well done ! md5 are different');
          // store items
          this.srvLocalStorage.set(itemsListName, items);
          this.md5Items[itemsListName] = fullItemsMd5;
      }

      // Check original vs local
      var oMd5 = this.md5Items[oI];
      var lMd5 = this.md5Items[lI];
      if (typeof oMd5 == 'undefined' || oMd5 == lMd5) {
          a4p.InternalLog.log('srvDataStorage','original and local are the same');
      }
      else {
          a4p.InternalLog.log('srvDataStorage','original and local are now different');
      }

      return true;
  };

  Service.prototype.getItems = function (type, asOfficialSynchronizedItems) {
      if (!type) return [];

      //a4p.InternalLog.log('srvDataStorage', 'getItems :'+type);
      var items = [];
      var itemsListName = 'C4P-data-'+type+'-local';
      if (asOfficialSynchronizedItems) {
          itemsListName = 'C4P-data-'+type;
      }

      items = this.srvLocalStorage.get(itemsListName, []);
      //var fullItemsMd5 = calcMD5(itemsAsString);
      //this.md5Items[itemsListName] = fullItemsMd5;


      if (items && a4p.isDefined(items.length))
          a4p.InternalLog.log('srvDataStorage', 'getItems :'+type+' nb:'+items.length);

      return items;
  };



  Service.prototype.setConfig = function (key, value) {
      if (!key) return false;


      this.srvLocalStorage.set('C4P-config-'+key+'-local', value);

      return true;
  };

  Service.prototype.getConfig = function (key, defaultValue) {
      if (!key) return null;

      var value = this.srvLocalStorage.get('C4P-config-'+key+'-local', defaultValue);

      return value;
  };

  // ... login ?


  return Service;
})();
