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
// Use try-catch to handle cases where require.context might not be available
try {
  const context = require.context('./', true, /\.spec\.ts$/);
  // And load the modules.
  context.keys().forEach(context);
} catch (error) {
  // If require.context is not available, webpack should handle test discovery automatically
  // This is a fallback for compatibility
  console.warn('require.context not available, relying on webpack for test discovery');
}
