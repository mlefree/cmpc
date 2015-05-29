

function objectListDiff(name1, list1, name2, list2) {
  'use strict';
    var diffs = '';
    for (var idx1 = 0, nb1 = list1.length; idx1 < nb1; idx1++) {
        if (!getSubKeyFromList(list2, 'id', 'dbid', list1[idx1].id.dbid)) {
            diffs += list1[idx1].id.dbid + ' in ' + name1 + ' but not in ' + name2 + '.\n';
        }
    }
    for (var idx2 = 0, nb2 = list2.length; idx2 < nb2; idx2++) {
        if (!getSubKeyFromList(list1, 'id', 'dbid', list2[idx2].id.dbid)) {
            diffs += list2[idx2].id.dbid + ' in ' + name2 + ' but not in ' + name1 + '.\n';
        }
    }
    return diffs;
}

/**
 * Check that all relations not listed are empty and all relations listed are exact.
 *
 * @param srvData
 * @param object
 * @param checkList
 */
function checkLinks(srvData, object, checkList) {
  'use strict';
    var fromDesc;
    var fromFieldIdx;
    var toType;
    var listName;
    var linkList = [];
    // Via ONE link side
    fromDesc = c4p.Model.a4p_types[object.a4p_type];
    for (fromFieldIdx = 0; fromFieldIdx < fromDesc.linkFields.length; fromFieldIdx++) {
        addValueToList(linkList, fromDesc.linkFields[fromFieldIdx].one);
    }
    // Via MANY link side
    for (var fromTypeIdx = 0; fromTypeIdx < c4p.Model.allTypes.length; fromTypeIdx++) {
        fromDesc = c4p.Model.a4p_types[c4p.Model.allTypes[fromTypeIdx]];
        for (fromFieldIdx = 0; fromFieldIdx < fromDesc.linkFields.length; fromFieldIdx++) {
            addValueToList(linkList, fromDesc.linkFields[fromFieldIdx].many);
        }
    }
    for (var linkIdx = 0; linkIdx < linkList.length; linkIdx++) {
        var linkName = linkList[linkIdx];
        // Direct links
        listName = 'direct-' + linkName;
        if (checkList[listName]) {
            expect(objectListDiff(listName, srvData.getDirectLinks(object, linkName),
                'checkList', checkList[listName])).toBe('');
        } else {
            // Must be empty
            expect(objectListDiff(listName, srvData.getDirectLinks(object, linkName),
                'checkList', [])).toBe('');
        }
        // Remote links
        listName = 'remote-' + linkName;
        if (checkList[listName]) {
            expect(objectListDiff(listName, srvData.getRemoteLinks(object, linkName),
                'checkList', checkList[listName])).toBe('');
        } else {
            // Must be empty
            expect(objectListDiff(listName, srvData.getRemoteLinks(object, linkName),
                'checkList', [])).toBe('');
        }
        for (var toTypeIdx = 0; toTypeIdx < c4p.Model.allTypes.length; toTypeIdx++) {
            toType = c4p.Model.allTypes[toTypeIdx];
            // Direct typed links
            listName = 'direct-' + linkName + '-' + toType;
            if (checkList[listName]) {
                expect(objectListDiff(listName, srvData.getTypedDirectLinks(object, linkName, toType),
                    'checkList', checkList[listName])).toBe('');
            } else {
                // Must be empty
                expect(objectListDiff(listName, srvData.getTypedDirectLinks(object, linkName, toType),
                    'checkList', [])).toBe('');
            }
            // Remote typed links
            listName = 'remote-' + linkName + '-' + toType;
            if (checkList[listName]) {
                expect(objectListDiff(listName, srvData.getTypedRemoteLinks(object, linkName, toType),
                    'checkList', checkList[listName])).toBe('');
            } else {
                // Must be empty
                expect(objectListDiff(listName, srvData.getTypedRemoteLinks(object, linkName, toType),
                    'checkList', [])).toBe('');
            }
        }
    }
}

function checkObject(object, expected) {
  'use strict';

    for (var key in expected) {
        if (!expected.hasOwnProperty(key)) continue;
        if (expected[key] == undefined) {
            expect(object[key]).toBeUndefined();
        } else if (typeof(expected[key]) == 'object') {
            expect(object[key]).not.toBeUndefined();
            if (a4p.isTrueOrNonEmpty(expected[key])) {
                checkObject(object[key], expected[key]);
            }
        } else {
            expect(object[key]).toBe(expected[key]);
        }
    }
}






describe('SrvData', function () {
    'use strict';

    var srvSynchro, deferService, exceptionHandlerService,
        srvRunning, srvConfig, srvLog, srvSecurity, srvLocale,
        srvLocalStorage, srvAnalytics, srvDataTransfer, srvFileTransfer, srvFileStorage,
        srvData;
    var ok = false;
    var data = null;
    var error = null;
    var done = false;
    var documentUrl;

    //beforeEach(module(''c4p.services''));

    beforeEach(function () {
        module('c4p.services');
        module(function ($provide) {
            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
            srvLocalStorage = new LocalStorage();
            $provide.provider('srvLocalStorage', function () {
                this.$get = function () {
                    return srvLocalStorage;
                };
            });
            srvAnalytics = new MockAnalytics(srvLocalStorage);
            $provide.provider('srvAnalytics', function () {
                this.$get = function () {
                    return srvAnalytics;
                };
            });
        });
    });

    beforeEach(inject(function ($injector, $rootScope) {

        deferService = $injector.get('$q');
        exceptionHandlerService = $injector.get('$exceptionHandler');
        srvFileStorage = $injector.get('srvFileStorage');
        srvRunning = new SrvRunning(exceptionHandlerService); //$injector.get('srvRunning');
        srvConfig = new MockConfig(srvAnalytics); //$injector.get('srvConfig');
        srvLog = new MockLog(); //$injector.get('srvLog');
        srvSecurity = new MockSecurity(); //$injector.get('srvSecurity');
        srvLocale = new MockLocale(); //$injector.get('srvLocale');
        srvDataTransfer = new MockDataTransfer(deferService, $rootScope); //$injector.get('srvDataTransfer');
        srvFileTransfer = new MockSrvFileTransfer(deferService, $rootScope); //$injector.get('srvFileTransfer');
        srvSynchro = new SrvSynchro(deferService, srvDataTransfer, srvFileTransfer,
            exceptionHandlerService, srvRunning, srvLocalStorage, srvSecurity);
        srvData = new SrvData(exceptionHandlerService, deferService, srvLocalStorage, srvConfig, srvLog,
            srvLocale, srvSecurity, srvDataTransfer, srvRunning, srvSynchro, srvFileStorage, $rootScope);

        srvConfig.setPossibleCrms(["c4p", "sf"]);
        srvConfig.setActiveCrms(["c4p", "sf"]);
        srvConfig.setConfig({
            "exposeBetaFunctionalities": false
        });

        runs(function () {
            // Init srvFileStorage
            ok = false;
            done = false;
            error = null;
            srvFileStorage.init().then(function () {
                ok = true;
                done = true;
            }, function (message) {
                error = message;
                done = true;
            });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {
            return done;
        }, "srvFileStorage should be initialized", 10000);

        runs(function () {
            // 16x16 pixels image created with gimp
            //MLE //FIXME pb data ? var jpegData = "\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xfe\x00\x13\x43\x72\x65\x61\x74\x65\x64\x20\x77\x69\x74\x68\x20\x47\x49\x4d\x50\xff\xdb\x00\x43\x00\x10\x0b\x0c\x0e\x0c\x0a\x10\x0e\x0d\x0e\x12\x11\x10\x13\x18\x28\x1a\x18\x16\x16\x18\x31\x23\x25\x1d\x28\x3a\x33\x3d\x3c\x39\x33\x38\x37\x40\x48\x5c\x4e\x40\x44\x57\x45\x37\x38\x50\x6d\x51\x57\x5f\x62\x67\x68\x67\x3e\x4d\x71\x79\x70\x64\x78\x5c\x65\x67\x63\xff\xdb\x00\x43\x01\x11\x12\x12\x18\x15\x18\x2f\x1a\x1a\x2f\x63\x42\x38\x42\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\xff\xc2\x00\x11\x08\x00\x10\x00\x10\x03\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x16\x00\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x05\xff\xc4\x00\x14\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x10\x03\x10\x00\x00\x01\xd8\x00\xa7\xff\xc4\x00\x17\x10\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x01\x41\xff\xda\x00\x08\x01\x01\x00\x01\x05\x02\x8e\x36\xbf\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x01\x1f\xff\xc4\x00\x15\x10\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\x21\xff\xda\x00\x08\x01\x01\x00\x06\x3f\x02\xa3\xff\xc4\x00\x1b\x10\x00\x02\x02\x03\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x41\x51\x71\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x21\xb3\x24\xae\x1a\x6b\x6f\x73\x1a\x39\xe4\x31\xea\x7f\xff\xda\x00\x0c\x03\x01\x00\x02\x00\x03\x00\x00\x00\x10\x82\x4f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x10\x1f\xff\xc4\x00\x19\x10\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x61\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x10\x0a\xc0\x10\x47\xee\x90\x1e\x49\xd7\x97\x71\xd5\x63\x65\x61\x60\x31\x39\x1d\xff\xd9";
            var jpegData = "\xff\xd8\xff\xe0\x00\x10";
            
            var byteArray = new Uint8Array(jpegData.length);
            for (var i = 0; i < jpegData.length; i++) {
                byteArray[i] = jpegData.charCodeAt(i) & 0xff;
            }

            ok = false;
            done = false;
            error = null;
            srvFileStorage.writeFile(
                new Blob([byteArray], {type: 'image/jpeg', endings: "transparent"}),
                '/a4p/c4p/doc/sf/Document-002.jpeg',
                function (fileEntry) {
                    documentUrl = fileEntry.toURL();
                    ok = true;
                    done = true;
                }, function (message) {
                    error = message;
                    done = true;
                });
            if (!$rootScope.$$phase) $rootScope.$apply();// propagate promise resolution
        });

        // latch function polls until it returns true or 10s timeout expires
        waitsFor(function () {
            return done;
        }, "a4p/c4p/doc/sf/Document-002.jpeg should be written", 10000);

        runs(function () {
            expect(ok).toBe(true);
            expect(error).toBeNull();

            // Init srvSynchro
            srvSynchro.init();

            expect(srvData.initDone).toBe(false);

            // Force a reset of dbid generation
            a4p.uid = ['0', '0', '0'];

            // Init srvData
            srvData.init();

            expect(srvData.isDemo).toBe(false);
            expect(srvData.userId.sf_id).toBe('005i0000000I8c5AAC');
            var i, type;
            for (i = 0; i < c4p.Model.allTypes.length; i++) {
                type = c4p.Model.allTypes[i];
                expect(srvData.currentItems[type].length).toBe(0);
                expect(srvData.originalItems[type].length).toBe(0);
            }
            expect(srvData.nbObjects).toBe(0);
            expect(srvData.objectsToSave.length).toBe(0);
            expect(srvData.objectsToDownload.length).toBe(0);
            expect(srvData.initDone).toBe(true);
        });

    }));

    afterEach(function () {
        expect(srvDataTransfer.pendingSends.length).toBe(0);
        expect(srvDataTransfer.pendingRecvs.length).toBe(0);
        expect(srvFileTransfer.pendingSends.length).toBe(0);
        expect(srvFileTransfer.pendingRecvs.length).toBe(0);
    });

    describe('Creating the Owner', function () {

        it('should create its first Contact', function () {

            expect(srvData.getObject('Contact-001')).toBeUndefined();

            var owner = srvData.createObject('Contact', {
                id: {
                    sf_id: srvData.userId.sf_id
                },
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'Erlwan'
            });
            checkObject(owner, {
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'Erlwan',
                a4p_type: 'Contact',
                contact_type: 'Contact',
                id: {
                    dbid: 'Contact-001',
                    sf_id: srvData.userId.sf_id,
                    c4p_id: undefined
                },
                created_by_id: {
                    id: undefined
                },
                last_modified_by_id: {
                    id: undefined
                },
                created_date: {},// {} will check defined without checking value
                last_modified_date: {}// {} will check defined without checking value
            });

            srvData.addObject(owner, true);

            expect(owner.id.dbid).toBe('Contact-001');
            expect(owner.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
            expect(owner.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
            expect(owner.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
            expect(owner.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
            expect(owner.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
            expect(srvData.index.db['Contact-001']).not.toBeUndefined();
            expect(srvData.index.sf[srvData.userId.sf_id]).not.toBeUndefined();
            expect(srvData.currentItems['Contact'].length).toBe(1);
            expect(srvData.nbObjects).toBe(1);

            owner = srvData.getObject('Contact-001');
            expect(owner).not.toBeUndefined();

            var ownerCheckList = {
            };
            checkLinks(srvData, owner, ownerCheckList);
        });

    });

    describe('With Owner created', function () {

        var owner = null;

        beforeEach(function () {

            owner = srvData.createObject('Contact', {
                id: {
                    sf_id: srvData.userId.sf_id
                },
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'Erlwan'
            });
            checkObject(owner, {
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'Erlwan',
                a4p_type: 'Contact',
                contact_type: 'Contact',
                id: {
                    dbid: 'Contact-001',
                    sf_id: srvData.userId.sf_id,
                    c4p_id: undefined
                },
                created_by_id: {
                    id: undefined
                },
                last_modified_by_id: {
                    id: undefined
                },
                created_date: {},// {} will check defined without checking value
                last_modified_date: {}// {} will check defined without checking value
            });

            srvData.addObject(owner);
            expect(owner.id.dbid).toBe('Contact-001');

        });

        describe('Creating, updating and deleting some objects', function () {

            it('should create some objects and have right links between them', function() {

                var contact1 = owner;
                var ownerCheckList = {};
                checkLinks(srvData, owner, ownerCheckList);

                var contact2 = srvData.createObject('Contact', {
                    salutation: 'Ms.',
                    first_name: 'Anna',
                    last_name: 'Santa'
                });
                checkObject(contact2, {
                    salutation: 'Ms.',
                    first_name: 'Anna',
                    last_name: 'Santa',
                    a4p_type: 'Contact',
                    contact_type: 'Contact',
                    id: {
                        dbid: 'Contact-002',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(contact2);
                var contact2CheckList = {};
                checkLinks(srvData, contact2, contact2CheckList);

                var account1 = srvData.createObject('Account', {
                    company_name: 'World company'
                });
                checkObject(account1, {
                    company_name: 'World company',
                    a4p_type: 'Account',
                    annual_revenue: 0,
                    nb_employees: 0,
                    id: {
                        dbid: 'Account-003',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(account1);
                var account1CheckList = {};
                checkLinks(srvData, account1, account1CheckList);

                var now = new Date();
                var dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
                var dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2, 0, 0, 0);
                var event1 = srvData.createObject('Event', {
                    name: 'Rendez-vous'
                });
                checkObject(event1, {
                    name: 'Rendez-vous',
                    a4p_type: 'Event',
                    date_start: a4pDateFormat(dateFrom),
                    date_end: a4pDateFormat(dateTo),
                    duration_hours: 1,
                    duration_minutes: 0,
                    id: {
                        dbid: 'Event-004',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(event1);
                var event1CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner]
                };
                checkLinks(srvData, event1, event1CheckList);
                ownerCheckList['direct-owned-Event'] = [event1];
                ownerCheckList['remote-owned-Event'] = [event1];
                ownerCheckList['direct-owned'] = [event1];
                ownerCheckList['remote-owned'] = [event1];
                checkLinks(srvData, owner, ownerCheckList);

                now = new Date();
                var dateClosed = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), 0, 0, 0);
                var opportunity1 = srvData.createObject('Opportunity', {
                    name: 'Nouveau client'
                });
                checkObject(opportunity1, {
                    name: 'Nouveau client',
                    a4p_type: 'Opportunity',
                    date_closed: a4pDateFormat(dateClosed),
                    stage: 'Prospecting',
                    amount: 0,
                    probability: 100,
                    id: {
                        dbid: 'Opportunity-005',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(opportunity1);
                var opportunity1CheckList = {};
                checkLinks(srvData, opportunity1, opportunity1CheckList);

                var note1 = srvData.createObject('Note', {
                    //contact_ids:[],
                    //document_ids:[],
                    //ratings:[],
                    title: 'Test note',
                    description: 'Note description',
                    message: 'Note message'
                });
                checkObject(note1, {
                    title: 'Test note',
                    description: 'Note description',
                    message: 'Note message',
                    a4p_type: 'Note',
                    id: {
                        dbid: 'Note-006',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(note1);
                var note1CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner]
                };
                checkLinks(srvData, note1, note1CheckList);
                ownerCheckList['direct-owned-Note'] = [note1];
                ownerCheckList['remote-owned-Note'] = [note1];
                ownerCheckList['direct-owned'].push(note1);
                ownerCheckList['remote-owned'].push(note1);
                checkLinks(srvData, owner, ownerCheckList);

                var report1 = srvData.createObject('Report', {
                    //contact_ids:[],
                    //document_ids:[],
                    //ratings:[],
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message'
                });
                checkObject(report1, {
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message',
                    a4p_type: 'Report',
                    contact_ids: {length: 0},
                    document_ids: {length: 0},
                    ratings: {length: 0},
                    id: {
                        dbid: 'Report-007',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(report1);
                var report1CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner]
                };
                checkLinks(srvData, report1, report1CheckList);
                ownerCheckList['direct-owned-Report'] = [report1];
                ownerCheckList['remote-owned-Report'] = [report1];
                ownerCheckList['direct-owned'].push(report1);
                ownerCheckList['remote-owned'].push(report1);
                checkLinks(srvData, owner, ownerCheckList);

                var contact3 = srvData.createObject('Contact', {
                    salutation: 'Mr',
                    first_name: 'Cyrille',
                    last_name: 'Charron'
                });
                checkObject(contact3, {
                    salutation: 'Mr',
                    first_name: 'Cyrille',
                    last_name: 'Charron',
                    a4p_type: 'Contact',
                    contact_type: 'Contact',
                    id: {
                        dbid: 'Contact-008',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(contact3);
                var contact3CheckList = {};
                checkLinks(srvData, contact3, contact3CheckList);

                var contact4 = srvData.createObject('Contact', {
                    salutation: 'Mr',
                    first_name: 'Eric',
                    last_name: 'Charron'
                });
                checkObject(contact4, {
                    salutation: 'Mr',
                    first_name: 'Eric',
                    last_name: 'Charron',
                    a4p_type: 'Contact',
                    contact_type: 'Contact',
                    id: {
                        dbid: 'Contact-009',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(contact4);
                var contact4CheckList = {};
                checkLinks(srvData, contact4, contact4CheckList);

                var document1 = srvData.createObject('Document', {
                    name: 'test1.jpeg',
                    body:'',
                    length:'0',
                    path:'a4p/c4p/doc/sf',
                    description:'Test picture',
                    uid:'test1',
                    url:documentUrl,
                    fileUrl:documentUrl,
                    src:documentUrl,
                    filePath:'/a4p/c4p/doc/sf/Document-002.jpeg'
                });
                checkObject(document1, {
                    name: 'test1.jpeg',
                    body: '',
                    length: 0,
                    path: 'a4p/c4p/doc/sf',
                    description: 'Test picture',
                    uid: 'test1',
                    url: documentUrl,
                    fileUrl: documentUrl,
                    src: documentUrl,
                    filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                    a4p_type: 'Document',
                    document_type: 'Attachment',
                    extension: 'jpeg',
                    rootname: 'test1',
                    mimetype: 'image/jpeg',
                    id: {
                        dbid: 'Document-00A',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(document1);
                var document1CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner]
                };
                checkLinks(srvData, document1, document1CheckList);
                ownerCheckList['direct-owned-Document'] = [document1];
                ownerCheckList['remote-owned-Document'] = [document1];
                ownerCheckList['direct-owned'].push(document1);
                ownerCheckList['remote-owned'].push(document1);
                checkLinks(srvData, owner, ownerCheckList);

                var document2 = srvData.createObject('Document', {
                    name: 'test2.doc',
                    body:'',
                    length:'0',
                    path:'a4p/c4p/doc/sf',
                    description:'Test doc',
                    uid:'test2',
                    url:documentUrl,
                    fileUrl:documentUrl,
                    src:documentUrl,
                    filePath:'/a4p/c4p/doc/sf/Document-002.jpeg'
                });
                checkObject(document2, {
                    name: 'test2.doc',
                    body: '',
                    length: 0,
                    path: 'a4p/c4p/doc/sf',
                    description: 'Test doc',
                    uid: 'test2',
                    url: documentUrl,
                    fileUrl: documentUrl,
                    src: documentUrl,
                    filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                    a4p_type: 'Document',
                    document_type: 'Attachment',
                    extension: 'doc',
                    rootname: 'test2',
                    mimetype: 'application/msword',
                    id: {
                        dbid: 'Document-00B',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(document2);
                var document2CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner]
                };
                checkLinks(srvData, document2, document2CheckList);
                ownerCheckList['direct-owned-Document'].push(document2);
                ownerCheckList['remote-owned-Document'].push(document2);
                ownerCheckList['direct-owned'].push(document2);
                ownerCheckList['remote-owned'].push(document2);
                checkLinks(srvData, owner, ownerCheckList);

                var report2 = srvData.createObject('Report', {
                    contact_ids: [contact3.id],
                    document_ids: [document1.id],
                    ratings: [],
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message'
                });
                checkObject(report2, {
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message',
                    a4p_type: 'Report',
                    id: {
                        dbid: 'Report-00C',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(report2);
                var report2CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner],
                    'direct-mail_to-Contact':[contact3],
                    'direct-join_to-Document':[document1],
                    'remote-mail_to-Contact':[contact3],
                    'remote-join_to-Document':[document1],
                    'direct-mail_to': [contact3],
                    'direct-join_to': [document1],
                    'remote-mail_to':[contact3],
                    'remote-join_to':[document1]
                };
                checkLinks(srvData, report2, report2CheckList);
                contact3CheckList['direct-mailed_from-Report'] = [report2];
                contact3CheckList['remote-mailed_from-Report'] = [report2];
                contact3CheckList['direct-mailed_from'] = [report2];
                contact3CheckList['remote-mailed_from'] = [report2];
                checkLinks(srvData, contact3, contact3CheckList);
                document1CheckList['direct-joined_from-Report'] = [report2];
                document1CheckList['remote-joined_from-Report'] = [report2];
                document1CheckList['direct-joined_from'] = [report2];
                document1CheckList['remote-joined_from'] = [report2];
                checkLinks(srvData, document1, document1CheckList);
                ownerCheckList['direct-owned-Report'].push(report2);
                ownerCheckList['remote-owned-Report'].push(report2);
                ownerCheckList['direct-owned'].push(report2);
                ownerCheckList['remote-owned'].push(report2);
                checkLinks(srvData, owner, ownerCheckList);

                var report3 = srvData.createObject('Report', {
                    contact_ids: [contact3.id, contact4.id],
                    document_ids: [document1.id, document2.id],
                    ratings: [],
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message'
                });
                checkObject(report3, {
                    title: 'Test report',
                    description: 'Report description',
                    message: 'Report message',
                    a4p_type: 'Report',
                    id: {
                        dbid: 'Report-00D',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(report3);
                var report3CheckList = {
                    'direct-owner-Contact': [owner],
                    'remote-owner-Contact': [owner],
                    'direct-owner': [owner],
                    'remote-owner': [owner],
                    'direct-mail_to-Contact':[contact3, contact4],
                    'direct-join_to-Document':[document1, document2],
                    'remote-mail_to-Contact':[contact3, contact4],
                    'remote-join_to-Document':[document1, document2],
                    'direct-mail_to': [contact3, contact4],
                    'direct-join_to': [document1, document2],
                    'remote-mail_to':[contact3, contact4],
                    'remote-join_to':[document1, document2]
                };
                checkLinks(srvData, report3, report3CheckList);
                contact3CheckList['direct-mailed_from-Report'].push(report3);
                contact3CheckList['remote-mailed_from-Report'].push(report3);
                contact3CheckList['direct-mailed_from'].push(report3);
                contact3CheckList['remote-mailed_from'].push(report3);
                checkLinks(srvData, contact3, contact3CheckList);
                document1CheckList['direct-joined_from-Report'].push(report3);
                document1CheckList['remote-joined_from-Report'].push(report3);
                document1CheckList['direct-joined_from'].push(report3);
                document1CheckList['remote-joined_from'].push(report3);
                checkLinks(srvData, document1, document1CheckList);
                contact4CheckList['direct-mailed_from-Report'] = [report3];
                contact4CheckList['remote-mailed_from-Report'] = [report3];
                contact4CheckList['direct-mailed_from'] = [report3];
                contact4CheckList['remote-mailed_from'] = [report3];
                checkLinks(srvData, contact4, contact4CheckList);
                document2CheckList['direct-joined_from-Report'] = [report3];
                document2CheckList['remote-joined_from-Report'] = [report3];
                document2CheckList['direct-joined_from'] = [report3];
                document2CheckList['remote-joined_from'] = [report3];
                checkLinks(srvData, document2, document2CheckList);
                ownerCheckList['direct-owned-Report'].push(report3);
                ownerCheckList['remote-owned-Report'].push(report3);
                ownerCheckList['direct-owned'].push(report3);
                ownerCheckList['remote-owned'].push(report3);
                checkLinks(srvData, owner, ownerCheckList);

                // Add some links

                contact2.created_by_id = owner.id;
                srvData.setObject(contact2);
                contact2CheckList['direct-creator-Contact'] = [owner];
                contact2CheckList['remote-creator-Contact'] = [owner];
                contact2CheckList['direct-creator'] = [owner];
                contact2CheckList['remote-creator'] = [owner];
                checkLinks(srvData, contact2, contact2CheckList);
                ownerCheckList['direct-created-Contact'] = [contact2];
                ownerCheckList['remote-created-Contact'] = [contact2];
                ownerCheckList['direct-created'] = [contact2];
                ownerCheckList['remote-created'] = [contact2];
                checkLinks(srvData, owner, ownerCheckList);

                var attendee1 = srvData.newAttachment('Attendee', contact3, event1);
                contact3CheckList['direct-attended-Attendee'] = [attendee1];
                contact3CheckList['remote-attended-Attendee'] = [attendee1];
                contact3CheckList['remote-attended-Event'] = [event1];
                contact3CheckList['remote-attended'] = [event1];
                checkLinks(srvData, contact3, contact3CheckList);
                event1CheckList['direct-attendee-Attendee'] = [attendee1];
                event1CheckList['remote-attendee-Attendee'] = [attendee1];
                event1CheckList['remote-attendee-Contact'] = [contact3];
                event1CheckList['remote-attendee'] = [contact3];
                checkLinks(srvData, event1, event1CheckList);

                var attachee1 = srvData.newAttachment('Attachee', document1, event1);
                document1CheckList['direct-attached-Attachee'] = [attachee1];
                document1CheckList['remote-attached-Attachee'] = [attachee1];
                document1CheckList['remote-attached-Event'] = [event1];
                document1CheckList['remote-attached'] = [event1];
                checkLinks(srvData, document1, document1CheckList);
                event1CheckList['direct-attachee-Attachee'] = [attachee1];
                event1CheckList['remote-attachee-Attachee'] = [attachee1];
                event1CheckList['remote-attachee-Document'] = [document1];
                event1CheckList['remote-attachee'] = [document1];
                checkLinks(srvData, event1, event1CheckList);

                document2.parent_id = event1.id;
                srvData.setObject(document2);
                document2CheckList['direct-parent-Event'] = [event1];
                document2CheckList['remote-parent-Event'] = [event1];
                document2CheckList['direct-parent'] = [event1];
                document2CheckList['remote-parent'] = [event1];
                checkLinks(srvData, document2, document2CheckList);
                event1CheckList['direct-child-Document'] = [document2];
                event1CheckList['remote-child-Document'] = [document2];
                event1CheckList['direct-child'] = [document2];
                event1CheckList['remote-child'] = [document2];
                checkLinks(srvData, event1, event1CheckList);

                note1.parent_id = event1.id;
                srvData.setObject(note1);
                note1CheckList['direct-parent-Event'] = [event1];
                note1CheckList['remote-parent-Event'] = [event1];
                note1CheckList['direct-parent'] = [event1];
                note1CheckList['remote-parent'] = [event1];
                checkLinks(srvData, note1, note1CheckList);
                event1CheckList['direct-child-Note'] = [note1];
                event1CheckList['remote-child-Note'] = [note1];
                event1CheckList['direct-child'] = [document2, note1];
                event1CheckList['remote-child'] = [document2, note1];
                checkLinks(srvData, event1, event1CheckList);

            });

            it('should create its second Contact', function () {

                var timeStart;
                var contact;

                runs(function () {
                    contact = srvData.createObject('Contact', {
                        salutation: 'Ms.',
                        first_name: 'Anna',
                        last_name: 'Santa'
                    });
                    checkObject(contact, {
                        salutation: 'Ms.',
                        first_name: 'Anna',
                        last_name: 'Santa',
                        a4p_type: 'Contact',
                        contact_type: 'Contact',
                        id: {
                            dbid: 'Contact-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(contact);
                    expect(contact.id.dbid).toBe('Contact-002');
                    expect(contact.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Contact-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Contact'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Contact', contact.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Contact-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);

                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Contact');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.salutation).toBe('Ms.');
                    expect(srvDataTransfer.pendingSends[0].params.fields.first_name).toBe('Anna');
                    expect(srvDataTransfer.pendingSends[0].params.fields.last_name).toBe('Santa');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    contact.salutation = 'Mrs.';
                    contact.title = 'President';
                    contact.phone_work = '0233445566';
                    contact.email = 'asanta@apps4pro.com';
                    contact.description = 'New contact';
                    contact.birthday = '1981-05-01';

                    srvData.setObject(contact);

                    expect(contact.id.dbid).toBe('Contact-002');
                    expect(contact.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(contact.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(contact.salutation).toBe('Mrs.');
                    expect(contact.title).toBe('President');
                    expect(contact.phone_work).toBe('0233445566');
                    expect(contact.email).toBe('asanta@apps4pro.com');
                    expect(contact.description).toBe('New contact');
                    expect(contact.birthday).toBe('1981-05-01 00:00:00');

                    srvData.addObjectToSave('Contact', contact.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Contact-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);

                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Contact');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('sf_ID_Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.salutation).toBe('Mrs.');
                    expect(srvDataTransfer.pendingSends[0].params.object.first_name).toBe('Anna');
                    expect(srvDataTransfer.pendingSends[0].params.object.last_name).toBe('Santa');
                    expect(srvDataTransfer.pendingSends[0].params.object.title).toBe('President');
                    expect(srvDataTransfer.pendingSends[0].params.fields.salutation).toBe('Mrs.');
                    expect(srvDataTransfer.pendingSends[0].params.fields.first_name).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.last_name).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('President');
                    expect(srvDataTransfer.pendingSends[0].params.fields.phone_work).toBe('0233445566');
                    expect(srvDataTransfer.pendingSends[0].params.fields.email).toBe('asanta@apps4pro.com');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('New contact');
                    expect(srvDataTransfer.pendingSends[0].params.fields.birthday).toBe('1981-05-01 00:00:00');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    contact.description = 'New contact2';
                    srvData.setObject(contact);
                    expect(contact.description).toBe('New contact2');
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NEW);

                    contact = srvData.getObject('Contact-002');
                    expect(contact).not.toBeUndefined();

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Contact-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Contact-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Contact-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Contact'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(2);
                    expect(contact.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Contact', contact.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Contact-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Contact');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('sf_ID_Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Contact'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Contact-002')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(contact.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                });

            });

            it('should create its first Account', function () {

                var account = srvData.createObject('Account', {
                    company_name: 'World company'
                });
                checkObject(account, {
                    company_name: 'World company',
                    a4p_type: 'Account',
                    annual_revenue: 0,
                    nb_employees: 0,
                    id: {
                        dbid: 'Account-002',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(account);

                expect(account.id.dbid).toBe('Account-002');
                expect(account.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                expect(account.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                expect(account.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                expect(account.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                expect(account.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                expect(srvData.index.db['Account-002']).not.toBeUndefined();
                expect(srvData.currentItems['Account'].length).toBe(1);
                expect(srvData.nbObjects).toBe(2);

                account.phone = '0233445566';
                account.annual_revenue = '14500';

                srvData.setObject(account);

                expect(account.id.dbid).toBe('Account-002');
                expect(account.phone).toBe('0233445566');
                expect(account.annual_revenue).toBe(14500);

                account = srvData.getObject('Account-002');
                expect(account).not.toBeUndefined();

                var removed = srvData.removeObject('dummy');
                expect(removed).toBe(false);
                expect(srvData.getObject('Account-002')).not.toBeUndefined();

                removed = srvData.removeObject('Account-002');
                expect(removed).not.toBe(false);
                expect(srvData.getObject('Account-002')).toBeUndefined();
                // Object removed immadiately because no creation request has been sent
                expect(srvData.currentItems['Account'].length).toBe(0);
                expect(srvData.nbObjects).toBe(1);

            });

            it('should create its first Event', function () {

                var now = new Date();
                var dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
                var dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2, 0, 0, 0);

                var event = srvData.createObject('Event', {
                    name: 'Rendez-vous'
                });
                checkObject(event, {
                    name: 'Rendez-vous',
                    a4p_type: 'Event',
                    date_start: a4pDateFormat(dateFrom),
                    date_end: a4pDateFormat(dateTo),
                    duration_hours: 1,
                    duration_minutes: 0,
                    id: {
                        dbid: 'Event-002',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    owner_id: owner.id,
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(event);

                expect(event.id.dbid).toBe('Event-002');
                expect(event.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                expect(event.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                expect(event.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                expect(event.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                expect(event.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                expect(srvData.index.db['Event-002']).not.toBeUndefined();
                expect(srvData.currentItems['Event'].length).toBe(1);
                expect(srvData.nbObjects).toBe(2);

                event.location = 'Tours';
                var olderDateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 10, 15, 0, 0);
                event.date_start = a4pDateFormat(olderDateFrom);

                srvData.setObject(event);

                expect(event.id.dbid).toBe('Event-002');
                expect(event.location).toBe('Tours');
                expect(event.date_start).toBe(a4pDateFormat(olderDateFrom));
                expect(event.date_end).toBe(a4pDateFormat(dateTo));
                expect(event.duration_hours).toBe(11);
                expect(event.duration_minutes).toBe(45);

                event = srvData.getObject('Event-002');
                expect(event).not.toBeUndefined();

                var removed = srvData.removeObject('dummy');
                expect(removed).toBe(false);
                expect(srvData.getObject('Event-002')).not.toBeUndefined();

                removed = srvData.removeObject('Event-002');
                expect(removed).not.toBe(false);
                expect(srvData.getObject('Event-002')).toBeUndefined();
                // Object removed immadiately because no creation request has been sent
                expect(srvData.currentItems['Event'].length).toBe(0);
                expect(srvData.nbObjects).toBe(1);

            });

            it('should create its first Opportunity', function () {

                var now = new Date();
                var dateClosed = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), 0, 0, 0);
                var opportunity = srvData.createObject('Opportunity', {
                    name: 'Nouveau client'
                });
                checkObject(opportunity, {
                    name: 'Nouveau client',
                    a4p_type: 'Opportunity',
                    date_closed: a4pDateFormat(dateClosed),
                    stage: 'Prospecting',
                    amount: 0,
                    probability: 100,
                    id: {
                        dbid: 'Opportunity-002',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(opportunity);

                expect(opportunity.id.dbid).toBe('Opportunity-002');
                expect(opportunity.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                expect(opportunity.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                expect(opportunity.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                expect(opportunity.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                expect(opportunity.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                expect(srvData.index.db['Opportunity-002']).not.toBeUndefined();
                expect(srvData.currentItems['Opportunity'].length).toBe(1);
                expect(srvData.nbObjects).toBe(2);

                opportunity.amount = '150000';

                srvData.setObject(opportunity);

                expect(opportunity.id.dbid).toBe('Opportunity-002');
                expect(opportunity.amount).toBe(150000);

                opportunity = srvData.getObject('Opportunity-002');
                expect(opportunity).not.toBeUndefined();

                var removed = srvData.removeObject('dummy');
                expect(removed).toBe(false);
                expect(srvData.getObject('Opportunity-002')).not.toBeUndefined();

                removed = srvData.removeObject('Opportunity-002');
                expect(removed).not.toBe(false);
                expect(srvData.getObject('Opportunity-002')).toBeUndefined();
                // Object removed immadiately because no creation request has been sent
                expect(srvData.currentItems['Opportunity'].length).toBe(0);
                expect(srvData.nbObjects).toBe(1);

            });

            it('should create its first Note', function () {

                var timeStart;
                var note;

                runs(function () {
                    note = srvData.createObject('Note', {
                        //contact_ids:[],
                        //document_ids:[],
                        //ratings:[],
                        title: 'Test note',
                        description: 'Note description',
                        message: 'Note message'
                    });
                    checkObject(note, {
                        title: 'Test note',
                        description: 'Note description',
                        message: 'Note message',
                        a4p_type: 'Note',
                        id: {
                            dbid: 'Note-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(note);

                    expect(note.id.dbid).toBe('Note-002');
                    expect(note.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(note.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Note-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Note'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Note', note.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(note.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(note.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Note-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Note');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.created[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[1].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Test note');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Note description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBe('Note message');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(note.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    note.title = 'Note title';
                    note.description = 'Test description';

                    srvData.setObject(note);

                    expect(note.id.dbid).toBe('Note-002');
                    expect(note.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(note.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(note.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(note.title).toBe('Note title');
                    expect(note.description).toBe('Test description');
                    expect(note.message).toBe('Note message');

                    srvData.addObjectToSave('Note', note.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(note.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(note.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Note-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Note');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('c4p_ID_Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].id).toBe('sf_ID_Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.title).toBe('Note title');
                    expect(srvDataTransfer.pendingSends[0].params.object.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.object.message).toBe('Note message');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Note title');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(note.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Note-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Note-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Note-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Note'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Note', note.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(note.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(note.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Note-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Note');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].id).toBe('sf_ID_Note-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Note'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Note-002')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(note.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                    expect(srvDataTransfer.pendingSends.length).toBe(0);

                });

            });

            it('should create its first Report', function () {

                var timeStart;
                var report;

                runs(function () {
                    report = srvData.createObject('Report', {
                        //contact_ids:[],
                        //document_ids:[],
                        //ratings:[],
                        title: 'Test report',
                        description: 'Report description',
                        message: 'Report message'
                    });
                    checkObject(report, {
                        title: 'Test report',
                        description: 'Report description',
                        message: 'Report message',
                        a4p_type: 'Report',
                        contact_ids: {length: 0},
                        document_ids: {length: 0},
                        ratings: {length: 0},
                        id: {
                            dbid: 'Report-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(report);

                    expect(report.id.dbid).toBe('Report-002');
                    expect(report.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Report-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Report'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Report', report.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Report-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.created[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[1].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Test report');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Report description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBe('Report message');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    report.title = 'Report title';
                    report.description = 'Test description';

                    srvData.setObject(report);

                    expect(report.id.dbid).toBe('Report-002');
                    expect(report.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(report.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(report.title).toBe('Report title');
                    expect(report.description).toBe('Test description');
                    expect(report.message).toBe('Report message');

                    srvData.addObjectToSave('Report', report.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(report.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Report-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('c4p_ID_Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].id).toBe('sf_ID_Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.title).toBe('Report title');
                    expect(srvDataTransfer.pendingSends[0].params.object.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.object.message).toBe('Report message');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Report title');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Report-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Report-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Report-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Report'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Report', report.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Report-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].id).toBe('sf_ID_Report-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Report'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Report-002')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                });

            });

            it('should create a Report with ratings, and links on Contacts or Documents', function () {

                var timeStart;
                var contact1;
                var contact2;
                var document1;
                var document2;
                var report;

                runs(function () {
                    // Create Contact#1
                    contact1 = srvData.createObject('Contact', {
                        salutation: 'Mr',
                        first_name: 'Cyrille',
                        last_name: 'Charron'
                    });
                    checkObject(contact1, {
                        salutation: 'Mr',
                        first_name: 'Cyrille',
                        last_name: 'Charron',
                        a4p_type: 'Contact',
                        contact_type: 'Contact',
                        id: {
                            dbid: 'Contact-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(contact1);
                    expect(contact1.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(srvData.currentItems['Contact'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(2);
                    srvData.addObjectToSave('Contact', contact1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(contact1.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(contact1.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Contact');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Contact-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(contact1.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    // Create Contact#2
                    contact2 = srvData.createObject('Contact', {
                        salutation: 'Mr',
                        first_name: 'Cyrille',
                        last_name: 'Charron'
                    });
                    checkObject(contact2, {
                        salutation: 'Mr',
                        first_name: 'Cyrille',
                        last_name: 'Charron',
                        a4p_type: 'Contact',
                        contact_type: 'Contact',
                        id: {
                            dbid: 'Contact-003',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(contact2);
                    expect(contact2.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(3);
                    srvData.addObjectToSave('Contact', contact2.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(contact2.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(contact2.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Contact');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Contact-003');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(contact2.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    // Create Document#1
                    document1 = srvData.createObject('Document', {
                        name: 'test1.jpeg',
                        body:'',
                        length:'0',
                        path:'a4p/c4p/doc/sf',
                        description:'Test doc',
                        uid:'test1',
                        url:documentUrl,
                        fileUrl:documentUrl,
                        src:documentUrl,
                        filePath:'/a4p/c4p/doc/sf/Document-002.jpeg'
                    });
                    checkObject(document1, {
                        name: 'test1.jpeg',
                        body: '',
                        length: 0,
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test1',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                        a4p_type: 'Document',
                        document_type: 'Attachment',
                        extension: 'jpeg',
                        rootname: 'test1',
                        mimetype: 'image/jpeg',
                        id: {
                            dbid: 'Document-004',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(document1);
                    expect(document1.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(4);

                    srvData.addObjectToSave('Document', document1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(document1.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(document1.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-004');
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(document1.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    // Create Document#2
                    document2 = srvData.createObject('Document', {
                        name: 'test2.doc',
                        body:'',
                        length:'0',
                        path:'a4p/c4p/doc/sf',
                        description:'Test doc',
                        uid:'test2',
                        url:documentUrl,
                        fileUrl:documentUrl,
                        src:documentUrl,
                        filePath:'/a4p/c4p/doc/sf/Document-002.jpeg'
                    });
                    checkObject(document2, {
                        name: 'test2.doc',
                        body: '',
                        length: 0,
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test2',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                        a4p_type: 'Document',
                        document_type: 'Attachment',
                        extension: 'doc',
                        rootname: 'test2',
                        mimetype: 'application/msword',
                        id: {
                            dbid: 'Document-005',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(document2);
                    expect(document2.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(srvData.currentItems['Document'].length).toBe(2);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(5);

                    srvData.addObjectToSave('Document', document2.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(document2.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(document2.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-005');
                    expect(srvFileTransfer.pendingSends[0].params.uploadFileInCrm).toBe(true);
                    expect(srvFileTransfer.pendingSends[0].params.shareFileInCrm).toBe(false);
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(document2.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    report = srvData.createObject('Report', {
                        contact_ids: [],
                        document_ids: [],
                        ratings: [],
                        title: 'Test report',
                        description: 'Report description',
                        message: 'Report message'
                    });
                    checkObject(report, {
                        title: 'Test report',
                        description: 'Report description',
                        message: 'Report message',
                        a4p_type: 'Report',
                        contact_ids: {length: 0},
                        document_ids: {length: 0},
                        ratings: {length: 0},
                        id: {
                            dbid: 'Report-006',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    report.contact_ids.push(contact1.id);
                    report.document_ids.push(document1.id);

                    srvData.addObject(report);
                    expect(report.id.dbid).toBe('Report-006');
                    expect(report.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Report-006']).not.toBeUndefined();
                    expect(srvData.currentItems['Report'].length).toBe(1);
                    expect(srvData.currentItems['Document'].length).toBe(2);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(6);

                    srvData.addObjectToSave('Report', report.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Report-006');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.created[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.created[1].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Test report');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Report description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBe('Report message');
                    expect(typeof srvDataTransfer.pendingSends[0].params.fields.contact_ids).toBe(typeof []);
                    expect(srvDataTransfer.pendingSends[0].params.fields.contact_ids.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.contact_ids[0].dbid).toBe(contact1.id.dbid);
                    expect(typeof srvDataTransfer.pendingSends[0].params.fields.document_ids).toBe(typeof []);
                    expect(srvDataTransfer.pendingSends[0].params.fields.document_ids.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.document_ids[0].dbid).toBe(document1.id.dbid);
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    report.title = 'Report title';
                    report.description = 'Test description';
                    report.contact_ids.push(contact2.id);
                    report.document_ids.push(document2.id);

                    srvData.setObject(report);

                    expect(report.id.dbid).toBe('Report-006');
                    expect(report.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(report.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(report.title).toBe('Report title');
                    expect(report.description).toBe('Test description');
                    expect(report.message).toBe('Report message');
                    expect(typeof report.contact_ids).toBe(typeof []);
                    expect(report.contact_ids.length).toBe(2);
                    expect(report.contact_ids[0].dbid).toBe(contact1.id.dbid);
                    expect(report.contact_ids[1].dbid).toBe(contact2.id.dbid);
                    expect(typeof report.document_ids).toBe(typeof []);
                    expect(report.document_ids.length).toBe(2);
                    expect(report.document_ids[0].dbid).toBe(document1.id.dbid);
                    expect(report.document_ids[1].dbid).toBe(document2.id.dbid);

                    srvData.addObjectToSave('Report', report.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(report.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Report-006');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('c4p_ID_Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[1].id).toBe('sf_ID_Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.object.title).toBe('Report title');
                    expect(srvDataTransfer.pendingSends[0].params.object.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.object.message).toBe('Report message');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Report title');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Test description');
                    expect(srvDataTransfer.pendingSends[0].params.fields.message).toBeUndefined();
                    expect(typeof srvDataTransfer.pendingSends[0].params.fields.contact_ids).toBe(typeof []);
                    expect(srvDataTransfer.pendingSends[0].params.fields.contact_ids.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.fields.contact_ids[0].dbid).toBe(contact1.id.dbid);
                    expect(srvDataTransfer.pendingSends[0].params.fields.contact_ids[1].dbid).toBe(contact2.id.dbid);
                    expect(typeof srvDataTransfer.pendingSends[0].params.fields.document_ids).toBe(typeof []);
                    expect(srvDataTransfer.pendingSends[0].params.fields.document_ids.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.fields.document_ids[0].dbid).toBe(document1.id.dbid);
                    expect(srvDataTransfer.pendingSends[0].params.fields.document_ids[1].dbid).toBe(document2.id.dbid);
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Report-006')).not.toBeUndefined();

                    removed = srvData.removeObject('Report-006');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Report-006')).not.toBeUndefined();
                    expect(srvData.currentItems['Report'].length).toBe(1);
                    expect(srvData.currentItems['Document'].length).toBe(2);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(6);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Report', report.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Report-006');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Report');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(2);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[1].id).toBe('sf_ID_Report-006');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Report'].length).toBe(0);
                    expect(srvData.currentItems['Document'].length).toBe(2);
                    expect(srvData.currentItems['Contact'].length).toBe(3);
                    expect(srvData.nbObjects).toBe(5);
                    expect(srvData.getObject('Report-006')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                });

            });

            it('should create its first Plan', function () {

                var timeStart;
                var plan;

                runs(function () {
                    plan = srvData.createObject('Plan', {
                        //parent_id:{},
                        title: 'Test plan',
                        pos: 0
                    });
                    checkObject(plan, {
                        title: 'Test plan',
                        pos: 0,
                        a4p_type: 'Plan',
                        id: {
                            dbid: 'Plan-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(plan);
                    expect(plan.id.dbid).toBe('Plan-002');
                    expect(plan.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(plan.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Plan-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Plan'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Plan', plan.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(plan.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Plan-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Test plan');
                    expect(srvDataTransfer.pendingSends[0].params.fields.pos).toBe(0);
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    plan.title = 'Plan title';
                    plan.pos = 1;

                    srvData.setObject(plan);

                    expect(plan.id.dbid).toBe('Plan-002');
                    expect(plan.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(plan.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(plan.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(plan.title).toBe('Plan title');
                    expect(plan.pos).toBe(1);

                    srvData.addObjectToSave('Plan', plan.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(report.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(plan.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Plan-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('c4p_ID_Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.title).toBe('Plan title');
                    expect(srvDataTransfer.pendingSends[0].params.object.pos).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Plan title');
                    expect(srvDataTransfer.pendingSends[0].params.fields.pos).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.parent_id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Plan-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Plan-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Plan-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Plan'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Plan', plan.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(plan.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Plan-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {
                    return ((new Date().getTime() - timeStart) > 1000);
                }, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Plan'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Plan-002')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                });

            });

            it('should create many Plans and do cascade delete', function () {

                var timeStart;
                var plan1;
                var plan2;

                runs(function () {
                    plan1 = srvData.createObject('Plan', {
                        //parent_id:{},
                        title: 'Root plan',
                        pos: 0
                    });
                    checkObject(plan1, {
                        title: 'Root plan',
                        pos: 0,
                        a4p_type: 'Plan',
                        id: {
                            dbid: 'Plan-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(plan1);
                    expect(plan1.id.dbid).toBe('Plan-002');
                    expect(plan1.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(plan1.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(plan1.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(plan1.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(plan1.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Plan-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Plan'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Plan', plan1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(plan1.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Plan-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Root plan');
                    expect(srvDataTransfer.pendingSends[0].params.fields.pos).toBe(0);
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();

                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () { return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan1.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    plan2 = srvData.createObject('Plan', {
                        //parent_id:{},
                        title: 'Sub plan',
                        pos: 0
                    });
                    checkObject(plan2, {
                        title: 'Sub plan',
                        pos: 0,
                        a4p_type: 'Plan',
                        id: {
                            dbid: 'Plan-003',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(plan2);
                    expect(plan2.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(plan2.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(plan2.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(plan2.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(plan2.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Plan-003']).not.toBeUndefined();
                    expect(srvData.currentItems['Plan'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(3);

                    srvData.linkToItem(plan2.a4p_type, 'parent', [plan2], plan1);
                    //srvData.addObjectToSave('Plan', plan2.id.dbid); // Useless : already called by linkToItem()
                    expect(plan2.parent_id.dbid).toBe('Plan-002');

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(report.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(plan2.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Plan-003');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-003');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Plan-003');
                    expect(srvDataTransfer.pendingSends[0].params.fields.title).toBe('Sub plan');
                    expect(srvDataTransfer.pendingSends[0].params.fields.pos).toBe(0);
                    expect(srvDataTransfer.pendingSends[0].params.fields.parent_id.dbid).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.parent_id.c4p_id).toBe('c4p_ID_Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(plan2.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan2.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Plan-002')).not.toBeUndefined();

                    // removing Plan-002 should remove Plan-003

                    removed = srvData.removeObject('Plan-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Plan-002')).not.toBeUndefined();
                    expect(srvData.getObject('Plan-003')).not.toBeUndefined();
                    expect(srvData.currentItems['Plan'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(3);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Plan', plan1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(plan1.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Plan-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Plan-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Plan'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(srvData.getObject('Plan-002')).toBeUndefined();
                    expect(plan1.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                    // cascade delete should delete Facet-003

                    // SrvDataTransfer should have received a dataRequest
                    //expect(report.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(plan2.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Plan-003');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Plan');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Plan-003');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Plan-003');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Plan'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Plan-003')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(plan2.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                });

            });

            it('should create many Facets and do cascade delete', function () {

                var timeStart;
                var facet1;
                var facet2;

                runs(function () {
                    facet1 = srvData.createObject('Facet', {
                        //owner_id:{},
                        //parent_id:{},
                        //facets_ids:[],
                        //items_ids:[],
                        prefix: '',
                        name: 'Biblio',
                        description: 'Root tag'
                    });
                    checkObject(facet1, {
                        prefix: '',
                        name: 'Biblio',
                        description : 'Root tag',
                        a4p_type: 'Facet',
                        id: {
                            dbid: 'Facet-002',
                            c4p_id: undefined
                        },
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(facet1);
                    expect(facet1.id.dbid).toBe('Facet-002');
                    expect(facet1.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(facet1.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(facet1.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(facet1.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Facet-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Facet'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Facet', facet1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(note.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(facet1.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Facet-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.prefix).toBe('');
                    expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('Biblio');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Root tag');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(facet1.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    facet2 = srvData.createObject('Facet', {
                        //owner_id:{},
                        //parent_id:{},
                        //facets_ids:[],
                        //items_ids:[],
                        prefix: '',
                        name: 'Private',
                        description: 'Sub tag'
                    });
                    checkObject(facet2, {
                        prefix: '',
                        name: 'Private',
                        description: 'Sub tag',
                        a4p_type: 'Facet',
                        id: {
                            dbid: 'Facet-003',
                            c4p_id: undefined
                        },
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(facet2);
                    expect(facet2.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(facet2.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(facet2.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(facet2.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(facet2.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Facet-003']).not.toBeUndefined();
                    expect(srvData.currentItems['Facet'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(3);

                    srvData.linkToItem(facet2.a4p_type, 'parent', [facet2], facet1);
                    //srvData.addObjectToSave('Facet', facet2.id.dbid); // Useless : already called by linkToItem()
                    expect(facet2.parent_id.dbid).toBe('Facet-002');
                    expect(facet2.parent_id.c4p_id).toBe('c4p_ID_Facet-002');
                    // parent
                    expect(facet1.facets_ids.length).toBe(1);
                    expect(facet1.facets_ids[0].dbid).toBe('Facet-003');

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(note.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(facet2.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Facet-003');
                    expect(srvData.objectsToSave.length).toBe(1);//'Facet-002' is waiting to be updated
                    expect(srvData.objectsToSave[0].dbid).toBe('Facet-002');
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.fields.prefix).toBe('');
                    expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('Private');
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Sub tag');
                    expect(srvDataTransfer.pendingSends[0].params.fields.parent_id.dbid).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.parent_id.c4p_id).toBe('c4p_ID_Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(facet2.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    // SrvDataTransfer should have received a dataRequest
                    //expect(note.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(facet1.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Facet-002');
                    expect(srvData.objectsToSave.length).toBe(1);//Useless 'Facet-003' is waiting to be updated
                    expect(srvData.objectsToSave[0].dbid).toBe('Facet-003');
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('c4p_ID_Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.id.dbid).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.fields.facets_ids.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.fields.facets_ids[0].dbid).toBe('Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.fields.facets_ids[0].c4p_id).toBe('c4p_ID_Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(facet1.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Facet-002')).not.toBeUndefined();

                    // removing Facet-002 should remove Facet-003

                    removed = srvData.removeObject('Facet-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Facet-002')).not.toBeUndefined();
                    expect(srvData.getObject('Facet-003')).not.toBeUndefined();
                    expect(srvData.currentItems['Facet'].length).toBe(2);
                    expect(srvData.nbObjects).toBe(3);
                    expect(removed.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(removed.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Facet', facet1.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Facet-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Facet-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Facet'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(srvData.getObject('Facet-002')).toBeUndefined();
                    expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                    // cascade delete should delete Facet-003

                    // SrvDataTransfer should have received a dataRequest
                    //expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(facet2.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Facet-003');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('c4p');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('c4p_ID_Facet-003');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.currentItems['Facet'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                    expect(srvData.getObject('Facet-003')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(facet1.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);

                    expect(srvDataTransfer.pendingSends.length).toBe(0);

                });

            });

            it('TODO: should create its first Email', function () {
                // TODO :
            });

            it('should create its first Document', function () {

                var timeStart;
                var document;

                runs(function () {
                    document = srvData.createObject('Document', {
                        name: 'test.jpeg',
                        body: '',
                        length: '0',
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg'
                    });
                    checkObject(document, {
                        name: 'test.jpeg',
                        body: '',
                        length: 0,
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                        a4p_type: 'Document',
                        document_type: 'Attachment',
                        extension: 'jpeg',
                        rootname: 'test',
                        mimetype: 'image/jpeg',
                        id: {
                            dbid: 'Document-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(document);
                    expect(document.id.dbid).toBe('Document-002');
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Document-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Document', document.id.dbid);
                    // SrvFileTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);
                    expect(srvFileTransfer.pendingSends[0].filePath).toBe('/a4p/c4p/doc/sf/Document-002.jpeg');
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvFileTransfer.pendingSends[0].params.uploadFileInCrm).toBe(true);
                    expect(srvFileTransfer.pendingSends[0].params.shareFileInCrm).toBe(false);
                    expect(srvFileTransfer.pendingSends[0].params.fileName).toBe('test.jpeg');
                    expect(srvFileTransfer.pendingSends[0].params.fileUid).toBe('Document-002');
                    expect(srvFileTransfer.pendingSends[0].params.object_id.dbid).toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].options.fileKey).toBe('file');
                    expect(srvFileTransfer.pendingSends[0].options.fileName).toBe('test.jpeg');
                    expect(srvFileTransfer.pendingSends[0].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    document.description = 'Novel';
                    document.rootname = 'newName';

                    srvData.setObject(document);

                    expect(document.id.dbid).toBe('Document-002');
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(document.description).toBe('Novel');
                    expect(document.rootname).toBe('newName');
                    expect(document.name).toBe('newName.jpeg');
                    expect(document.extension).toBe('jpeg');
                    expect(document.mimetype).toBe('image/jpeg');
                    expect(document.path).toBe('a4p/c4p/doc/sf');
                    expect(document.filePath).toBe('/a4p/c4p/doc/sf/Document-002.jpeg');
                    expect(document.fileUrl).toMatch('/persistent/a4p/c4p/doc/sf/Document-002.jpeg');

                    srvData.addObjectToSave('Document', document.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    //expect(document.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('sf_ID_Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.name).toBe('newName.jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.rootname).toBe('newName');
                    expect(srvDataTransfer.pendingSends[0].params.object.extension).toBe('jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.mimetype).toBe('image/jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.description).toBe('Novel');
                    expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('newName.jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.fields.rootname).toBe('newName');
                    expect(srvDataTransfer.pendingSends[0].params.fields.extension).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.mimetype).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Novel');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);

                    document = srvData.getObject('Document-002');
                    expect(document).not.toBeUndefined();

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Document-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Document-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Document-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Document', document.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('sf_ID_Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvData.getObject('Document-002')).toBeUndefined();
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.currentItems['Document'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                });

            });

            it('should create its first Feed', function () {

                var timeStart;
                var document;

                runs(function () {
                    document = srvData.createObject('Document', {
                        name: 'test.jpeg',
                        feed: {
                            body: 'Body of Feed',
                            title: 'Title of Feed'
                        },
                        body: '',
                        length: '0',
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg'
                    });
                    // feed is ignored and deleted : authorized only in setObject()
                    checkObject(document, {
                        name: 'test.jpeg',
                        feed: undefined,
                        body: '',
                        length: 0,
                        path: 'a4p/c4p/doc/sf',
                        description: 'Test doc',
                        uid: 'test',
                        url: documentUrl,
                        fileUrl: documentUrl,
                        src: documentUrl,
                        filePath: '/a4p/c4p/doc/sf/Document-002.jpeg',
                        a4p_type: 'Document',
                        document_type: 'Attachment',
                        extension: 'jpeg',
                        rootname: 'test',
                        mimetype: 'image/jpeg',
                        id: {
                            dbid: 'Document-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(document);

                    expect(document.id.dbid).toBe('Document-002');
                    expect(document.feed).toBeUndefined();
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Document-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Document', document.id.dbid);
                    // SrvFileTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);
                    expect(srvFileTransfer.pendingSends[0].filePath).toBe('/a4p/c4p/doc/sf/Document-002.jpeg');
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvFileTransfer.pendingSends[0].params.uploadFileInCrm).toBe(true);
                    expect(srvFileTransfer.pendingSends[0].params.shareFileInCrm).toBe(false);
                    expect(srvFileTransfer.pendingSends[0].params.fileName).toBe('test.jpeg');
                    expect(srvFileTransfer.pendingSends[0].params.fileUid).toBe('Document-002');
                    expect(srvFileTransfer.pendingSends[0].params.object_id.dbid).toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].options.fileKey).toBe('file');
                    expect(srvFileTransfer.pendingSends[0].options.fileName).toBe('test.jpeg');
                    expect(srvFileTransfer.pendingSends[0].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {

                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    document.feed = {
                        body: 'Body of Feed',
                        title: 'Title of Feed'
                    };
                    document.description = 'Novel';
                    document.rootname = 'newName';

                    srvData.setObject(document);

                    expect(document.id.dbid).toBe('Document-002');
                    expect(document.feed.body).toBe('Body of Feed');
                    expect(document.feed.title).toBe('Title of Feed');
                    expect(document.description).toBe('Novel');
                    expect(document.rootname).toBe('newName');
                    expect(document.name).toBe('newName.jpeg');
                    expect(document.extension).toBe('jpeg');
                    expect(document.mimetype).toBe('image/jpeg');
                    expect(document.path).toBe('a4p/c4p/doc/sf');
                    expect(document.filePath).toBe('/a4p/c4p/doc/sf/Document-002.jpeg');
                    expect(document.fileUrl).toMatch('/persistent/a4p/c4p/doc/sf/Document-002.jpeg');

                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Document-002']).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObjectToSave('Document', document.id.dbid);

                    // SrvDataTransfer should have received a dataRequest
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(0);
                    expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    //expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('share');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlShareDoc);
                    expect(srvDataTransfer.pendingSends[0].params.file.id.dbid).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.body).toBe('Body of Feed');
                    expect(srvDataTransfer.pendingSends[0].params.title).toBe('Title of Feed');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : id = 'sf_ID_'+send.params.file.id.sf_id OR 'sf_ID_'+send.params.file.uid
                    srvDataTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {

                    // feed attribute is deleted upon acknowledge
                    //srvData.setObject(document);
                    expect(document.feed).toBeUndefined();
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);

                    // SrvDataTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.writing).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('update');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfUpdate);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.updated.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.updated[0].id).toBe('sf_ID_Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.id.dbid).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.object.name).toBe('newName.jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.rootname).toBe('newName');
                    expect(srvDataTransfer.pendingSends[0].params.object.extension).toBe('jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.mimetype).toBe('image/jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.object.description).toBe('Novel');
                    expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('newName.jpeg');
                    expect(srvDataTransfer.pendingSends[0].params.fields.rootname).toBe('newName');
                    expect(srvDataTransfer.pendingSends[0].params.fields.extension).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.mimetype).toBeUndefined();
                    expect(srvDataTransfer.pendingSends[0].params.fields.description).toBe('Novel');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : updated[i].id = send.params.updated[i].id
                    srvDataTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {

                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);

                    document = srvData.getObject('Document-002');
                    expect(document).not.toBeUndefined();

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Document-002')).not.toBeUndefined();

                    removed = srvData.removeObject('Document-002');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Document-002')).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(2);
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Document', document.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Document-002');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('sf_ID_Document-002');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();

                    timeStart = new Date().getTime();
                });

                // wait for 10s to let time for srvFileStorage to write the file
                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.getObject('Document-002')).toBeUndefined();
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.currentItems['Document'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(1);
                });

            });

            it('should take its first Picture', function () {
                var timeStart;
                var pictureTaken = false;
                var document = null;
                var error = null;
                var event;

                runs(function () {
                    var now = new Date();
                    var dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
                    var dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2, 0, 0, 0);

                    event = srvData.createObject('Event', {
                        name: 'Rendez-vous'
                    });
                    checkObject(event, {
                        name: 'Rendez-vous',
                        a4p_type: 'Event',
                        date_start: a4pDateFormat(dateFrom),
                        date_end: a4pDateFormat(dateTo),
                        duration_hours: 1,
                        duration_minutes: 0,
                        id: {
                            dbid: 'Event-002',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });

                    srvData.addObject(event);

                    srvData.takePicture(event, 'test picture').then(function(data) {
                        pictureTaken = true;
                        document = data;
                    }, function(diag) {
                        pictureTaken = true;
                        error = diag;
                    });
                    if (!srvData.rootScope.$$phase) srvData.rootScope.$apply();// propagate promise resolution
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {return pictureTaken;}, "Picture should be created", 10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(document).not.toBeNull();
                    checkObject(document, {
                        path: 'a4p/c4p/doc',
                        a4p_type: 'Document',
                        document_type: 'Attachment',
                        extension: 'png',
                        mimetype: 'image/png',
                        id: {
                            dbid: 'Document-003',
                            sf_id: undefined,
                            c4p_id: undefined
                        },
                        parent_id: {
                            dbid: undefined
                        },
                        owner_id: owner.id,
                        created_by_id: {
                            id: undefined
                        },
                        last_modified_by_id: {
                            id: undefined
                        },
                        created_date: {},// {} will check defined without checking value
                        last_modified_date: {}// {} will check defined without checking value
                    });
                    // user fields
                    expect(document.filePath).toMatch('a4p/c4p/doc/test_picture_[0-9]+.png');
                    // URL=filesystem:https://127.0.0.1(:[0-9]+)?/persistent/... with runner.html
                    // URL=filesystem:http://localhost(:[0-9]+)?/persistent/... with JsTestDriver
                    expect(document.url).toMatch('/persistent/a4p/c4p/doc/test_picture_[0-9]+.png');
                    // Picture is created but NOT saved in srvData
                    expect(srvData.index.db['Document-003']).toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(2);

                    srvData.addObject(document);
                    expect(document.id.dbid).toBe('Document-003');
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NEW);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.index.db['Document-003']).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(3);

                    srvData.linkToItem(document.a4p_type, 'parent', [document], event);
                    expect(document.parent_id.dbid).toBe(event.id.dbid);
                    srvData.addObjectToSave(document.a4p_type, document.id.dbid);
                    // SrvFileTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.creating).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('create');
                    expect(srvData.savingObject.dbid).toBe('Document-003');
                    expect(srvData.objectsToSave.length).toBe(1);//Useless 'Document-003' is waiting to be updated
                    expect(srvData.objectsToSave[0].dbid).toBe('Document-003');
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvFileTransfer.pendingSends.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlUploadFile);
                    expect(srvFileTransfer.pendingSends[0].filePath).toMatch('a4p/c4p/doc/test_picture_[0-9]+.png');
                    expect(srvFileTransfer.pendingSends[0].params.idx).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.nb).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvFileTransfer.pendingSends[0].params.id).toBe('Document-003');
                    expect(srvFileTransfer.pendingSends[0].params.uploadFileInCrm).toBe(true);
                    expect(srvFileTransfer.pendingSends[0].params.shareFileInCrm).toBe(false);
                    expect(srvFileTransfer.pendingSends[0].params.fileName).toMatch('test_picture_[0-9]+.png');
                    expect(srvFileTransfer.pendingSends[0].params.fileUid).toBe('Document-003');
                    expect(srvFileTransfer.pendingSends[0].params.object_id.dbid).toBe('Event-002');
                    expect(srvFileTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    expect(srvFileTransfer.pendingSends[0].options.fileKey).toBe('file');
                    expect(srvFileTransfer.pendingSends[0].options.fileName).toMatch('test_picture_[0-9]+.png');
                    expect(srvFileTransfer.pendingSends[0].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
                    expect(srvFileTransfer.pendingSends[0].params.created.length).toBe(1);
                    expect(srvFileTransfer.pendingSends[0].params.created[0].crm).toBe('sf');
                    expect(srvFileTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                    // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.created[i].id
                    srvFileTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);

                    document = srvData.getObject('Document-003');
                    expect(document).not.toBeUndefined();
                    expect(document.parent_id.dbid).toBe(event.id.dbid);

                    var removed = srvData.removeObject('dummy');
                    expect(removed).toBe(false);
                    expect(srvData.getObject('Document-003')).not.toBeUndefined();

                    removed = srvData.removeObject('Document-003');
                    expect(removed).not.toBe(false);
                    expect(srvData.getObject('Document-003')).not.toBeUndefined();
                    expect(srvData.currentItems['Document'].length).toBe(1);
                    expect(srvData.nbObjects).toBe(3);
                    expect(document.c4p_synchro.sharing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.creating).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.writing).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.reading).toBe(c4p.Synchro.NONE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NEW);

                    srvData.addObjectToSave('Document', document.id.dbid);
                    // SrvDataTransfer should have received a dataRequest
                    //expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.QUEUE);
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NETWORK);
                    expect(srvData.savingObject.action).toBe('delete');
                    expect(srvData.savingObject.dbid).toBe('Document-003');
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvDataTransfer.pendingSends.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfDelete);
                    expect(srvDataTransfer.pendingSends[0].params.type).toBe('Document');
                    expect(srvDataTransfer.pendingSends[0].params.id).toBe('Document-003');
                    expect(srvDataTransfer.pendingSends[0].params.deleted.length).toBe(1);
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].crm).toBe('sf');
                    expect(srvDataTransfer.pendingSends[0].params.deleted[0].id).toBe('sf_ID_Document-003');
                    expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                    // Send response : deleted[i].id = send.params.deleted[i].id
                    srvDataTransfer.ackSend();
                    timeStart = new Date().getTime();
                });

                waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

                runs(function () {
                    expect(srvData.savingObject.action).toBeUndefined();
                    expect(srvData.savingObject.dbid).toBeUndefined();
                    expect(srvData.objectsToSave.length).toBe(0);
                    expect(srvData.objectsToDownload.length).toBe(0);
                    expect(srvData.getObject('Document-003')).toBeUndefined();
                    expect(document.c4p_synchro.deleting).toBe(c4p.Synchro.NONE);
                    expect(srvData.currentItems['Document'].length).toBe(0);
                    expect(srvData.nbObjects).toBe(2);
                });

            });

        });

    });

    describe('Getting the fullmap', function () {

        var now = new Date().getTime();

        it('should get an error', function () {

            var isDemo = false;
            var userEmail = 'test@free.fr';
            var userPassword = 'secret';
            var c4pToken = '';
            var keepCrmLogin = true;
            var userFeedback = {
                company_name: '',
                phone: '',
                feedback: '',
                star: ''
            };
            var appVersion = '00S00';
            var mapResponse = null;
            srvData.loginUser(isDemo, userEmail, userPassword, c4pToken, keepCrmLogin, userFeedback, appVersion)
                .then(function () {
                }, function (response) {
                    mapResponse = response;
                });

            // SrvDataTransfer should have received a dataRequest
            expect(srvData.savingObject.action).toBeUndefined();
            expect(srvData.savingObject.dbid).toBeUndefined();
            expect(srvData.objectsToSave.length).toBe(0);
            expect(srvData.objectsToDownload.length).toBe(0);
            expect(srvDataTransfer.pendingSends.length).toBe(1);
            expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlData);
            expect(srvDataTransfer.pendingSends[0].params.login).toBe(userEmail);
            expect(srvDataTransfer.pendingSends[0].params.password).toBe(userPassword);
            expect(srvDataTransfer.pendingSends[0].params.rememberPassword).toBe(keepCrmLogin);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.fifo).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.company_name).toBe(userFeedback.company_name);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.phone).toBe(userFeedback.phone);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.feedback).toBe(userFeedback.feedback);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.star).toBe(userFeedback.star);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.name).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.cordova).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.platform).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.version).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.appVersion).toBe(appVersion);
            expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBeUndefined();
            // Send response
            srvDataTransfer.ackSend({
                'error': 'htmlMsgSynchronizationServerPb',
                'log': 'Fill error : SF api not accessible : SSL read: error:00000000:lib(0):func(0):reason(0), errno 10054'
            });

            expect(mapResponse).not.toBeUndefined();
            expect(mapResponse.error).toBe('htmlMsgSynchronizationServerPb');
            expect(mapResponse.log).toBe('Received error code htmlMsgSynchronizationServerPb : Fill error : SF api not accessible : SSL read: error:00000000:lib(0):func(0):reason(0), errno 10054');

        });

        it('should get the new UrlBase', function () {

            var isDemo = false;
            var userEmail = 'test@free.fr';
            var userPassword = 'secret';
            var c4pToken = '';
            var keepCrmLogin = true;
            var userFeedback = {
                company_name: '',
                phone: '',
                feedback: '',
                star: ''
            };
            var appVersion = '00S00';
            var mapResponse = null;
            srvData.loginUser(isDemo, userEmail, userPassword, c4pToken, keepCrmLogin, userFeedback, appVersion)
                .then(function () {
                }, function (response) {
                    mapResponse = response;
                });

            // SrvDataTransfer should have received a dataRequest
            expect(srvData.savingObject.action).toBeUndefined();
            expect(srvData.savingObject.dbid).toBeUndefined();
            expect(srvData.objectsToSave.length).toBe(0);
            expect(srvData.objectsToDownload.length).toBe(0);
            expect(srvDataTransfer.pendingSends.length).toBe(1);
            expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlData);
            expect(srvDataTransfer.pendingSends[0].params.login).toBe(userEmail);
            expect(srvDataTransfer.pendingSends[0].params.password).toBe(userPassword);
            expect(srvDataTransfer.pendingSends[0].params.rememberPassword).toBe(keepCrmLogin);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.fifo).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.company_name).toBe(userFeedback.company_name);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.phone).toBe(userFeedback.phone);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.feedback).toBe(userFeedback.feedback);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.star).toBe(userFeedback.star);
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.name).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.cordova).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.platform).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.version).toBe('');
            expect(srvDataTransfer.pendingSends[0].params.serverUpdates.appVersion).toBe(appVersion);
            expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBeUndefined();
            // Send response
            srvDataTransfer.ackSend({
                'error' : '',
                'responseOK' : true,
                'responseRight' : '11',
                'urlBase' : 'new/url/base.php',// Give a new url base => force a reconnect on the new URL
                'responseLog' : '',
                'responseRedirect' : '',
                'infoMessage' : '', //'TEST TODO <a href="http://www.apps4pro.com">site web</a> <br> avec super saut<br> <strong>Download</strong><br>'
                'currencyIsoCode' : null,
                'currencySymbol' : "\xe2\x82\xac",
                'userLanguage' : 'fr',
                'metaData' : {
                    'possibleCrms' : ["c4p", "sf"],
                    'config':{'exposeBetaFunctionalities':false},
                    'licence':'free'
                },
                'c4pToken' : 'c4pToken'
            });

            expect(mapResponse).not.toBeUndefined();
            expect(mapResponse.urlBase).toBe('new/url/base.php');

        });

        it('should get and refresh the mind map', function () {

            var isDemo = false;
            var userEmail = 'test@free.fr';
            var userPassword = 'secret';
            var c4pToken = 'c4pToken';
            var keepCrmLogin = true;
            var userFeedback = {
                company_name: '',
                phone: '',
                feedback: '',
                star: ''
            };
            var appVersion = '00S00';
            var mapResponse = null;
            var timeStart = null;

            runs(function () {
                srvData.loginUser(isDemo, userEmail, userPassword, c4pToken, keepCrmLogin, userFeedback, appVersion)
                    .then(function () {
                    }, function (response) {
                        mapResponse = response;
                    });

                // SrvDataTransfer should have received a dataRequest
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlData);
                expect(srvDataTransfer.pendingSends[0].params.login).toBe(userEmail);
                expect(srvDataTransfer.pendingSends[0].params.password).toBe(userPassword);
                expect(srvDataTransfer.pendingSends[0].params.rememberPassword).toBe(keepCrmLogin);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.fifo).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.company_name).toBe(userFeedback.company_name);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.phone).toBe(userFeedback.phone);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.feedback).toBe(userFeedback.feedback);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.star).toBe(userFeedback.star);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.name).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.cordova).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.platform).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.version).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.appVersion).toBe(appVersion);
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'error' : '',
                    'responseOK' : true,
                    'responseRight' : '11',
                    'urlBase' : srvConfig.c4pUrlBase,// Must be the same or srvData will force a reconnect on this new URL
                    'responseLog' : '',
                    'responseRedirect' : '',
                    'infoMessage' : '', //'TEST TODO <a href="http://www.apps4pro.com">site web</a> <br> avec super saut<br> <strong>Download</strong><br>'
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'metaData' : {
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false},
                        'licence':'free'
                    },
                    'c4pToken' : 'c4pToken'
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                srvData.downloadFullMap(c4pToken)
                    .then(function (fullmap) {
                    }, function (response) {
                        mapResponse = response;
                    });
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);

                // SrvDataTransfer should have received a dataRequest
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlFullMap);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'responseOK' : true,
                    'success' : true,
                    'log' : 'SfFullMap done.',
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'nextLastUpdate' : null,
                    'userId' : {'sf_id' : '005i0000000I8c5AAC'},
                    'metaData' : {
                        'licence':'free',
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false}
                    },
                    'map' : angular.copy(c4p.Demo),
                    'recent' : {},
                    'layout' : {},
                    'model' : {}
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                expect(mapResponse).toBeNull();
                expect(srvData.currentItems.Contact.length).toBe(38);
                expect(srvData.currentItems.Account.length).toBe(16);
                expect(srvData.currentItems.Event.length).toBe(21);
                expect(srvData.currentItems.Document.length).toBe(11);
                expect(srvData.currentItems.Opportunity.length).toBe(31);
                expect(srvData.currentItems.Facet.length).toBe(1);

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);

                // We need to download 10 documents to empty pending requests

                // 00Pi0000000KnMpEAK : demo_pict1.jpg
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-02Z.jpg');
                srvFileTransfer.ackRecv("File test data");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // 00Pi0000000KnMzEAK : demo_sec_cv.pdf
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-030.pdf');
                srvFileTransfer.ackRecv("File test data");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // 00Pi0000000KnMuEAK : demo_contract_1.doc
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-031.doc');
                srvFileTransfer.ackRecv("File test data");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_001 : demo_ceo_welcome.mp4
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-032.mp4');
                srvFileTransfer.ackRecv("File test data 4");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_002 : demo_business_effort.xls
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-033.xls');
                srvFileTransfer.ackRecv("File test data 5");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_003 : demo_cv1.pdf
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-034.pdf');
                srvFileTransfer.ackRecv("File test data 6");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_004 : demo_doc_cv1.doc
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-035.doc');
                srvFileTransfer.ackRecv("File test data 7");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_005 : demo_hr_app.ppt
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-036.ppt');
                srvFileTransfer.ackRecv("File test data 8");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_006 : demo_p_why_apps4pro.ppt
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-037.ppt');
                srvFileTransfer.ackRecv("File test data 9");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_007 : demo_tab1.xls
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-038.xls');
                srvFileTransfer.ackRecv("File test data 10");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // DUMMY_SF_ID_008 : demo_test_img.jpg
                expect(srvFileTransfer.pendingRecvs.length).toBe(1);
                expect(srvFileTransfer.pendingRecvs[0].url).toMatch(srvConfig.c4pUrlDownload);
                expect(srvFileTransfer.pendingRecvs[0].filePath).toBe('/a4p/c4p/doc/sf/Document-039.jpg');
                srvFileTransfer.ackRecv("File test data 11");
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // Full network pending status
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);
                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);

                // SrvDataTransfer should have received a dataRequest to create Facet 'Favorites'
                expect(srvData.savingObject.action).toBe('create');
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlSfCreate);
                expect(srvDataTransfer.pendingSends[0].params.type).toBe('Facet');
                expect(srvDataTransfer.pendingSends[0].params.id).toBe('Facet-03J');
                expect(srvDataTransfer.pendingSends[0].params.created.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].params.created[0].crm).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.created[0].id).toBeUndefined();
                expect(srvDataTransfer.pendingSends[0].params.fields.a4p_type).toBe('Facet');
                expect(srvDataTransfer.pendingSends[0].params.fields.name).toBe('Favorites');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response : created[i].id = send.params.created[i].crm+'_ID_'+send.params.id
                srvDataTransfer.ackSend();
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();

                expect(srvFileTransfer.pendingSends.length).toBe(0);
                expect(srvFileTransfer.pendingRecvs.length).toBe(0);
                expect(srvDataTransfer.pendingSends.length).toBe(0);
                expect(srvDataTransfer.pendingRecvs.length).toBe(0);

                // We need a FULL mindmap before refresh to set idDemo correctly for example.

                mapResponse = null;
                srvData.refreshFullMap(c4pToken)
                    .then(function (refreshMap) {
                    }, function (response) {
                        mapResponse = response;
                    });

                // SrvDataTransfer should have received a dataRequest
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlRefreshMap);// c4p_refreshMap.php
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBe(c4pToken);
                // Send response

                srvDataTransfer.ackSend({
                    'error' : '',
                    'responseOK' : true,
                    'responseLog' : '',
                    'responseRedirect' : '',
                    'responseUpdate':{
                        updates:[
                            {
                                "a4p_type":"Contact",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"005i0000000I8cAAAS"
                                        },
                                        data:{
                                            "account_id":"",
                                            "manager_id":"",
                                            "assigned_contact_id":"",
                                            "description":"I�m here to help you get started with Chatter. I�ll introduce you to features, create sample posts, and suggest tips and best practices.  I'm an automated user so you don't need to worry about privacy! I can't see any of your posts or files.  If I'm too noisy, have your admin or moderator deactivate me and I'll stop posting.",
                                            "primary_address_city":"San Francisco",
                                            "primary_address_country":"USA",
                                            "primary_address_state":"CA",
                                            "primary_address_street":"primary_address_street changed",
                                            "primary_address_zipcode":"94105",
                                            "alt_address_city":"",
                                            "alt_address_country":"",
                                            "alt_address_state":"",
                                            "alt_address_street":"",
                                            "alt_address_zipcode":"",
                                            "email":"email changed",
                                            "email_home":"",
                                            "email_list":"",
                                            "email_other":"",
                                            "phone_fax":"",
                                            "phone_house":"",
                                            "phone_mobile":"",
                                            "phone_other":"",
                                            "phone_work":"",
                                            "salutation":"",
                                            "title":"",
                                            "first_name":"",
                                            "last_name":"Chatter Expert",
                                            "contact_type":"User",
                                            "created_by_id":"005i0000000I8c5AAC",
                                            "created_date":"2013-02-28T13:18:19Z",
                                            "last_modified_by_id":"005i0000000I8c5AAC",
                                            "last_modified_date":"2013-02-28T13:18:19Z"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type":"Contact",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"003i00000030XVDAA2"
                                        },
                                        data:{
                                            "account_id":"001i0000003TYrKAAW",
                                            "manager_id":"",
                                            "assigned_contact_id":"005i0000000I8c5AAC",
                                            "description":"",
                                            "primary_address_city":"",
                                            "primary_address_country":"",
                                            "primary_address_state":"",
                                            "primary_address_street":"313 Constitution Place  Austin, TX 78767  USA",
                                            "primary_address_zipcode":"primary_address_zipcode changed",
                                            "alt_address_city":"",
                                            "alt_address_country":"",
                                            "alt_address_state":"",
                                            "alt_address_street":"",
                                            "alt_address_zipcode":"",
                                            "email":"",
                                            "email_home":"",
                                            "email_list":"",
                                            "email_other":"",
                                            "phone_fax":"(512) 757-9000",
                                            "phone_house":"",
                                            "phone_mobile":"(512) 757-9340",
                                            "phone_other":"",
                                            "phone_work":"(512) 757-6000",
                                            "salutation":"Ms.",
                                            "title":"SVP, Procurement",
                                            "first_name":"",
                                            "last_name":"Amina De Verneuil",
                                            "contact_type":"Contact",
                                            "birthday":"1961-02-10",
                                            "department":"department changed",
                                            "assistant_name":"",
                                            "assistant_phone":"",
                                            "lead_source":"Trade Show",
                                            "created_by_id":"005i0000000I8c5AAC",
                                            "created_date":"2013-02-28 15:18:05",
                                            "last_modified_by_id":"005i0000000I8c5AAC",
                                            "last_modified_date":"2013-03-19 15:17:37"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type":"Account",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"001i0000005MiYuAAK"
                                        },
                                        data:{
                                            "company_name":"company_name changed",
                                            "parent_id":"",
                                            "assigned_contact_id":"005i0000000I8c5AAC",
                                            "description":"",
                                            "bil_addr_city":"",
                                            "bil_addr_country":"",
                                            "bil_addr_state":"",
                                            "bil_addr_street":"",
                                            "bil_addr_postal_code":"",
                                            "annual_revenue":"0",
                                            "nb_employees":"0",
                                            "industry":"",
                                            "fax":"",
                                            "phone":"",
                                            "sic":"",
                                            "type":"",
                                            "web_url":"",
                                            "created_by_id":"005i0000000I8c5AAC",
                                            "created_date":"2013-03-19 15:11:10",
                                            "last_modified_by_id":"005i0000000I8c5AAC",
                                            "last_modified_date":"2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            }
                        ],
                        deletes:[
                            {
                                "a4p_type":"Contact",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"003i0000005LJ6aAAG"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type":"Contact",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"003i00000030XVRAA2"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type":"Account",
                                "crmObjects":[
                                    {
                                        crmId:{
                                            "crm":"sf",
                                            "id":"001i0000003TYrSAAW"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    'metaData' : {
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false},
                        'licence':'free'
                    }
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                expect(mapResponse).toBeNull();
                expect(srvData.currentItems.Contact.length).toBe(38 - 2);
                expect(srvData.currentItems.Account.length).toBe(16 - 1);
                expect(srvData.currentItems.Event.length).toBe(21);
                expect(srvData.currentItems.Document.length).toBe(11);
                expect(srvData.currentItems.Opportunity.length).toBe(31);
                expect(srvData.currentItems.Facet.length).toBe(1);

            });

        });

        it('should get 2 full mind maps with C4P/SF data updated and with IOS data unchanged', function () {

            var isDemo = false;
            var userEmail = 'test@free.fr';
            var userPassword = 'secret';
            var c4pToken = 'c4pToken';
            var keepCrmLogin = true;
            var userFeedback = {
                company_name: '',
                phone: '',
                feedback: '',
                star: ''
            };
            var appVersion = '00S00';
            var mapResponse = null;
            var timeStart = null;

            runs(function () {
                srvData.loginUser(isDemo, userEmail, userPassword, c4pToken, keepCrmLogin, userFeedback, appVersion)
                    .then(function () {
                    }, function (response) {
                        mapResponse = response;
                    });

                // SrvDataTransfer should have received a dataRequest
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlData);
                expect(srvDataTransfer.pendingSends[0].params.login).toBe(userEmail);
                expect(srvDataTransfer.pendingSends[0].params.password).toBe(userPassword);
                expect(srvDataTransfer.pendingSends[0].params.rememberPassword).toBe(keepCrmLogin);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.fifo).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.company_name).toBe(userFeedback.company_name);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.phone).toBe(userFeedback.phone);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.feedback).toBe(userFeedback.feedback);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.feedback.star).toBe(userFeedback.star);
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.name).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.cordova).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.platform).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.device.version).toBe('');
                expect(srvDataTransfer.pendingSends[0].params.serverUpdates.appVersion).toBe(appVersion);
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'error' : '',
                    'responseOK' : true,
                    'responseRight' : '11',
                    'urlBase' : srvConfig.c4pUrlBase,// Must be the same or srvData will force a reconnect on this new URL
                    'responseLog' : '',
                    'responseRedirect' : '',
                    'infoMessage' : '', //'TEST TODO <a href="http://www.apps4pro.com">site web</a> <br> avec super saut<br> <strong>Download</strong><br>'
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'metaData' : {
                        'licence':'free',
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false}
                    },
                    'c4pToken' : 'c4pToken'
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {

                // First Fullmap

                srvData.downloadFullMap(c4pToken)
                    .then(function (fullmap) {
                    }, function (response) {
                        mapResponse = response;
                    });
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);
                // SrvDataTransfer should have received a dataRequest to download the fullmap
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlFullMap);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'responseOK' : true,
                    'success' : true,
                    'log' : 'SfFullMap done.',
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'nextLastUpdate' : null,
                    'userId' : {'sf_id' : '005i0000000I8c5AAC'},
                    'metaData' : {
                        'licence':'free',
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false}
                    },
                    'map' : {
                        "index": {
                            "sf": {
                                "005i0000000I8c5AAC": 0,
                                "001i0000005MiYuAAK": 1
                            },
                            "c4p": {
                                "C4PID0123": 2
                            }
                        },
                        "objects": [
                            {
                                "a4p_type": "Contact",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "005i0000000I8c5AAC",
                                            "crm": "sf"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "005i0000000I8c5AAC",
                                            "account_id": "",
                                            "manager_id": "",
                                            "assigned_contact_id": "",
                                            "description": "",
                                            "primary_address_city": "",
                                            "primary_address_country": "FR",
                                            "primary_address_state": "A3",
                                            "primary_address_street": "",
                                            "primary_address_zipcode": "37000",
                                            "alt_address_city": "",
                                            "alt_address_country": "",
                                            "alt_address_state": "",
                                            "alt_address_street": "",
                                            "alt_address_zipcode": "",
                                            "email": "applog100@gmail.com",
                                            "email_home": "",
                                            "email_list": "",
                                            "email_other": "",
                                            "phone_fax": "",
                                            "phone_house": "",
                                            "phone_mobile": "",
                                            "phone_other": "",
                                            "phone_work": "",
                                            "salutation": "",
                                            "title": "",
                                            "first_name": "Balthazar",
                                            "last_name": "Zemettier",
                                            "contact_type": "User",
                                            "created_by_id": "005i0000000I8c5AAC",
                                            "created_date": "2013-02-28T13:18:05Z",
                                            "last_modified_by_id": "005i0000000I8c5AAC",
                                            "last_modified_date": "2013-04-10T11:49:56Z"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type": "Account",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "001i0000005MiYuAAK",
                                            "crm": "sf"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "001i0000005MiYuAAK",
                                            "company_name": "Orpkick",
                                            "parent_id": "",
                                            "assigned_contact_id": "005i0000000I8c5AAC",
                                            "description": "",
                                            "bil_addr_city": "",
                                            "bil_addr_country": "",
                                            "bil_addr_state": "",
                                            "bil_addr_street": "",
                                            "bil_addr_postal_code": "",
                                            "annual_revenue": "0",
                                            "nb_employees": "0",
                                            "industry": "",
                                            "fax": "",
                                            "phone": "",
                                            "sic": "",
                                            "type": "",
                                            "web_url": "",
                                            "created_by_id": "005i0000000I8c5AAC",
                                            "created_date": "2013-03-19 15:11:10",
                                            "last_modified_by_id": "005i0000000I8c5AAC",
                                            "last_modified_date": "2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type": "Facet",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "C4PID0123",
                                            "crm": "c4p"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "C4PID0123",
                                            "prefix": "",
                                            "name": "Favorites",
                                            "description": "",
                                            "parent_id":{},
                                            "facets_ids":[],
                                            "items_ids":[{
                                                "dbid":"dummy",
                                                "sf_id":"005i0000000I8c5AAC"
                                            }, {
                                                "dbid":"dummy",
                                                "sf_id":"001i0000005MiYuAAK"
                                            }],
                                            "created_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "created_date": "2013-03-19 15:11:10",
                                            "last_modified_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "last_modified_date": "2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    'recent' : {},
                    'layout' : {},
                    'model' : {}
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                expect(mapResponse).toBeNull();
                expect(srvData.currentItems.Contact.length).toBe(1);
                expect(srvData.currentItems.Contact[0].id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].email).toBe("applog100@gmail.com");
                expect(srvData.currentItems.Contact[0].phone_work).toBe("");
                expect(srvData.currentItems.Contact[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Account.length).toBe(1);
                expect(srvData.currentItems.Account[0].id.sf_id).toBe("001i0000005MiYuAAK");
                expect(srvData.currentItems.Account[0].company_name).toBe("Orpkick");
                expect(srvData.currentItems.Account[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Account[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet.length).toBe(1);
                expect(srvData.currentItems.Facet[0].id.c4p_id).toBe("C4PID0123");
                expect(srvData.currentItems.Facet[0].name).toBe("Favorites");
                expect(srvData.currentItems.Facet[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");

                // Simulate srvData.downloadDevice() : a Contact import from IOS agenda

                var iosContact = srvData.createObject('Contact', {
                    id:{ios_id:"IOSID001"},
                    editable:false,
                    salutation:'',
                    first_name:'Cyrille',
                    last_name:'Charron',
                    description:''
                });
                checkObject(iosContact, {
                    salutation: '',
                    first_name: 'Cyrille',
                    last_name: 'Charron',
                    description: '',
                    a4p_type: 'Contact',
                    contact_type: 'Contact',
                    id: {
                        dbid: 'Contact-004',
                        ios_id: 'IOSID001',
                        sf_id: undefined,
                        c4p_id: undefined
                    },
                    created_by_id: {
                        id: undefined
                    },
                    last_modified_by_id: {
                        id: undefined
                    },
                    created_date: {},// {} will check defined without checking value
                    last_modified_date: {}// {} will check defined without checking value
                });

                srvData.addObject(iosContact, true);
                expect(srvData.currentItems.Contact.length).toBe(2);
                expect(srvData.currentItems.Contact[0].id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].email).toBe("applog100@gmail.com");
                expect(srvData.currentItems.Contact[0].phone_work).toBe("");
                expect(srvData.currentItems.Contact[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[1].id.ios_id).toBe("IOSID001");
                expect(srvData.currentItems.Contact[1].first_name).toBe("Cyrille");
                expect(srvData.currentItems.Contact[1].last_name).toBe("Charron");
                expect(srvData.currentItems.Account.length).toBe(1);
                expect(srvData.currentItems.Account[0].id.sf_id).toBe("001i0000005MiYuAAK");
                expect(srvData.currentItems.Account[0].company_name).toBe("Orpkick");
                expect(srvData.currentItems.Account[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Account[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet.length).toBe(1);
                expect(srvData.currentItems.Facet[0].id.c4p_id).toBe("C4PID0123");
                expect(srvData.currentItems.Facet[0].name).toBe("Favorites");
                expect(srvData.currentItems.Facet[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].items_ids.length).toBe(2);
                expect(srvData.currentItems.Facet[0].items_ids[0].dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].items_ids[0].sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].items_ids[1].dbid).toBe("Account-002");
                expect(srvData.currentItems.Facet[0].items_ids[1].sf_id).toBe("001i0000005MiYuAAK");

                // Second Fullmap : update of C4P/SF crms and no change in IOS crm

                srvData.downloadFullMap(c4pToken)
                    .then(function (fullmap) {
                    }, function (response) {
                        mapResponse = response;
                    });
                expect(srvData.savingObject.action).toBeUndefined();
                expect(srvData.savingObject.dbid).toBeUndefined();
                expect(srvData.objectsToSave.length).toBe(0);
                expect(srvData.objectsToDownload.length).toBe(0);
                // SrvDataTransfer should have received a dataRequest to download the fullmap
                expect(srvDataTransfer.pendingSends.length).toBe(1);
                expect(srvDataTransfer.pendingSends[0].url).toBe(srvConfig.c4pUrlFullMap);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms.length).toBe(2);
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[0]).toBe('c4p');
                expect(srvDataTransfer.pendingSends[0].params.askedCrms[1]).toBe('sf');
                expect(srvDataTransfer.pendingSends[0].params.c4pToken).not.toBeUndefined();
                // Send response
                srvDataTransfer.ackSend({
                    'responseOK' : true,
                    'success' : true,
                    'log' : 'SfFullMap done.',
                    'currencyIsoCode' : null,
                    'currencySymbol' : "\xe2\x82\xac",
                    'userLanguage' : 'fr',
                    'nextLastUpdate' : null,
                    'userId' : {'sf_id' : '005i0000000I8c5AAC'},
                    'metaData' : {
                        'licence':'free',
                        'possibleCrms' : ["c4p", "sf"],
                        'config':{'exposeBetaFunctionalities':false}
                    },
                    'map' : {
                        "index": {
                            "sf": {
                                "005i0000000I8c5AAC": 0,
                                "SFID0456": 1
                            },
                            "c4p": {
                                "C4PID0123": 2,
                                "C4PID0124": 3
                            }
                        },
                        "objects": [
                            {
                                "a4p_type": "Contact",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "005i0000000I8c5AAC",
                                            "crm": "sf"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "005i0000000I8c5AAC",
                                            "account_id": "",
                                            "manager_id": "",
                                            "assigned_contact_id": "",
                                            "description": "",
                                            "primary_address_city": "",
                                            "primary_address_country": "FR",
                                            "primary_address_state": "A3",
                                            "primary_address_street": "",
                                            "primary_address_zipcode": "37000",
                                            "alt_address_city": "",
                                            "alt_address_country": "",
                                            "alt_address_state": "",
                                            "alt_address_street": "",
                                            "alt_address_zipcode": "",
                                            "email": "applog101@gmail.com",
                                            "email_home": "",
                                            "email_list": "",
                                            "email_other": "",
                                            "phone_fax": "",
                                            "phone_house": "",
                                            "phone_mobile": "",
                                            "phone_other": "",
                                            "phone_work": "0123456789",
                                            "salutation": "",
                                            "title": "",
                                            "first_name": "Balthazar",
                                            "last_name": "Zemettier",
                                            "contact_type": "User",
                                            "created_by_id": "005i0000000I8c5AAC",
                                            "created_date": "2013-02-28T13:18:05Z",
                                            "last_modified_by_id": "005i0000000I8c5AAC",
                                            "last_modified_date": "2013-04-10T11:49:56Z"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type": "Account",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "SFID0456",
                                            "crm": "sf"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "SFID0456",
                                            "company_name": "NewAccount",
                                            "parent_id": "",
                                            "assigned_contact_id": "005i0000000I8c5AAC",
                                            "description": "",
                                            "bil_addr_city": "",
                                            "bil_addr_country": "",
                                            "bil_addr_state": "",
                                            "bil_addr_street": "",
                                            "bil_addr_postal_code": "",
                                            "annual_revenue": "0",
                                            "nb_employees": "0",
                                            "industry": "",
                                            "fax": "",
                                            "phone": "",
                                            "sic": "",
                                            "type": "",
                                            "web_url": "",
                                            "created_by_id": "005i0000000I8c5AAC",
                                            "created_date": "2013-03-19 15:11:10",
                                            "last_modified_by_id": "005i0000000I8c5AAC",
                                            "last_modified_date": "2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type": "Facet",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "C4PID0123",
                                            "crm": "c4p"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "C4PID0123",
                                            "prefix": "",
                                            "name": "Favorites",
                                            "description": "",
                                            "parent_id":{},
                                            "facets_ids":[],
                                            "items_ids":[{
                                                "dbid":"dummy",
                                                "sf_id":"005i0000000I8c5AAC"
                                            }],
                                            "created_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "created_date": "2013-03-19 15:11:10",
                                            "last_modified_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "last_modified_date": "2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            },
                            {
                                "a4p_type": "Facet",
                                "crmObjects": [
                                    {
                                        "crmId":{
                                            "id": "C4PID0124",
                                            "crm": "c4p"
                                        },
                                        "editable": true,
                                        "data": {
                                            "id": "C4PID0124",
                                            "prefix": "",
                                            "name": "nepal",
                                            "description": "",
                                            "parent_id":{
                                                "dbid":"dummy",
                                                "c4p_id":"C4PID0123"
                                            },
                                            "facets_ids":[],
                                            "items_ids":[{
                                                "dbid":"dummy",
                                                "sf_id":"SFID0456"
                                            }],
                                            "created_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "created_date": "2013-03-19 15:11:10",
                                            "last_modified_by_id": {
                                                "sf_id":"005i0000000I8c5AAC"
                                            },
                                            "last_modified_date": "2013-03-19 15:11:10"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    'recent' : {},
                    'layout' : {},
                    'model' : {}
                });
                timeStart = new Date().getTime();
            });

            waitsFor(function () {return ((new Date().getTime() - timeStart) > 1000);}, "wait for 1 s", 2000);

            runs(function () {
                expect(mapResponse).toBeNull();
                expect(srvData.currentItems.Contact.length).toBe(2);
                expect(srvData.currentItems.Contact[0].id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].email).toBe("applog101@gmail.com");
                expect(srvData.currentItems.Contact[0].phone_work).toBe("0123456789");
                expect(srvData.currentItems.Contact[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Contact[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Contact[1].id.ios_id).toBe('IOSID001');
                expect(srvData.currentItems.Contact[1].first_name).toBe('Cyrille');
                expect(srvData.currentItems.Contact[1].last_name).toBe('Charron');
                expect(srvData.currentItems.Account.length).toBe(1);
                expect(srvData.currentItems.Account[0].id.sf_id).toBe("SFID0456");
                expect(srvData.currentItems.Account[0].company_name).toBe("NewAccount");
                expect(srvData.currentItems.Account[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Account[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Account[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet.length).toBe(2);
                expect(srvData.currentItems.Facet[0].id.c4p_id).toBe("C4PID0123");
                expect(srvData.currentItems.Facet[0].name).toBe("Favorites");
                expect(srvData.currentItems.Facet[0].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[0].items_ids.length).toBe(1);
                expect(srvData.currentItems.Facet[0].items_ids[0].dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[0].items_ids[0].sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[1].id.c4p_id).toBe("C4PID0124");
                expect(srvData.currentItems.Facet[1].name).toBe("nepal");
                expect(srvData.currentItems.Facet[1].created_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[1].created_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[1].last_modified_by_id.dbid).toBe("Contact-001");
                expect(srvData.currentItems.Facet[1].last_modified_by_id.sf_id).toBe("005i0000000I8c5AAC");
                expect(srvData.currentItems.Facet[1].items_ids.length).toBe(1);
                expect(srvData.currentItems.Facet[1].items_ids[0].dbid).toBe("Account-005");
                expect(srvData.currentItems.Facet[1].items_ids[0].sf_id).toBe("SFID0456");

            });

        });

    });

});

/*
 describe('DummyService', function () {

 var dummyService, httpBackend, httpService, srvLoad, srvLocalStorage, srvLocale;

 beforeEach(inject(function ($injector) {
 var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
 httpBackend = $injector.get('$httpBackend');
 httpService = $injector.get('$http');
 srvLoad = new SrvLoad();//$injector.get('srvLoad');
 srvLocalStorage = new LocalStorage();//$injector.get('srvLocalStorage');
 srvLocale = new MockLocale();//$injector.get('srvLocale');

 dummyService = new DummyService(httpService, srvLoad, srvLocalStorage, srvLocale);

 }));

 afterEach(function () {
 httpBackend.verifyNoOutstandingExpectation();
 httpBackend.verifyNoOutstandingRequest();
 });

 it('should be correctly initialized', function () {
 expect(dummyService.initDone).toEqual(false);
 dummyService.init();
 expect(dummyService.initDone).toEqual(true);
 });

 describe('initialized', function () {

 beforeEach(function () {

 dummyService.init();

 });

 it('should do something', function () {

 });

 });

 });
 */
