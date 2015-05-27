

describe('SrvFacet', function () {
'use strict';

    var srvSynchro, deferService, exceptionHandlerService,
        srvRunning, srvConfig, srvLog, srvSecurity, srvLocale,
        srvLocalStorage, srvAnalytics, srvDataTransfer, srvFileTransfer, srvFileStorage,
        srvData, srvFacet;
    var answers = [];
    var ok = false;
    var data = null;
    var error = null;
    var done = false;

    beforeEach(module('c4p.services'));

    beforeEach(function () {
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
        srvFacet = new SrvFacet(srvData, srvLocale, srvConfig);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.objects);
        //srvFacet.addPossibleOrganizerFacet(c4p.Organizer.recents);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.top20);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.mine);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.favorites);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.biblio);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.month);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.week);
        srvFacet.addPossibleOrganizerFacet(c4p.Organizer.fileDir);

        runs(function () {
            var fileStorageType = null;
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
            expect(ok).toBe(true);
            expect(error).toBeNull();

            answers = [];
            srvSynchro.init();

            // Force a reset of dbid generation
            a4p.uid = ['0', '0', '0'];

            expect(srvData.initDone).toBe(false);

            srvData.init();

            // data service should be empty

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

            // facet service should be empty

            srvFacet.toggleCaseSensitive();
            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(true);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(0);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(0);
            expect(srvFacet.items.lists['Account'].length).toBe(0);
            expect(srvFacet.items.lists['Event'].length).toBe(0);
            expect(srvFacet.items.lists['Opportunity'].length).toBe(0);
            expect(srvFacet.items.lists['Document'].length).toBe(0);
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Note'].length).toBe(0);
            expect(srvFacet.items.lists['Report'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            // Create the Owner (srvData.userId.sf_id)
            expect(srvData.getObject('Contact-001')).toBeUndefined();
            var owner = srvData.createObject('Contact', {
                id: {sf_id: srvData.userId.sf_id},
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'erlwan'
            });
            srvData.addObject(owner);
            expect(owner.id.dbid).toBe('Contact-001');
            expect(srvData.currentItems['Contact'].length).toBe(1);
            expect(srvData.nbObjects).toBe(1);

            // Create some other objects
            srvData.addObject(srvData.createObject('Contact', {
                id: {sf_id: "Contact002"},
                salutation: 'Mr.',
                first_name: 'Adiz',
                last_name: 'Erlwon'
            }));
            srvData.addObject(srvData.createObject('Account', {
                id: {sf_id: "Account001"},
                company_name: 'erlwan'
            }));
            srvData.addObject(srvData.createObject('Account', {
                id: {sf_id: "Account002"},
                company_name: 'Erlwon'
            }));
            srvData.addObject(srvData.createObject('Event', {
                id: {sf_id: "Event001"},
                name: 'erlwan'
            }));
            srvData.addObject(srvData.createObject('Event', {
                id: {sf_id: "Event002"},
                name: 'Erlwon'
            }));
            srvData.addObject(srvData.createObject('Opportunity', {
                id: {sf_id: "Opportunity001"},
                name: 'erlwan'
            }));
            srvData.addObject(srvData.createObject('Opportunity', {
                id: {sf_id: "Opportunity002"},
                name: 'Erlwon'
            }));
            srvData.addObject(srvData.createObject('Document', {
                id: {sf_id: "Document001"},
                name: 'erlwan.doc',
                path: '/a4p/c4p/doc/sf/',
                filePath:'/a4p/c4p/doc/sf/erlwan.doc'
            }));
            srvData.addObject(srvData.createObject('Document', {
                id: {sf_id: "Document002"},
                name: 'Erlwon.pdf',
                path: '/a4p/c4p/doc/sf/',
                filePath:'/a4p/c4p/doc/sf/Erlwon.pdf'
            }));
            srvData.addObject(srvData.createObject('Note', {
                id: {c4p_id: "Note001"},
                title: 'erlwan',
                message: 'message'
            }));
            srvData.addObject(srvData.createObject('Note', {
                id: {c4p_id: "Note002"},
                title: 'Erlwon',
                message: 'message'
            }));
            srvData.addObject(srvData.createObject('Report', {
                id: {c4p_id: "Report001"},
                title: 'erlwan',
                message: 'message'
            }));
            srvData.addObject(srvData.createObject('Report', {
                id: {c4p_id: "Report002"},
                title: 'Erlwon',
                message: 'message'
            }));

            srvFacet.updateItems();

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(true);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('Erlwon');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

        });

    }));

    afterEach(function () {
        expect(srvDataTransfer.pendingSends.length).toBe(0);
        expect(srvDataTransfer.pendingRecvs.length).toBe(0);
        expect(srvFileTransfer.pendingSends.length).toBe(0);
        expect(srvFileTransfer.pendingRecvs.length).toBe(0);
    });

    describe('Creating the Owner and some other objects', function () {

        it('should manage order, case sensitivity and search', function () {

            srvFacet.toggleOrder();

            expect(srvFacet.ascendingOrder).toBe(false);
            expect(srvFacet.caseSensitive).toBe(true);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Tasks');
            expect(srvFacet.items.keyes[1].title).toBe('Tags');
            expect(srvFacet.items.keyes[2].title).toBe('Reports');
            expect(srvFacet.items.keyes[3].title).toBe('Plans');
            expect(srvFacet.items.keyes[4].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Leads');
            expect(srvFacet.items.keyes[7].title).toBe('Events');
            expect(srvFacet.items.keyes[8].title).toBe('Documents');
            expect(srvFacet.items.keyes[9].title).toBe('Contacts');
            expect(srvFacet.items.keyes[10].title).toBe('Accounts');
            expect(srvFacet.items.keyes[0].value).toBe('Task');
            expect(srvFacet.items.keyes[1].value).toBe('Facet');
            expect(srvFacet.items.keyes[2].value).toBe('Report');
            expect(srvFacet.items.keyes[3].value).toBe('Plan');
            expect(srvFacet.items.keyes[4].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Lead');
            expect(srvFacet.items.keyes[7].value).toBe('Event');
            expect(srvFacet.items.keyes[8].value).toBe('Document');
            expect(srvFacet.items.keyes[9].value).toBe('Contact');
            expect(srvFacet.items.keyes[10].value).toBe('Account');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('Erlwon');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.toggleCaseSensitive();

            expect(srvFacet.ascendingOrder).toBe(false);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Tasks');
            expect(srvFacet.items.keyes[1].title).toBe('Tags');
            expect(srvFacet.items.keyes[2].title).toBe('Reports');
            expect(srvFacet.items.keyes[3].title).toBe('Plans');
            expect(srvFacet.items.keyes[4].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Leads');
            expect(srvFacet.items.keyes[7].title).toBe('Events');
            expect(srvFacet.items.keyes[8].title).toBe('Documents');
            expect(srvFacet.items.keyes[9].title).toBe('Contacts');
            expect(srvFacet.items.keyes[10].title).toBe('Accounts');
            expect(srvFacet.items.keyes[0].value).toBe('Task');
            expect(srvFacet.items.keyes[1].value).toBe('Facet');
            expect(srvFacet.items.keyes[2].value).toBe('Report');
            expect(srvFacet.items.keyes[3].value).toBe('Plan');
            expect(srvFacet.items.keyes[4].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Lead');
            expect(srvFacet.items.keyes[7].value).toBe('Event');
            expect(srvFacet.items.keyes[8].value).toBe('Document');
            expect(srvFacet.items.keyes[9].value).toBe('Contact');
            expect(srvFacet.items.keyes[10].value).toBe('Account');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('Erlwon');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.toggleOrder();

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('Erlwon');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.setFilterQuery('wan');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('wan');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(7);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(1);
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'].length).toBe(1);
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'].length).toBe(1);
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(1);
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Document'].length).toBe(1);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Note'].length).toBe(1);
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'].length).toBe(1);
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('erlwan');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.setFilterQuery('wan.doc');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('wan.doc');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(1);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Document'].length).toBe(1);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.setFilterQuery('');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('Erlwon');
            // Notes and Reports are not categorized by type facet
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.addFacet('objects', 'Document', 'Document');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('objects');
            expect(srvFacet.filterFacets[0].value).toBe('Document');
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.filterFacets[0].items.length).toBe(2);
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('doc');
            expect(srvFacet.items.keyes[1].value).toBe('pdf');
            expect(srvFacet.items.lists['doc'].length).toBe(1);
            expect(srvFacet.items.lists['doc'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['pdf'].length).toBe(1);
            expect(srvFacet.items.lists['pdf'][0].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.addFacet('objects', 'doc', 'doc');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('objects');
            expect(srvFacet.filterFacets[0].value).toBe('Document');
            expect(srvFacet.filterFacets[1].key).toBe('objects');
            expect(srvFacet.filterFacets[1].value).toBe('doc');
            expect(srvFacet.filterFacets[1].items.length).toBe(1);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(0);
            expect(srvFacet.items.others.length).toBe(1);
            expect(srvFacet.items.others[0].object.name).toBe('erlwan.doc');

        });

        it('should manage fileDir facet', function () {

            srvFacet.toggleCaseSensitive();
            srvFacet.setFacet('fileDir');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe('/a4p');
            expect(srvFacet.items.lists['/a4p'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['/a4p'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(12);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[2].object.name).toBe('erlwan');
            expect(srvFacet.items.others[3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[3].object.title).toBe('erlwan');
            expect(srvFacet.items.others[4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[4].object.title).toBe('erlwan');
            expect(srvConfig.getItemName(srvFacet.items.others[5].object)).toEqual('erlwan Adiz');
            expect(srvFacet.items.others[5].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[5].object.last_name).toBe('erlwan');
            expect(srvFacet.items.others[6].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[6].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[7].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[7].object.name).toBe('Erlwon');
            expect(srvFacet.items.others[8].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[8].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[9].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[9].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.others[10].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[10].object.name).toBe('Erlwon');
            expect(srvConfig.getItemName(srvFacet.items.others[11].object)).toEqual('Erlwon Adiz');
            expect(srvFacet.items.others[11].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[11].object.last_name).toBe('Erlwon');

            srvFacet.addFacet('fileDir', '/a4p', '/a4p');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('fileDir');
            expect(srvFacet.filterFacets[0].value).toBe('/a4p');
            expect(srvFacet.filterFacets[0].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe('c4p');
            expect(srvFacet.items.lists['c4p'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['c4p'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.addFacet('fileDir', 'c4p', 'c4p');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('fileDir');
            expect(srvFacet.filterFacets[0].value).toBe('/a4p');
            expect(srvFacet.filterFacets[1].key).toBe('fileDir');
            expect(srvFacet.filterFacets[1].value).toBe('c4p');
            expect(srvFacet.filterFacets[1].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe('doc');
            expect(srvFacet.items.lists['doc'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['doc'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.addFacet('fileDir', 'doc', 'doc');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(3);
            expect(srvFacet.filterFacets[0].key).toBe('fileDir');
            expect(srvFacet.filterFacets[0].value).toBe('/a4p');
            expect(srvFacet.filterFacets[1].key).toBe('fileDir');
            expect(srvFacet.filterFacets[1].value).toBe('c4p');
            expect(srvFacet.filterFacets[2].key).toBe('fileDir');
            expect(srvFacet.filterFacets[2].value).toBe('doc');
            expect(srvFacet.filterFacets[2].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe('sf');
            expect(srvFacet.items.lists['sf'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['sf'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.addFacet('fileDir', 'sf', 'sf');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(4);
            expect(srvFacet.filterFacets[0].key).toBe('fileDir');
            expect(srvFacet.filterFacets[0].value).toBe('/a4p');
            expect(srvFacet.filterFacets[1].key).toBe('fileDir');
            expect(srvFacet.filterFacets[1].value).toBe('c4p');
            expect(srvFacet.filterFacets[2].key).toBe('fileDir');
            expect(srvFacet.filterFacets[2].value).toBe('doc');
            expect(srvFacet.filterFacets[3].key).toBe('fileDir');
            expect(srvFacet.filterFacets[3].value).toBe('sf');
            expect(srvFacet.filterFacets[3].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(0);
            expect(srvFacet.items.others.length).toBe(2);
            expect(srvFacet.items.others[0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.others[1].object.name).toBe('Erlwon.pdf');

            srvFacet.addFacet('fileDir', '', undefined);

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(5);
            expect(srvFacet.filterFacets[0].key).toBe('fileDir');
            expect(srvFacet.filterFacets[0].value).toBe('/a4p');
            expect(srvFacet.filterFacets[1].key).toBe('fileDir');
            expect(srvFacet.filterFacets[1].value).toBe('c4p');
            expect(srvFacet.filterFacets[2].key).toBe('fileDir');
            expect(srvFacet.filterFacets[2].value).toBe('doc');
            expect(srvFacet.filterFacets[3].key).toBe('fileDir');
            expect(srvFacet.filterFacets[3].value).toBe('sf');
            expect(srvFacet.filterFacets[4].key).toBe('fileDir');
            expect(srvFacet.filterFacets[4].value).toBeUndefined();
            expect(srvFacet.filterFacets[4].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('fileDir');
            expect(srvFacet.items.keyes.length).toBe(0);
            expect(srvFacet.items.others.length).toBe(2);
            expect(srvFacet.items.others[0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.others[1].object.name).toBe('Erlwon.pdf');

        });

        it('should manage time facets', function () {

            var now = new Date();
            srvFacet.toggleCaseSensitive();
            srvFacet.setFacet('month');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('month');
            expect(srvFacet.items.keyes.length).toBe(0);
            /* Objects have no more creation attribute setted by srvData
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe(now.getFullYear());
            expect(srvFacet.items.lists[now.getFullYear()][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[now.getFullYear()][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[now.getFullYear()][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[now.getFullYear()][2].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[now.getFullYear()][3].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[now.getFullYear()][4].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][5].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[now.getFullYear()][5].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists[now.getFullYear()][6].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[now.getFullYear()][6].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getFullYear()][7].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[now.getFullYear()][7].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getFullYear()][8].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[now.getFullYear()][8].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getFullYear()][9].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[now.getFullYear()][9].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getFullYear()][10].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[now.getFullYear()][10].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getFullYear()][11].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[now.getFullYear()][11].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists[now.getFullYear()][12].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[now.getFullYear()][12].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getFullYear()][13].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[now.getFullYear()][13].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.others.length).toBe(0);
            */

            srvFacet.addFacet('month', now.getFullYear(), now.getFullYear());

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('month');
            expect(srvFacet.filterFacets[0].value).toBe(now.getFullYear());
            expect(srvFacet.lastFacetKey).toBe('month');
            var monthName = srvLocale.translations.htmlMonth['' + now.getMonth()];
            /* Objects have no more creation attribute setted by srvData
            expect(srvFacet.filterFacets[0].items.length).toBe(14);
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe(monthName);
            expect(srvFacet.items.lists[monthName][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[monthName][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[monthName][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[monthName][2].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[monthName][3].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[monthName][4].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][5].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[monthName][5].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists[monthName][6].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[monthName][6].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[monthName][7].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[monthName][7].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[monthName][8].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[monthName][8].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[monthName][9].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[monthName][9].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[monthName][10].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[monthName][10].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists[monthName][11].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[monthName][11].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists[monthName][12].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[monthName][12].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists[monthName][13].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[monthName][13].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.others.length).toBe(0);
            */

            srvFacet.addFacet('month', monthName, now.getMonth());

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('month');
            expect(srvFacet.filterFacets[0].title).toBe(now.getFullYear());
            expect(srvFacet.filterFacets[0].value).toBe(now.getFullYear());
            expect(srvFacet.filterFacets[1].key).toBe('month');
            expect(srvFacet.filterFacets[1].title).toBe(srvLocale.translations.htmlMonth['' + now.getMonth()]);
            expect(srvFacet.filterFacets[1].value).toBe(now.getMonth());
            expect(srvFacet.lastFacetKey).toBe('month');
            /* Objects have no more creation attribute setted by srvData
            expect(srvFacet.filterFacets[1].items.length).toBe(14);
            expect(srvFacet.items.keyes.length).toBe(1);
            expect(srvFacet.items.keyes[0].value).toBe(now.getDate());
            // Order is Contact[0], Contact[1], Account[0], Event[0], Opportunity[0], Report[0], Note[0], Document[0], Event[1], Account[1], Report[1], Note[1], Opportunity[1], Document[1]
            expect(srvFacet.items.lists[now.getDate()][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[now.getDate()][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[now.getDate()][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[now.getDate()][2].object.name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[now.getDate()][3].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[now.getDate()][4].object.title).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][5].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[now.getDate()][5].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists[now.getDate()][6].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists[now.getDate()][6].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getDate()][7].object.a4p_type).toBe('Report');
            expect(srvFacet.items.lists[now.getDate()][7].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getDate()][8].object.a4p_type).toBe('Event');
            expect(srvFacet.items.lists[now.getDate()][8].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getDate()][9].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists[now.getDate()][9].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getDate()][10].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists[now.getDate()][10].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists[now.getDate()][11].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists[now.getDate()][11].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists[now.getDate()][12].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[now.getDate()][12].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists[now.getDate()][13].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists[now.getDate()][13].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.others.length).toBe(0);
            */

            srvFacet.addFacet('month', now.getDate(), now.getDate());

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(3);
            expect(srvFacet.filterFacets[0].key).toBe('month');
            expect(srvFacet.filterFacets[0].value).toBe(now.getFullYear());
            expect(srvFacet.filterFacets[1].key).toBe('month');
            expect(srvFacet.filterFacets[1].title).toBe(srvLocale.translations.htmlMonth['' + now.getMonth()]);
            expect(srvFacet.filterFacets[1].value).toBe(now.getMonth());
            expect(srvFacet.filterFacets[2].key).toBe('month');
            expect(srvFacet.filterFacets[2].value).toBe(now.getDate());
            /* Objects have no more creation attribute setted by srvData
            expect(srvFacet.filterFacets[2].items.length).toBe(14);
            expect(srvFacet.items.others.length).toBe(14);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[2].object.name).toBe('erlwan');
            expect(srvFacet.items.others[3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[3].object.title).toBe('erlwan');
            expect(srvFacet.items.others[4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[4].object.title).toBe('erlwan');
            expect(srvFacet.items.others[5].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[5].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.others[6].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[6].object.name).toBe('Erlwon');
            expect(srvFacet.items.others[7].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[7].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[8].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[8].object.name).toBe('Erlwon');
            expect(srvFacet.items.others[9].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[9].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[10].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[10].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.others[11].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[11].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others[12].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[12].object.last_name).toBe('erlwan');
            expect(srvFacet.items.others[13].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[13].object.last_name).toBe('Erlwon');
            */
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(0);

            srvFacet.addFacet('objects', 'Document', 'Document');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(4);
            expect(srvFacet.filterFacets[0].key).toBe('month');
            expect(srvFacet.filterFacets[0].value).toBe(now.getFullYear());
            expect(srvFacet.filterFacets[1].key).toBe('month');
            expect(srvFacet.filterFacets[1].title).toBe(srvLocale.translations.htmlMonth['' + now.getMonth()]);
            expect(srvFacet.filterFacets[1].value).toBe(now.getMonth());
            expect(srvFacet.filterFacets[2].key).toBe('month');
            expect(srvFacet.filterFacets[2].value).toBe(now.getDate());
            expect(srvFacet.filterFacets[3].key).toBe('objects');
            expect(srvFacet.filterFacets[3].value).toBe('Document');
            /* Objects have no more creation attribute setted by srvData
            expect(srvFacet.filterFacets[3].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('doc');
            expect(srvFacet.items.keyes[1].value).toBe('pdf');
            expect(srvFacet.items.lists['doc'].length).toBe(1);
            expect(srvFacet.items.lists['doc'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['pdf'].length).toBe(1);
            expect(srvFacet.items.lists['pdf'][0].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);
            */

            srvFacet.removeFacet(0);// remove year => remove also month + dayOfMonth

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('objects');
            expect(srvFacet.filterFacets[0].value).toBe('Document');
            expect(srvFacet.filterFacets[0].items.length).toBe(2);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('doc');
            expect(srvFacet.items.keyes[1].value).toBe('pdf');
            expect(srvFacet.items.lists['doc'].length).toBe(1);
            expect(srvFacet.items.lists['doc'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['pdf'].length).toBe(1);
            expect(srvFacet.items.lists['pdf'][0].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.others.length).toBe(0);

            srvFacet.removeFacet(0);// remove objects

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('objects');
            expect(srvFacet.items.keyes.length).toBe(11);
            expect(srvFacet.items.keyes[0].title).toBe('Accounts');
            expect(srvFacet.items.keyes[1].title).toBe('Contacts');
            expect(srvFacet.items.keyes[2].title).toBe('Documents');
            expect(srvFacet.items.keyes[3].title).toBe('Events');
            expect(srvFacet.items.keyes[4].title).toBe('Leads');
            expect(srvFacet.items.keyes[5].title).toBe('Notes');
            expect(srvFacet.items.keyes[6].title).toBe('Opportunities');
            expect(srvFacet.items.keyes[7].title).toBe('Plans');
            expect(srvFacet.items.keyes[8].title).toBe('Reports');
            expect(srvFacet.items.keyes[9].title).toBe('Tags');
            expect(srvFacet.items.keyes[10].title).toBe('Tasks');
            expect(srvFacet.items.keyes[0].value).toBe('Account');
            expect(srvFacet.items.keyes[1].value).toBe('Contact');
            expect(srvFacet.items.keyes[2].value).toBe('Document');
            expect(srvFacet.items.keyes[3].value).toBe('Event');
            expect(srvFacet.items.keyes[4].value).toBe('Lead');
            expect(srvFacet.items.keyes[5].value).toBe('Note');
            expect(srvFacet.items.keyes[6].value).toBe('Opportunity');
            expect(srvFacet.items.keyes[7].value).toBe('Plan');
            expect(srvFacet.items.keyes[8].value).toBe('Report');
            expect(srvFacet.items.keyes[9].value).toBe('Facet');
            expect(srvFacet.items.keyes[10].value).toBe('Task');
            expect(srvFacet.items.lists['Contact'].length).toBe(2);
            expect(srvFacet.items.lists['Contact'][0].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Contact'][1].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Account'].length).toBe(2);
            expect(srvFacet.items.lists['Account'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Account'][1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Event'].length).toBe(2);
            expect(srvFacet.items.lists['Event'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Event'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Opportunity'].length).toBe(2);
            expect(srvFacet.items.lists['Opportunity'][0].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Opportunity'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Document'].length).toBe(2);
            expect(srvFacet.items.lists['Document'][0].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Document'][1].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Note'].length).toBe(2);
            expect(srvFacet.items.lists['Note'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Note'][1].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Report'].length).toBe(2);
            expect(srvFacet.items.lists['Report'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Report'][1].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Lead'].length).toBe(0);
            expect(srvFacet.items.lists['Facet'].length).toBe(0);
            expect(srvFacet.items.lists['Task'].length).toBe(0);
            expect(srvFacet.items.lists['Plan'].length).toBe(0);
            expect(srvFacet.items.others.length).toBe(0);

        });

        it('should manage biblio facet', function () {

            srvFacet.toggleCaseSensitive();
            srvFacet.addFacet('biblio');

            // No biblio is possible under NO facet
            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBeUndefined();
            expect(srvFacet.filterFacets[0].items.length).toBe(14);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            expect(srvFacet.items.others.length).toBe(14);
            // Order is Contact[0], Contact[1], Account[0], Event[0], Opportunity[0], Report[0], Note[0], Document[0], Event[1], Account[1], Report[1], Note[1], Opportunity[1], Document[1]
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[2].object.name).toBe('erlwan');
            expect(srvFacet.items.others[3].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[3].object.title).toBe('erlwan');
            expect(srvFacet.items.others[4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[4].object.title).toBe('erlwan');
            expect(srvConfig.getItemName(srvFacet.items.others[5].object)).toEqual('erlwan Adiz');
            expect(srvFacet.items.others[5].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[5].object.last_name).toBe('erlwan');
            expect(srvFacet.items.others[6].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[6].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.others[7].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[7].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[8].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[8].object.name).toBe('Erlwon');
            expect(srvFacet.items.others[9].object.a4p_type).toBe('Note');
            expect(srvFacet.items.others[9].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[10].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[10].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.others[11].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[11].object.name).toBe('Erlwon');
            expect(srvConfig.getItemName(srvFacet.items.others[12].object)).toEqual('Erlwon Adiz');
            expect(srvFacet.items.others[12].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[12].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.others[13].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[13].object.name).toBe('Erlwon.pdf');

            srvFacet.addFacet('biblio');

            // No facet put all objects in 'others' list
            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBeUndefined();
            expect(srvFacet.filterFacets[0].items.length).toBe(14);
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBeUndefined();
            expect(srvFacet.filterFacets[1].items.length).toBe(14);
            expect(srvFacet.queryItems.length).toBe(14);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            expect(srvFacet.items.others.length).toBe(14);

            srvFacet.removeFacet(0);// remove objects
            srvFacet.removeFacet(0);// remove objects
            expect(srvFacet.filterFacets.length).toBe(0);

            // Add some facets
            var facetProximite = srvData.createObject('Facet', {
                id: {c4p_id: "Facet001"},
                prefix:'01',
                name: 'Proximite'
            });
            srvData.addObject(facetProximite);
            var facetRecents = srvData.createObject('Facet', {
                id: {c4p_id: "Facet002"},
                prefix:'01',
                name: 'Recents',
                parent_id:facetProximite.id
            });
            srvData.addObject(facetRecents);
            var facetArchived = srvData.createObject('Facet', {
                id: {c4p_id: "Facet003"},
                prefix:'02',
                name: 'Archived',
                parent_id:facetProximite.id
            });
            srvData.addObject(facetArchived);
            facetProximite.facets_ids = [facetRecents.id, facetArchived.id];
            facetProximite.items_ids = [srvData.currentItems.Contact[0].id];
            facetRecents.items_ids = [srvData.currentItems.Contact[0].id, srvData.currentItems.Contact[1].id, srvData.currentItems.Account[0].id];
            facetArchived.items_ids = [srvData.currentItems.Opportunity[0].id, srvData.currentItems.Document[0].id, srvData.currentItems.Account[0].id];

            var facetMateriaux = srvData.createObject('Facet', {
                id: {c4p_id: "Facet004"},
                prefix:'02',
                name: 'Materiaux'
            });
            srvData.addObject(facetMateriaux);
            var facetPierre = srvData.createObject('Facet', {
                id: {c4p_id: "Facet005"},
                prefix:'01',
                name: 'Pierre',
                parent_id:facetMateriaux.id
            });
            srvData.addObject(facetPierre);
            var facetBois = srvData.createObject('Facet', {
                id: {c4p_id: "Facet006"},
                prefix:'02',
                name: 'Bois',
                parent_id:facetMateriaux.id
            });
            srvData.addObject(facetBois);
            facetMateriaux.facets_ids = [facetPierre.id, facetBois.id];
            facetMateriaux.items_ids = [srvData.currentItems.Contact[1].id];
            facetPierre.items_ids = [srvData.currentItems.Contact[1].id, srvData.currentItems.Account[0].id, srvData.currentItems.Account[1].id];
            facetBois.items_ids = [srvData.currentItems.Opportunity[1].id, srvData.currentItems.Document[1].id, srvData.currentItems.Account[1].id];

            var facetPierreTaillee = srvData.createObject('Facet', {
                id: {c4p_id: "Facet007"},
                prefix:'01',
                name: 'PierreTaillee',
                parent_id:facetPierre.id
            });
            srvData.addObject(facetPierreTaillee);
            var facetPierreBrute = srvData.createObject('Facet', {
                id: {c4p_id: "Facet008"},
                prefix:'01',
                name: 'PierreBrute',
                parent_id:facetPierre.id
            });
            srvData.addObject(facetPierreBrute);
            facetPierre.facets_ids = [facetPierreTaillee.id, facetPierreBrute.id];
            facetPierreTaillee.items_ids = [srvData.currentItems.Document[0].id, srvData.currentItems.Note[0].id];
            facetPierreBrute.items_ids = [srvData.currentItems.Document[1].id, srvData.currentItems.Note[1].id];

            srvFacet.updateItems();
            // Order is Contact[0], Contact[1], Account[0], Event[0], Opportunity[0], Report[0], Note[0], Document[0],
            // Event[1], Account[1], Report[1], Note[1], Opportunity[1], Document[1]

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(0);
            expect(srvFacet.queryItems.length).toBe(22);// 14 objets + 8 Facets
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('Proximite');
            expect(srvFacet.items.keyes[1].value).toBe('Materiaux');
            // Order is Contact[0], Contact[1], Account[0], Opportunity[0], Document[0]
            expect(srvFacet.items.lists['Proximite'].length).toBe(7);
            expect(srvFacet.items.lists['Proximite'][0].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Proximite'][0].object.name).toBe('Archived');
            expect(srvFacet.items.lists['Proximite'][1].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Proximite'][1].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Proximite'][2].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists['Proximite'][2].object.name).toBe('erlwan');
            expect(srvConfig.getItemName(srvFacet.items.lists['Proximite'][3].object)).toEqual('erlwan Adiz');
            expect(srvFacet.items.lists['Proximite'][3].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Proximite'][3].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Proximite'][4].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Proximite'][4].object.name).toBe('erlwan.doc');
            expect(srvConfig.getItemName(srvFacet.items.lists['Proximite'][5].object)).toEqual('Erlwon Adiz');
            expect(srvFacet.items.lists['Proximite'][5].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Proximite'][5].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Proximite'][6].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Proximite'][6].object.name).toBe('Recents');
            // Order is Contact[1], Account[0], Note[0], Document[0], Account[1], Note[1], Opportunity[1], Document[1]
            expect(srvFacet.items.lists['Materiaux'].length).toBe(12);
            expect(srvFacet.items.lists['Materiaux'][0].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Materiaux'][0].object.name).toBe('Bois');
            expect(srvFacet.items.lists['Materiaux'][1].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['Materiaux'][1].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Materiaux'][2].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Materiaux'][2].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Materiaux'][3].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Materiaux'][3].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Materiaux'][4].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Materiaux'][4].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Materiaux'][5].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['Materiaux'][5].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['Materiaux'][6].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists['Materiaux'][6].object.name).toBe('Erlwon');
            expect(srvConfig.getItemName(srvFacet.items.lists['Materiaux'][7].object)).toEqual('Erlwon Adiz');
            expect(srvFacet.items.lists['Materiaux'][7].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Materiaux'][7].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Materiaux'][8].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Materiaux'][8].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Materiaux'][9].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Materiaux'][9].object.name).toBe('Pierre');
            expect(srvFacet.items.lists['Materiaux'][10].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Materiaux'][10].object.name).toBe('PierreBrute');
            expect(srvFacet.items.lists['Materiaux'][11].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Materiaux'][11].object.name).toBe('PierreTaillee');
            // Order is Event[0], Report[0], Event[1], Report[1]
            expect(srvFacet.items.others.length).toBe(4);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[0].object.title).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Report');
            expect(srvFacet.items.others[2].object.title).toBe('Erlwon');
            expect(srvFacet.items.others[3].object.a4p_type).toBe('Event');
            expect(srvFacet.items.others[3].object.name).toBe('Erlwon');

            srvFacet.addFacet('biblio', 'Proximite', 'Proximite');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Proximite');
            expect(srvFacet.filterFacets[0].items.length).toBe(7);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('Recents');
            expect(srvFacet.items.keyes[1].value).toBe('Archived');
            // Order is Contact[0], Contact[1], Account[0]
            expect(srvFacet.items.lists['Recents'].length).toBe(3);
            expect(srvFacet.items.lists['Recents'][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Recents'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Recents'][1].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Recents'][1].object.last_name).toBe('erlwan');
            expect(srvFacet.items.lists['Recents'][2].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Recents'][2].object.last_name).toBe('Erlwon');
            // Order is Account[0], Opportunity[0], Document[0]
            expect(srvFacet.items.lists['Archived'].length).toBe(3);
            expect(srvFacet.items.lists['Archived'][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Archived'][0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Archived'][1].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists['Archived'][1].object.name).toBe('erlwan');
            expect(srvFacet.items.lists['Archived'][2].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Archived'][2].object.name).toBe('erlwan.doc');
            // Order is Contact[0]
            expect(srvFacet.items.others.length).toBe(1);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[0].object.last_name).toBe('erlwan');

            srvFacet.addFacet('biblio', 'Archived', 'Archived');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Proximite');
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBe('Archived');
            expect(srvFacet.filterFacets[1].items.length).toBe(3);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            // Order is Account[0], Opportunity[0], Document[0]
            expect(srvFacet.items.others.length).toBe(3);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[2].object.name).toBe('erlwan.doc');

            srvFacet.addFacet('biblio', '', undefined);

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(3);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Proximite');
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBe('Archived');
            expect(srvFacet.filterFacets[2].key).toBe('biblio');
            expect(srvFacet.filterFacets[2].value).toBeUndefined();
            expect(srvFacet.filterFacets[2].items.length).toBe(3);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            // Order is Account[0], Opportunity[0], Document[0]
            expect(srvFacet.items.others.length).toBe(3);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.others[1].object.name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Document');
            expect(srvFacet.items.others[2].object.name).toBe('erlwan.doc');

            srvFacet.removeFacet(2);// remove biblio:undefined
            srvFacet.removeFacet(1);// remove biblio:Archived
            srvFacet.addFacet('biblio', 'Recents', 'Recents');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Proximite');
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBe('Recents');
            expect(srvFacet.filterFacets[1].items.length).toBe(3);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            // Order is Contact[0], Contact[1], Account[0]
            expect(srvFacet.items.others.length).toBe(3);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[1].object.last_name).toBe('erlwan');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[2].object.last_name).toBe('Erlwon');

            srvFacet.removeFacet(1);// remove biblio:Recents
            srvFacet.removeFacet(0);// remove facet:Proximite
            srvFacet.addFacet('biblio', 'Materiaux', 'Materiaux');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(1);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Materiaux');
            expect(srvFacet.filterFacets[0].items.length).toBe(12);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('Pierre');
            expect(srvFacet.items.keyes[1].value).toBe('Bois');
            // Order is Contact[1], Account[0], Note[0], Document[0], Account[1], Note[1], Document[1]
            expect(srvFacet.items.lists['Pierre'].length).toBe(9);
            expect(srvFacet.items.lists['Pierre'][0].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['Pierre'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['Pierre'][1].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Pierre'][1].object.company_name).toBe('erlwan');
            expect(srvFacet.items.lists['Pierre'][2].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Pierre'][2].object.name).toBe('erlwan.doc');
            expect(srvFacet.items.lists['Pierre'][3].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Pierre'][3].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Pierre'][4].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['Pierre'][4].object.title).toBe('Erlwon');
            expect(srvConfig.getItemName(srvFacet.items.lists['Pierre'][5].object)).toEqual('Erlwon Adiz');
            expect(srvFacet.items.lists['Pierre'][5].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.lists['Pierre'][5].object.last_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Pierre'][6].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Pierre'][6].object.name).toBe('Erlwon.pdf');
            expect(srvFacet.items.lists['Pierre'][7].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Pierre'][7].object.name).toBe('PierreBrute');
            expect(srvFacet.items.lists['Pierre'][8].object.a4p_type).toBe('Facet');
            expect(srvFacet.items.lists['Pierre'][8].object.name).toBe('PierreTaillee');
            // Order is Account[1], Opportunity[1], Document[1]
            expect(srvFacet.items.lists['Bois'].length).toBe(3);
            expect(srvFacet.items.lists['Bois'][0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.lists['Bois'][0].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.lists['Bois'][1].object.a4p_type).toBe('Opportunity');
            expect(srvFacet.items.lists['Bois'][1].object.name).toBe('Erlwon');
            expect(srvFacet.items.lists['Bois'][2].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['Bois'][2].object.name).toBe('Erlwon.pdf');
            // Contact[1]
            expect(srvFacet.items.others.length).toBe(1);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[0].object.last_name).toBe('Erlwon');

            srvFacet.addFacet('biblio', 'Pierre', 'Pierre');

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(2);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Materiaux');
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBe('Pierre');
            expect(srvFacet.filterFacets[1].items.length).toBe(9);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(2);
            expect(srvFacet.items.keyes[0].value).toBe('PierreBrute');
            expect(srvFacet.items.keyes[1].value).toBe('PierreTaillee');
            // Order is Note[0], Document[0]
            expect(srvFacet.items.lists['PierreTaillee'].length).toBe(2);
            expect(srvFacet.items.lists['PierreTaillee'][0].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['PierreTaillee'][0].object.title).toBe('erlwan');
            expect(srvFacet.items.lists['PierreTaillee'][1].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['PierreTaillee'][1].object.name).toBe('erlwan.doc');
            // Order is Note[1], Document[1]
            expect(srvFacet.items.lists['PierreBrute'].length).toBe(2);
            expect(srvFacet.items.lists['PierreBrute'][0].object.a4p_type).toBe('Note');
            expect(srvFacet.items.lists['PierreBrute'][0].object.title).toBe('Erlwon');
            expect(srvFacet.items.lists['PierreBrute'][1].object.a4p_type).toBe('Document');
            expect(srvFacet.items.lists['PierreBrute'][1].object.name).toBe('Erlwon.pdf');
            // Order is Contact[1], Account[0], Account[1]
            expect(srvFacet.items.others.length).toBe(3);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[2].object.last_name).toBe('Erlwon');

            srvFacet.addFacet('biblio', '', undefined);

            expect(srvFacet.ascendingOrder).toBe(true);
            expect(srvFacet.caseSensitive).toBe(false);
            expect(srvFacet.filterQuery).toBe('');
            expect(srvFacet.filterFacets.length).toBe(3);
            expect(srvFacet.filterFacets[0].key).toBe('biblio');
            expect(srvFacet.filterFacets[0].value).toBe('Materiaux');
            expect(srvFacet.filterFacets[1].key).toBe('biblio');
            expect(srvFacet.filterFacets[1].value).toBe('Pierre');
            expect(srvFacet.filterFacets[2].key).toBe('biblio');
            expect(srvFacet.filterFacets[2].value).toBeUndefined();
            expect(srvFacet.filterFacets[2].items.length).toBe(3);
            expect(srvFacet.lastFacetKey).toBe('biblio');
            expect(srvFacet.items.keyes.length).toBe(0);
            // Order is Contact[1], Account[0], Account[1]
            expect(srvFacet.items.others.length).toBe(3);
            expect(srvFacet.items.others[0].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[0].object.company_name).toBe('erlwan');
            expect(srvFacet.items.others[1].object.a4p_type).toBe('Account');
            expect(srvFacet.items.others[1].object.company_name).toBe('Erlwon');
            expect(srvFacet.items.others[2].object.a4p_type).toBe('Contact');
            expect(srvFacet.items.others[2].object.last_name).toBe('Erlwon');

        });

        it('TODO - should manage looping facets', function () {

            // A parent facet which becomes a child => infinite loop managed by inFacet()
        });

    });

});
