// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Then we find all the tests.
<<<<<<< HEAD
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);
=======
// Check if require.context is available before using it
if (typeof require.context !== 'undefined' && require.context) {
  const context = require.context('./', true, /\.spec\.ts$/);
  // And load the modules.
  context.keys().forEach(context);
} else {
  // If require.context is not available, webpack will handle test discovery automatically
  // No warning needed - this is expected behavior in webpack environments
}
>>>>>>> origin/invoice-pg
