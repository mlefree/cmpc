exports.config = {
  allScriptsTimeout: 11000,
  seleniumAddress: 'http://localhost:4444/wd/hub',
  chromeDriver: '../node_modules/protractor/selenium',

  chromeOnly: false,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8069/app/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
