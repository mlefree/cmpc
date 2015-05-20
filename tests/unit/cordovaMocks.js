'use strict';

// Cordova mocking

var MockLocalFileSystem = (function() {
    function Service() {
    }
    Service.TEMPORARY = 0;
    Service.PERSISTENT = 1;
    return Service;
})();

var MockMetadata = (function() {
    function Service(time) {
        this.modificationTime = (typeof time != 'undefined' ? new Date(time) : null);
    }
    return Service;
})();

var MockFileError = (function() {
    function Service(error) {
        this.code = error || null;
    }
    // Found in DOMException
    Service.NOT_FOUND_ERR = 1;
    Service.SECURITY_ERR = 2;
    Service.ABORT_ERR = 3;
    // Added by File API specification
    Service.NOT_READABLE_ERR = 4;
    Service.ENCODING_ERR = 5;
    Service.NO_MODIFICATION_ALLOWED_ERR = 6;
    Service.INVALID_STATE_ERR = 7;
    Service.SYNTAX_ERR = 8;
    Service.INVALID_MODIFICATION_ERR = 9;
    Service.QUOTA_EXCEEDED_ERR = 10;
    Service.TYPE_MISMATCH_ERR = 11;
    Service.PATH_EXISTS_ERR = 12;
    return Service;
})();

var MockProgressEvent = (function() {
    /*function Service(result) {
        this.lengthComputable = result.lengthComputable;
        this.loaded = result.loaded;
        this.total = result.total;
    }*/
    function Service(type, dict) {
        this.type = type;
        this.bubbles = false;
        this.cancelBubble = false;
        this.cancelable = false;
        this.lengthComputable = false;
        this.loaded = dict && dict.loaded ? dict.loaded : 0;
        this.total = dict && dict.total ? dict.total : 0;
        this.target = dict && dict.target ? dict.target : null;
    }
    return Service;
})();

var MockFile = (function() {
    function Service(name, fullPath, type, lastModifiedDate, size) {
        this.name = name || '';
        this.fullPath = fullPath || null;
        this.type = type || null;
        this.lastModifiedDate = lastModifiedDate || null;
        this.size = size || 0;
    }
    return Service;
})();

var MockDirectoryEntry = (function() {
    function Service(name, fullPath) {
        this.isFile = false;
        this.isDirectory = true;
        this.name = name || '';
        this.fullPath = fullPath || '';
    }
    Service.prototype.createReader = function() {
        return new MockDirectoryReader(this.fullPath);
    };
    Service.prototype.getDirectory = function (path, options, onSuccess, onError) {
        onSuccess(new Service(this.name, this.fullPath));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.removeRecursively = function (onSuccess, onError) {
        onSuccess();
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.getFile = function (path, options, onSuccess, onError) {
        onSuccess(new MockFileEntry(this.name, this.fullPath));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.getMetadata = function (onSuccess, onError) {
        onSuccess(new MockMetadata());
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.moveTo = function (parent, newName, onSuccess, onError) {
        if (!parent) {
            onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
            return;
        }
        newName = newName || this.name;
        console.log('MockDirectoryEntry.moveTo : ' + parent.fullPath + '/' + newName);
        onSuccess(new Service(newName, parent.fullPath + '/' + newName));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.copyTo = function (parent, newName, onSuccess, onError) {
        if (!parent) {
            onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
            return;
        }
        newName = newName || this.name;
        console.log('MockDirectoryEntry.copyTo : ' + parent.fullPath + '/' + newName);
        onSuccess(new Service(newName, parent.fullPath + '/' + newName));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.toURL = function () {
        return this.fullPath;
        //return 'filesystem:http://localhost/persistent' + this.fullPath;
    };
    Service.prototype.toURI = function () {// deprecated
        return this.fullPath;
    };
    Service.prototype.remove = function (onSuccess, onError) {
        onSuccess();
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.getParent = function (onSuccess, onError) {
        onSuccess(new Service(this.name, this.fullPath));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    return Service;
})();

var MockDirectoryReader = (function() {
    function Service(fullPath) {
    }
    Service.prototype.readEntries = function (onSuccess, onError) {
        var retVal = [];
        /*for (var i=0; i<10; i++) {
            retVal.push(new MockFileEntry(this.name, this.fullPath));
            retVal.push(new MockDirectoryEntry(this.name, this.fullPath));
        }*/
        onSuccess(retVal);
        //onError(new MockFileError(code));
    };
    return Service;
})();

var MockFileWriter = (function() {
    function Service(file) {
        this.fileName = "";
        this.length = 0;
        if (file) {
            this.fileName = file.fullPath || file;
            this.length = file.size || 0;
        }
        this.position = 0;
        this.readyState = 0; // EMPTY
        this.result = null;
        this.error = null;
        this.onwritestart = null;   // When writing starts
        this.onprogress = null;     // While writing the file, and reporting partial file data
        this.onwrite = null;        // When the write has successfully completed.
        this.onwriteend = null;     // When the request has completed (either in success or failure).
        this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
        this.onerror = null;        // When the write has failed (see errors).
    }
    Service.INIT = 0;
    Service.WRITING = 1;
    Service.DONE = 2;
    Service.prototype.seek = function (offset) {
        if (this.readyState === Service.WRITING) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        if (!offset && offset !== 0) {
            return;
        }
        if (offset < 0) {
            this.position = Math.max(offset + this.length, 0);
        }
        else if (offset > this.length) {
            this.position = this.length;
        }
        else {
            this.position = offset;
        }
    };
    Service.prototype.abort = function () {
        if (this.readyState === Service.DONE || this.readyState === Service.INIT) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        this.error = new MockFileError(MockFileError.ABORT_ERR);
        this.readyState = Service.DONE;
        if (typeof this.onabort === "function") {
            this.onabort(new MockProgressEvent("abort", {"target":this}));
        }
        if (typeof this.onwriteend === "function") {
            this.onwriteend(new MockProgressEvent("writeend", {"target":this}));
        }
    };
    Service.prototype.write = function (text) {
        if (this.readyState === Service.WRITING) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        this.readyState = Service.WRITING;
        if (typeof this.onwritestart === "function") {
            this.onwritestart(new MockProgressEvent("writestart", {"target":this}));
        }

        if (true) {// success
            if (this.readyState === Service.DONE) {
                return;
            }
            this.position += 10;// nb bytes read
            this.length = this.position;
            this.readyState = Service.DONE;
            if (typeof this.onwrite === "function") {
                this.onwrite(new MockProgressEvent("write", {target:this}));
            }
            if (typeof this.onwriteend === "function") {
                this.onwriteend(new MockProgressEvent("writeend", {target:this}));
            }
        } else {// failure
            if (this.readyState === Service.DONE) {
                return;
            }
            this.readyState = Service.DONE;
            this.error = new MockFileError(MockFileError.NOT_FOUND_ERR);
            if (typeof this.onerror === "function") {
                this.onerror(new MockProgressEvent("error", {target:this}));
            }
            if (typeof this.onwriteend === "function") {
                this.onwriteend(new MockProgressEvent("writeend", {target:this}));
            }
        }
    };
    Service.prototype.truncate = function (size) {
        if (this.readyState === Service.WRITING) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        this.readyState = Service.WRITING;
        if (typeof this.onwritestart === "function") {
            this.onwritestart(new MockProgressEvent("writestart", {"target":this}));
        }
        if (true) {// success
            if (this.readyState === Service.DONE) {
                return;
            }
            this.length = 10;// size of file
            this.position = Math.min(this.position, 10);
            this.readyState = Service.DONE;
            if (typeof this.onwrite === "function") {
                this.onwrite(new MockProgressEvent("write", {target:this}));
            }
            if (typeof this.onwriteend === "function") {
                this.onwriteend(new MockProgressEvent("writeend", {target:this}));
            }
        } else {// failure
            if (this.readyState === Service.DONE) {
                return;
            }
            this.readyState = Service.DONE;
            this.error = new MockFileError(MockFileError.NOT_FOUND_ERR);
            if (typeof this.onerror === "function") {
                this.onerror(new MockProgressEvent("error", {target:this}));
            }
            if (typeof this.onwriteend === "function") {
                this.onwriteend(new MockProgressEvent("writeend", {target:this}));
            }
        }
    };
    return Service;
})();

var MockFileEntry = (function() {
    function Service(name, fullPath) {
        this.isFile = true;
        this.isDirectory = false;
        this.name = name || '';
        this.fullPath = fullPath || '';
    }
    Service.prototype.file = function (onSuccess, onError) {
        onSuccess(new MockFile(this.name, this.fullPath));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.createWriter = function(onSuccess, onError) {
        this.file(function(filePointer) {
            var writer = new MockFileWriter(filePointer);
            if (writer.fileName === null || writer.fileName === "") {
                onError(new MockFileError(MockFileError.INVALID_STATE_ERR));
            } else {
                onSuccess(writer);
            }
        }, onError);
    };
    Service.prototype.getMetadata = function (onSuccess, onError) {
        onSuccess(new MockMetadata());
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.moveTo = function (parent, newName, onSuccess, onError) {
        if (!parent) {
            onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
            return;
        }
        newName = newName || this.name;
        console.log('MockFileEntry.moveTo : ' + parent.fullPath + '/' + newName);
        onSuccess(new Service(newName, parent.fullPath + '/' + newName));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.copyTo = function (parent, newName, onSuccess, onError) {
        if (!parent) {
            onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
            return;
        }
        newName = newName || this.name;
        console.log('MockFileEntry.copyTo : ' + parent.fullPath + '/' + newName);
        onSuccess(new Service(newName, parent.fullPath + '/' + newName));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.toURL = function () {
        return this.fullPath;
        //return 'filesystem:http://localhost/persistent' + this.fullPath;
    };
    Service.prototype.toURI = function () {// deprecated
        return this.fullPath;
    };
    Service.prototype.remove = function (onSuccess, onError) {
        onSuccess();
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
    Service.prototype.getParent = function (onSuccess, onError) {
        onSuccess(new MockDirectoryEntry(this.name, this.fullPath));
        //onError(new MockFileError(MockFileError.NOT_FOUND_ERR));
    };
})();

var MockFileSystem = (function() {
    function Service(name, root) {
        this.name = name || null;
        if (root) {
            this.root = new MockDirectoryEntry(root.name, root.fullPath);
        }
    }
    return Service;
})();

var MockFileReader = (function() {
    function Service() {
        this.fileName = "";
        this.readyState = 0;// EMPTY, LOADING, DONE
        this.result = null;
        this.error = null;
        this.onloadstart = null;
        this.onprogress = null;
        this.onload = null;
        this.onabort = null;
        this.onerror = null;
        this.onloadend = null;
    }
    Service.prototype.abort = function () {
        this.result = null;
        if (this.readyState == Service.DONE || this.readyState == Service.EMPTY) {
          return;
        }
        this.readyState = Service.DONE;
        if (typeof this.onabort === 'function') {
            this.onabort(new MockProgressEvent('abort', {target:this}));
        }
        if (typeof this.onloadend === 'function') {
            this.onloadend(new MockProgressEvent('loadend', {target:this}));
        }
    };
    Service.prototype.readAsDataURL = function (file) {
        this.fileName = '';
        if (typeof file.fullPath === 'undefined') {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == Service.LOADING) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        this.readyState = Service.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new MockProgressEvent("loadstart", {target:this}));
        }
        if (true) {// success
            if (this.readyState === Service.DONE) {
                return;
            }
            this.readyState = Service.DONE;
            this.result = '';// file content
            if (typeof this.onload === "function") {
                this.onload(new MockProgressEvent("load", {target:this}));
            }
            if (typeof this.onloadend === "function") {
                this.onloadend(new MockProgressEvent("loadend", {target:this}));
            }
        } else {// failure
            if (this.readyState === Service.DONE) {
                return;
            }
            this.readyState = Service.DONE;
            this.result = null;
            this.error = new MockFileError(MockFileError.NOT_FOUND_ERR);
            if (typeof this.onerror === "function") {
                this.onerror(new MockProgressEvent("error", {target:this}));
            }
            if (typeof this.onloadend === "function") {
                this.onloadend(new MockProgressEvent("loadend", {target:this}));
            }
        }
    };
    Service.prototype.readAsText = function (file, encoding) {
        this.fileName = '';
        if (typeof file.fullPath === 'undefined') {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == Service.LOADING) {
            throw new MockFileError(MockFileError.INVALID_STATE_ERR);
        }
        this.readyState = Service.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new MockProgressEvent("loadstart", {target:this}));
        }
        var enc = encoding || "UTF-8";
        if (true) {// success
            if (this.readyState === Service.DONE) {
                return;
            }
            this.result = '';// file content
            if (typeof this.onload === "function") {
                this.onload(new MockProgressEvent("load", {target:this}));
            }
            this.readyState = Service.DONE;
            if (typeof this.onloadend === "function") {
                this.onloadend(new MockProgressEvent("loadend", {target:this}));
            }
        } else {// failure
            if (this.readyState === Service.DONE) {
                return;
            }
            this.readyState = Service.DONE;
            this.result = null;
            this.error = new MockFileError(MockFileError.NOT_FOUND_ERR);// File error
            if (typeof this.onerror === "function") {
                this.onerror(new MockProgressEvent("error", {target:this}));
            }
            if (typeof this.onloadend === "function") {
                this.onloadend(new MockProgressEvent("loadend", {target:this}));
            }
        }
    };
    Service.EMPTY = 0;
    Service.LOADING = 1;
    Service.DONE = 2;
    return Service;
})();

var MockFileTransferError = (function() {
    function Service(code, source, target, status) {
        this.code = code || null;
        this.source = source || null;
        this.target = target || null;
        this.http_status = status || null;
    }
    Service.FILE_NOT_FOUND_ERR = 1;
    Service.INVALID_URL_ERR = 2;
    Service.CONNECTION_ERR = 3;
    Service.ABORT_ERR = 4;
    return Service;
})();

var MockFileUploadOptions = (function() {
    function Service(fileKey, fileName, mimeType, params, headers) {
        this.fileKey = fileKey || null;
        this.fileName = fileName || null;
        this.mimeType = mimeType || null;
        this.params = params || null;
        this.headers = headers || null;
    }
    return Service;
})();

var MockFileUploadResult = (function() {
    function Service(bytesSent, responseCode, response) {
        this.bytesSent = bytesSent || 0;
        this.responseCode = responseCode || null;
        this.response = response || null;
    }
    return Service;
})();

var idCounter = 0;
var MockFileTransfer = (function() {
    function Service() {
        this._id = ++idCounter;
        this.onprogress = null; // optional callback
    }
    Service.prototype.abort = function (onSuccess, onError) {
        onSuccess();
        //onError(new MockFileTransferError(e.code, e.source, e.target, e.http_status));
    };
    Service.prototype.upload = function (filePath, server, onSuccess, onError, options, trustAllHosts) {
        if (!filePath || !server) {
            throw new Error("FileTransfer.upload requires filePath and server URL parameters at the minimum.");
        }
        // check for options
        var fileKey = null;
        var fileName = null;
        var mimeType = null;
        var params = null;
        var chunkedMode = true;
        var headers = null;
        if (options) {
            fileKey = options.fileKey;
            fileName = options.fileName;
            mimeType = options.mimeType;
            headers = options.headers;
            if (options.chunkedMode !== null || typeof options.chunkedMode != "undefined") {
                chunkedMode = options.chunkedMode;
            }
            if (options.params) {
                params = options.params;
            }
            else {
                params = {};
            }
        }
        onSuccess(new MockFileUploadResult(10, 200, 'OK'));
        //onError(new MockFileTransferError(e.code, e.source, e.target, e.http_status));
    };
    Service.prototype.download = function (source, target, onSuccess, onError, trustAllHosts) {
        if (!source || !target) {
            throw new Error("FileTransfer.download requires source URI and target URI parameters at the minimum.");
        }
        onSuccess(new MockFileEntry('name', 'fullPath'));
        //onError(new MockFileTransferError(e.code, e.source, e.target, e.http_status));
    };
    return Service;
})();

var MockCamera = {DestinationType:{DATA_URL:0, FILE_URI:1}, EncodingType:{JPEG:0, PNG:1}};
