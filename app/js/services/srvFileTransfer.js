
angular.module('srvFileTransfer', [])

.factory('srvFileTransfer', function ($q, $http, srvFileStorage, md5, $rootScope) {
  return new SrvFileTransfer($q, $http, srvFileStorage, md5, $rootScope);
});


/**
 * File Transfer Service, which send files via HTTP requests (Chrome) or File Transfer (PhoneGap).
 */
var SrvFileTransfer = (function() {
    'use strict';

    function Service(deferService, httpService, srvFileStorage, md5, $rootScope) {
        this.defer = deferService;
        this.http = httpService;
        this.srvFileStorage = srvFileStorage;
        this.md5 = md5;
       // this.srvData = srvData;
        this.rootScope = $rootScope;
    }

    /**
     * Transfer the content of file filePath to a server at url.
     *
     * Example of options = {
     *     fileKey:'file',
     *     fileName:'photoName'
     * }
     * Example of params = {
     *     transactionId:transactionId,
     *     sendmail:false,
     *     user_email:email,
     *     object_id:eventId
     *     fileName:'photoName.jpg',
     *     fileType:'jpg',
     *     fileWsid:'1',
     *     filesNames:'photoName.jpg',
     *     filesTypes:'jpg',
     *     filesWsids:'1'
     * }
     *
     * @param filePath
     * @param options
     * @param url
     * @param params
     * @param headers
     * @param timeout in milliseconds
     * @return promise
     */
    Service.prototype.sendFile = function (filePath, options, url, params, headers, timeout) {
        if ((typeof(url) == 'undefined') || (!url)) {
            throw new Error("send requires a url parameter");
        }
        if (typeof(params) == 'undefined') params = null;
        //if (typeof(data) == 'undefined') data = null;
        if (typeof(headers) == 'undefined') headers = null;
        if (typeof(timeout) == 'undefined') timeout = null;// in milliseconds

        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;
/*
        promise.success = function (fn) {
            return promise.then(function (response) {
                fn(response.data, response.status, response.headers);
            });
        };

        promise.error = function (fn) {
            return promise.then(null, function (response) {
                fn(response.data, response.status, response.headers);
            });
        };
*/
        // IOS cache POST requests ... we DO NOT WANT that => we add a time param which change each time
        if (!params) params = {};
        if ((typeof(params.time) == 'undefined') || (!params.time)) {
            params.time = new Date().getTime();
        }
        if ((typeof(params.cache) == 'undefined') || (!params.cache)) {
            params.cache = false;
        }
        // if we need to JSONify a data objet : data = $.param(data);

        if (a4p.isDefinedAndNotNull(FileTransfer)) {
            var onTransferSuccessFct = function (fileUploadResult, result) {
                //lee fileUploadResult.response is form String , but we need form JSon , convert String to JSon
                a4p.safeApply(self.rootScope, function() {
                    var data = fileUploadResult.response;
                    if (typeof data == 'string') {
                        var JSON_START = /^\s*(\[|\{[^\{])/,
                            JSON_END = /[\}\]]\s*$/,
                            PROTECTION_PREFIX = /^\)\]\}',?\n/;
                        // strip json vulnerability protection prefix
                        data = data.replace(PROTECTION_PREFIX, '');
                        if (JSON_START.test(data) && JSON_END.test(data)) {
                            data = a4p.Json.string2Object(data);
                        }
                    }
                    deferred.resolve({data:data, status:fileUploadResult.responseCode});
                });
            };
            var onTransferFailureFct = function (fileTransferError) {
                var msg = 'File upload failure for ' + filePath + ' : ' +
                    transferErrorMessage(fileTransferError) +
                    "(source=" + fileTransferError.source +
                    ", target=" + fileTransferError.target + ")";
                a4p.safeApply(self.rootScope, function() {
                    a4p.ErrorLog.log('srvFileTransfer', msg);
                    deferred.reject({data:msg, status:'error'});
                });
            };
            var onGetFileSuccessFct = function (fileEntry) {
                var uploadOptions = new FileUploadOptions();
                uploadOptions.chunkedMode = false; // apparently needed if not set
                uploadOptions.mimeType="multipart/form-data";
                uploadOptions.fileKey="file";
                uploadOptions.fileName="noname";
                for (var optionKey in options) {
                    if (!options.hasOwnProperty(optionKey)) continue;
                    uploadOptions[optionKey] = options[optionKey];
                }
                if (params !== null) {
                    var optionsParams = {};
                    for (var paramKey in params) {
                        if (!params.hasOwnProperty(paramKey)) continue;
                        // FileTransfer in APPLE DO NOT encode objects in QUERY
                        if (typeof(params[paramKey]) == 'object') {
                            params[paramKey] = a4p.Json.object2String(params[paramKey]);
                        }
                        optionsParams[paramKey] = params[paramKey];
                    }
                    uploadOptions.params = optionsParams;
                }
                var ft = new FileTransfer();
                // TODO use scope.srvConfig.trustAllHosts
                var trustAllHosts = true;
                var feUrl = fileEntry.fullPath;
                if (a4p.isDefined(fileEntry.toNativeURL)) feUrl = fileEntry.toNativeURL();
                var destUri = url;//encodeURIComponent(url);

                a4p.InternalLog.log('srvFileTransfer', "File uploading " + feUrl + " to " + destUri);
                ft.upload(feUrl, //MLE fileEntry.fullPath,
                    destUri, onTransferSuccessFct, onTransferFailureFct, uploadOptions, trustAllHosts);
            };
            var onGetFileFailureFct = function (message) {
                var msg = 'File get failure for ' + filePath + ' : ' + message;
                a4p.safeApply(self.rootScope, function() {
                    a4p.ErrorLog.log('srvFileTransfer', msg);
                    deferred.reject({data:msg, status:'error'});
                });
            };
            this.srvFileStorage.getFile(filePath, onGetFileSuccessFct, onGetFileFailureFct);
        } else {
            var fileName = c4p.Model.fileLastname(filePath);
            if (options) {
                if ((typeof(options.fileKey) === 'undefined') || (!options.fileKey)) {
                    options.fileKey = "file";
                }
                if ((typeof(options.fileName) == 'undefined') || (!options.fileName)) {
                    options.fileName = fileName;
                }
            } else {
                options = {};
                options.fileKey = "file";
                options.fileName = fileName;
            }
            // BEWARE it is not always possible to send BIG files => we split them in smaller files (< 100 ko)
            // ReadFile callbacks
            var onReadFileSuccessFct = function (data) {
                var fullMd5 = this.md5.createHash(data);//MLE calcMD5(data);
                var sendPartFile = function (params, idx, nb, nbTry) {
                    params.idx = idx;
                    params.nb = nb;
                    // BEWARE : does not work if nb < data.length (sending empty file must not be done)
                    var trunkSize = Math.ceil(data.length / nb);
                    var begOffset = (idx - 1)*trunkSize;
                    if ((begOffset + trunkSize) > data.length) {
                        // size of last trunk
                        trunkSize = data.length - begOffset;
                    }
                    var partData = data.substr(begOffset, trunkSize);
                    var partMd5 = this.md5.createHash(partData);//MLE calcMD5(partData);
                    var n = 1;
                    var boundary = '----srvPartFileTransferBoundary';
                    while (partData.indexOf(boundary + n) >= 0) n++;
                    boundary = boundary + n;
                    if (!headers) headers = {};
                    headers["Content-Type"] = "multipart/form-data; boundary="+boundary;
                    var body = "";
                    /*
                     if (params != null) {
                     for (var paramKey in params) {
                     if (!params.hasOwnProperty(paramKey)) continue;
                     body += "--" + boundary + "\r\nContent-Disposition: form-data"
                     + "; name=\"" + encodeURIComponent(paramKey) + "\""
                     + "\r\n\r\n" + encodeURIComponent(params[paramKey])+ "\r\n";
                     }
                     }
                     */
                    body += "--" + boundary + "\r\nContent-Disposition: form-data" +
                            "; name=\"" + encodeURIComponent(options.fileKey) + "\"" +
                            "; filename=\"" + encodeURIComponent(options.fileName) + "\"" +
                            "\r\nContent-Type: " + c4p.Model.fileFirstMimetype(options.fileName) +
                            "\r\n\r\n" + partData + "\r\n";
                    body += "--" + boundary + "--\r\n";
                    var len = body.length;
                    // XHR transforms data as utf8 instead of binary => we must use a Uint8Array to keep binary data
                    var byteArray = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        byteArray[i] = body.charCodeAt(i) & 0xff;
                    }
                    // ANGULAR badly encode Array objects in QUERY (split in many times the same param while PHP take only the last one)
                    for (var k in params) {
                        if (!params.hasOwnProperty(k)) continue;
                        if (params[k] instanceof Array) {
                            params[k] = a4p.Json.object2String(params[k]);
                        }
                    }
                    var urlData = {
                        method: 'POST',
                        url: url,
                        headers: headers,
                        params: params,
                        data: byteArray,
                        transformRequest: angular.identity
                    };
                    if (timeout) urlData.timeout = timeout;
                    //a4p.InternalLog.log('srvFileTransfer', "File uploading " + filePath + " to " + url + " with " + a4pDumpData(urlData, 3));
                    a4p.InternalLog.log('srvFileTransfer', "File uploading " + filePath + " to " + url);
                    var fctOnHttpSuccess = function (response) {
                        //response.data, response.status, response.headers
                        if (1 < nb) {
                            if (idx < nb) {
                                if (partMd5 == response.data.md5) {
                                    a4p.InternalLog.log('srvFileTransfer', 'File upload success for ' + filePath + ' ' + idx + '/' + nb +
                                    ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                                    idx++;
                                    sendPartFile(params, idx, nb, 1);
                                } else {
                                    if (nbTry < 5) {
                                        nbTry++;
                                        a4p.ErrorLog.log('srvFileTransfer', 'File upload retried for ' + filePath + ' ' + idx + '/' + nb +
                                        ' : md5 mismatch, client md5=' + partMd5 + ', server md5=' + response.data.md5);
                                        sendPartFile(params, idx, nb, nbTry);
                                    } else {
                                        a4p.safeApply(self.rootScope, function() {
                                            a4p.ErrorLog.log('srvFileTransfer', 'File upload failure for ' + filePath + ' ' + idx + '/' + nb +
                                            ' : md5 mismatch, client md5=' + partMd5 + ', server md5=' + response.data.md5);
                                            deferred.reject({data:'File upload failure for ' + filePath +
                                            ' : md5 mismatch => file integrity compromised', status:'error'});
                                        });
                                    }
                                }
                            } else {
                                if (fullMd5 == response.data.md5) {
                                    // Success
                                    a4p.safeApply(self.rootScope, function() {
                                        a4p.InternalLog.log('srvFileTransfer', 'File upload success for ' + filePath +
                                        ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                                        deferred.resolve(response);
                                    });
                                } else {
                                    if (nbTry < 5) {
                                        nbTry++;
                                        a4p.ErrorLog.log('srvFileTransfer', 'File upload retried for ' + filePath + ' ' + idx + '/' + nb +
                                        ' : md5 mismatch, client md5=' + fullMd5 + ', server md5=' + response.data.md5);
                                        sendPartFile(params, idx, nb, nbTry);
                                    } else {
                                        a4p.safeApply(self.rootScope, function() {
                                            a4p.ErrorLog.log('srvFileTransfer', 'File upload failure for ' + filePath + ' ' + idx + '/' + nb +
                                            ' : md5 mismatch, client md5=' + fullMd5 + ', server md5=' + response.data.md5);
                                            deferred.reject({data:'File upload failure for ' + filePath +
                                            ' : md5 mismatch => file integrity compromised', status:'error'});
                                        });
                                    }
                                }
                            }
                        } else {
                            // Success
                            a4p.safeApply(self.rootScope, function() {
                                a4p.InternalLog.log('srvFileTransfer', 'File upload success for ' + filePath +
                                ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                                deferred.resolve(response);
                            });
                        }
                    };
                    var fctOnHttpError = function (response) {
                        //response.data, response.status, response.headers
                        a4p.ErrorLog.log('srvFileTransfer', 'File upload failure for ' + filePath +
                        ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                        if (nbTry < 5) {
                            nbTry++;
                            a4p.ErrorLog.log('srvFileTransfer', 'File upload retried for ' + filePath + ' ' + idx + '/' + nb +
                            ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                            sendPartFile(params, idx, nb, nbTry);
                        } else {
                            a4p.safeApply(self.rootScope, function() {
                                a4p.ErrorLog.log('srvFileTransfer', 'File upload failure for ' + filePath + ' ' + idx + '/' + nb +
                                ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1));
                                deferred.reject({data:'File upload failure for ' + filePath +
                                ' : (status=' + response.status + ') response=' + a4pDumpData(response.data, 1), status:'error'});
                            });
                        }
                    };
                    //self.http(urlData).then(fctOnHttpSuccess, fctOnHttpError);
                    a4p.promiseWakeup(self.rootScope, self.http(urlData), fctOnHttpSuccess, fctOnHttpError);
                };
                var filePartSize = 10000;// Size max of trunk is 10 ko
                if (data.length > filePartSize) {
                    var nb = Math.ceil(data.length / filePartSize);
                    sendPartFile(params, 1, nb, 1);
                } else {
                    sendPartFile(params, 1, 1, 1);
                }
            };
            var onReadFileFailureFct = function (message) {
                var msg = 'File read failure for ' + filePath + ' : ' + message;
                a4p.safeApply(self.rootScope, function() {
                    a4p.ErrorLog.log('srvFileTransfer', msg);
                    deferred.reject({data:msg, status:'error'});
                });
            };
            this.srvFileStorage.readFileAsBinaryString(filePath, onReadFileSuccessFct, onReadFileFailureFct);
        }

        return promise;
    };

    Service.prototype.recvFile = function (filePath, url, timeout) {
        if ((typeof(url) == 'undefined') || (!url)) {
            throw new Error("send requires a url parameter");
        }
        if (typeof(timeout) == 'undefined') timeout = null;// in milliseconds

        var self = this,
            deferred = this.defer.defer(),
            promise = deferred.promise;

        a4p.InternalLog.log('srvFileTransfer', "recvFile " + filePath + " from " + url);

        var treatReject = function(iDeferred,iData,iStatus) {
          a4p.ErrorLog.log('srvFileTransfer', iStatus);
          iDeferred.reject({data:iData, status:iStatus});
        };
        var treatRejectButAlreadyExist = function(iDeferred,iData,iStatus) {
          a4p.InternalLog.log('srvFileTransfer', iStatus);
          //iDeferred.reject({data:iData, status:iStatus});
          iDeferred.resolve({data:'', status:filePath});
        };


        var onFileFailureFct = function (fileError) {
            var msg = 'File download and get failure for ' + filePath + ' : '+ fileError.code;
            a4p.safeApply(self.rootScope, function() {
                treatReject(deferred,msg,'error');
            });
        };

        var onTransferSuccessFct = function (fileEntry) {
            //console.log('success');
            var feUrl = fileEntry.fullPath;
            if (a4p.isDefined(fileEntry.toNativeURL)) feUrl = fileEntry.toNativeURL();
            if (a4p.isDefined(fileEntry.toURL)) feUrl = fileEntry.toURL();
            a4p.InternalLog.log('srvFileTransfer', "File downloading success " + feUrl);

            if (a4p.isDefined(fileEntry.file)) {
                // Verify file and its size
                fileEntry.file(function(fileObj) {
                    var fileSize = fileObj.size;
                    console.log("Size = " + fileObj.size);
                    a4p.safeApply(self.rootScope, function() {
                        deferred.resolve({data:fileSize, status:feUrl});
                    });

                },onFileFailureFct);
            }
            else {
              a4p.safeApply(self.rootScope, function() {
                  deferred.resolve({data:'', status:feUrl});
              });
            }
        };


        if (a4p.isDefinedAndNotNull(FileTransfer)) {

            a4p.InternalLog.log('srvFileTransfer', "recvFile with FileTransfer");

            var onTransferFailureFct = function (fileTransferError) {
                //console.log('error');
                var msg = 'File download failure for ' + filePath + ' : '+
                    transferErrorMessage(fileTransferError) +
                    "(source=" + fileTransferError.source +
                    ", target=" + fileTransferError.target + ")";
                a4p.safeApply(self.rootScope, function() {
                    treatReject(deferred,msg,'error');
                });
            };
            var onCreateDirSuccessFct = function (fileEntry) {
                var ft = new FileTransfer();
                // TODO use self.srvConfig.trustAllHosts
                var trustAllHosts = true;
                var feUrl = fileEntry.fullPath;
                //console.log("feUrl fullPath : "+feUrl);
                if (a4p.isDefined(fileEntry.toURL)) feUrl = fileEntry.toURL();
                console.log("feUrl toURL : "+feUrl);
                //if (a4p.isDefined(fileEntry.toNativeURL)) feUrl = fileEntry.toNativeURL();
                //console.log("feUrl toNativeURL : "+feUrl);

                // Get Object syncro
                //a4p.InternalLog.log('srvFileTransfer', "Get Object syncro "+params.fileUid);
                var objectReceived = null;//this.srvData.getObject(params.fileUid);

                ft.onprogress = function(progressEvent) {
                    //a4p.InternalLog.log('srvFileTransfer', "Loading ("+url+")");
                    if (progressEvent.lengthComputable) {
                        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                        //a4p.InternalLog.log('srvFileTransfer', ""+perc + "% of "+progressEvent.total);
                        //if (objectReceived && objectReceived.c4p_synchro) objectReceived.c4p_synchro.cloudProgress = perc;
                    }
                    if (progressEvent.loaded == progressEvent.total) {
                        a4p.InternalLog.log('srvFileTransfer', "done !");
                        onTransferSuccessFct(fileEntry);
                    }
                };

                var downloadFile = function() {
                        //var srcUri = "https://upload.wikimedia.org/wikipedia/commons/d/d9/Test.png";
                        //var srcUri = "https://apps4pro.net/s2/c4p_downloadFileTest.php";
                        var srcUri = url;//encodeURI(url);//encodeURIComponent(url);
                        a4p.InternalLog.log('srvFileTransfer', "File downloading from " + srcUri + " to " + feUrl);
                        //ft.download(srcUri, feUrl, onTransferSuccessFct, onTransferFailureFct, trustAllHosts);
                        ft.download(srcUri, feUrl,
                          function(){a4p.ErrorLog.log('srvFileTransfer', 'Download suppose to do not work, use onprogress instead ?');},
                          onTransferFailureFct,trustAllHosts);
                };

                downloadFile();
            };
            var onCreateDirFailureFct = function (message) {
                var msg = 'File directory creation failure for ' + filePath + ' : ' + message;
                a4p.safeApply(self.rootScope, function() {
                    treatReject(deferred,msg,'error');
                });
            };


            // Check existence .. need refresh ?
            this.checkFileExistLocally(filePath).then(function(){

              treatReject = treatRejectButAlreadyExist;
              self.srvFileStorage.getOrNewFile(filePath, onCreateDirSuccessFct, onCreateDirFailureFct);
            },function(){
              self.srvFileStorage.getOrNewFile(filePath, onCreateDirSuccessFct, onCreateDirFailureFct);
            });

        } else {
            var fctOnWriteError = function (message) {
                var msg = 'File write failure for ' + filePath + ' : ' + message;
                a4p.safeApply(self.rootScope, function() {
                    treatReject(deferred,msg,'error');
                });
            };
            var fctOnHttpSuccess = function (response) {
                //response.data, response.status, response.headers
                // response.data is an ArrayBuffer because we use srvConfig.responseType == "arraybuffer"
                var msg = 'File download success for ' + filePath + ' : length=' + ((!response.data) ? 0 : response.data.byteLength);
                a4p.InternalLog.log('srvFileTransfer', msg);
                var contentType = response.headers('Content-type');
                if (contentType) contentType = contentType.split(";")[0];
                contentType = contentType || 'text/plain';
                ////a4p.InternalLog.log('File http get success for ' + url + ' : status = ' + response.status + ', contentType = ' + contentType);
                var blob = new Blob([((!response.data) ? '' : response.data)], {type:contentType, endings:"transparent"});
                // FIXME : filesystem is not accessible via a web link from Chrome client
                // FIXME , cannot use a dataURL (Browser limits are often at 65000 chars) because srvLocalStorage explodes when srvData saves

                /*
                var utf8Input = a4p.Utf8.encodeToUint8Array(response.data);
                var b64Input = a4p.Base64.encodeFromUint8Array(utf8Input);
                var b64 = encodeURIComponent(b64Input);// Not working for big strings
                var dataUrl = 'data:' + c4p.Model.fileFirstMimetype(filePath) + ';base64,' + b64;
                onWriteSuccessFct = function (fileEntry) {
                    a4p.safeApply(self.rootScope, function() {
                        deferred.resolve({data:'', status:dataUrl});
                    });
                };
                */

                self.srvFileStorage.writeFile(blob, filePath, onTransferSuccessFct, fctOnWriteError);
            };
            var fctOnHttpError = function (response) {
                //response.data, response.status, response.headers
                var msg = 'File download failure for ' + filePath + ' : ' +
                'response=' + ((!response.data) ? '' : response.data) + " (status=" + response.status + ")";
                a4p.safeApply(self.rootScope, function() {
                    treatReject(deferred,msg,'error');
                });
            };
            var urlData = {
                method:'GET',
                url:url,
                transformResponse: angular.identity,
                responseType: "arraybuffer"
            };
            if (!timeout) urlData.timeout = timeout;


            // Check existence .. need refresh ?
            this.checkFileExistLocally(filePath).then(function(){

              treatReject = treatRejectButAlreadyExist;
              a4p.InternalLog.log('srvFileTransfer', "File downloading from ... " + url + " to " + filePath);
              //this.http(urlData).then(fctOnHttpSuccess, fctOnHttpError);
              a4p.promiseWakeup(self.rootScope, self.http(urlData), fctOnHttpSuccess, fctOnHttpError);
            },function(){
              a4p.InternalLog.log('srvFileTransfer', "File downloading from ... " + url + " to " + filePath);
              //this.http(urlData).then(fctOnHttpSuccess, fctOnHttpError);
              a4p.promiseWakeup(self.rootScope, self.http(urlData), fctOnHttpSuccess, fctOnHttpError);
            });
        }

        return promise;
    };



    Service.prototype.checkFileExistLocally = function (filePath) {
        if ((typeof(filePath) == 'undefined') || (!filePath)) {
            throw new Error("send requires a filePath parameter");
        }

          var self = this, deferred = this.defer.defer(),   promise = deferred.promise;

          var successFct = function() {
            a4p.safeApply(self.rootScope, function() {
                deferred.resolve({data:'checkFileExistLocally ok', status:'exist'});
            });
          };

          var errorFct = function() {
            a4p.safeApply(self.rootScope, function() {
                deferred.reject({data:'checkFileExistLocally fail', status:'not exist'});
            });
          };

          // File already exist ? or need refresh ?
          this.srvFileStorage.getFileFromUrl(filePath,successFct,errorFct);

          return promise;
    };

    function transferErrorMessage(fileTransferError) {
        var msg = '';
        switch (fileTransferError.code) {
            case FileTransferError.FILE_NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileTransferError.CONNECTION_ERR:
                msg = 'Connection error';
                break;
            case FileTransferError.INVALID_URL_ERR:
                msg = 'Invalid URL error';
                break;
            default:
                msg = 'Unknown FileTransferError code (code= ' + fileTransferError.code + ', type=' + typeof(fileTransferError) + ')';
                break;
        }
        return msg;
    }

    return Service;
})();
