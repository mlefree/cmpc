#! /usr/bin/env node
console.log("console.log output");


var shell = require("shelljs");

shell.exec("echo shell.exec works");

//shell.exec("git add -A . && git commit -a -m 'gh-pages update'");
//shell.exec("github-pages-commit && github-pages-push");
