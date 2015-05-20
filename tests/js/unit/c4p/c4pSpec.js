'use strict';

describe('c4p', function () {

    describe('String', function () {

        it('should split correctly a multi-line text', function () {

            var value = "line1\nline2\nline3";
            var nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "line1\nline2\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "line1\n\nline3";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "\nline2\nline3";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "\nline2\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "\n\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(3);

            value = "line1\n\nline2\n\nline3";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(5);

            value = "line1\n\nline2\n\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(5);

            value = "\n\nline2\n\nline3";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(5);

            value = "\n\nline2\n\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(5);

            value = "\n\n\n\n";
            nbLines = value.split(new RegExp("\n")).length;
            expect(nbLines).toEqual(5);

        });

    });

    describe('Date', function () {

        it('should increment correctly a date', function () {

            var date = new Date(2013, 2, 11, 23, 19, 5, 0);
            expect(date.getFullYear()).toEqual(2013);
            expect(date.getMonth()).toEqual(2);// March
            expect(date.getDate()).toEqual(11);
            expect(date.getHours()).toEqual(23);
            expect(date.getMinutes()).toEqual(19);
            expect(date.getSeconds()).toEqual(5);

            expect(date.toString().substr(0, 25)).toEqual('Mon Mar 11 2013 23:19:05 ');

            date.setHours(date.getHours() + 4);
            date.setMinutes(date.getMinutes() + 41);

            expect(date.toString().substr(0, 25)).toEqual('Tue Mar 12 2013 04:00:05 ');

            date.setHours(date.getHours() + 20);

            expect(date.toString().substr(0, 25)).toEqual('Wed Mar 13 2013 00:00:05 ');

        });

    });

    describe('Model', function () {

        describe('Function fileLastname', function () {

            it('should work without directory in path', function () {

                expect(c4p.Model.fileLastname('file.pdf')).toEqual('file.pdf');

            });

            it('should work with / directory in path', function () {

                expect(c4p.Model.fileLastname('a/b/c.d')).toEqual('c.d');

            });

            it('should work with \\ directory in path', function () {

                expect(c4p.Model.fileLastname('a\\b\\c.d')).toEqual('c.d');

            });

            it('should work with / and \\ directory in path', function () {

                expect(c4p.Model.fileLastname('a/b\\c.d')).toEqual('c.d');
                expect(c4p.Model.fileLastname('a\\b/c.d')).toEqual('c.d');

            });

        });

        describe('Function fileRootname', function () {

            it('should work with normal file name', function () {

                expect(c4p.Model.fileRootname('file.pdf')).toEqual('file');

            });

            it('should work with file name without extension', function () {

                expect(c4p.Model.fileRootname('file')).toEqual('file');

            });

            it('should work with empty file name', function () {

                expect(c4p.Model.fileRootname('')).toEqual('');

            });

            it('should work with hidden file', function () {

                expect(c4p.Model.fileRootname('.doc')).toEqual('');

            });

        });

        describe('Function fileExtension', function () {

            it('should work with normal file name', function () {

                expect(c4p.Model.fileExtension('file.pdf')).toEqual('pdf');

            });

            it('should work with file name without extension', function () {

                expect(c4p.Model.fileExtension('file')).toEqual('');

            });

            it('should work with empty file name', function () {

                expect(c4p.Model.fileExtension('')).toEqual('');

            });

            it('should work with hidden file', function () {

                expect(c4p.Model.fileExtension('.doc')).toEqual('doc');

            });

        });

        describe('Function fileName', function () {

            it('should work with normal file name', function () {

                expect(c4p.Model.fileName('file', 'pdf')).toEqual('file.pdf');

            });

            it('should work with file name without extension', function () {

                expect(c4p.Model.fileName('file', '')).toEqual('file');

            });

            it('should work with empty file name', function () {

                expect(c4p.Model.fileName('', '')).toEqual('');

            });

            it('should work with hidden file', function () {

                expect(c4p.Model.fileName('', 'doc')).toEqual('.doc');

            });

        });

    });

});
