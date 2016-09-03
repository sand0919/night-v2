/*
  This file loads the main frame and manage all the User Interface (UI).
  It also makes a library to use the main frame's content (DOM).
*/

'use strict';

/**
  * Load a stylesheet
  * @param {string} name
  * @returns {void}
  */
function loadStylesheet(name) {
  /** The windows stylesheet
    * @type {string} */
  let stylesheet;

  // Try to load it
  try { stylesheet = fs.readFileSync(n('/sys/style/' + name + '.css', true), SYSTEM_ENCODING); }
  // If fail...
  catch(e) { error(tr('Failed to load the ' + name + ' stylesheet'), e); }

  // Make a DOM element
  /** The windows stylesheet DOM element
    * @type {Element} */
  let style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.innerHTML = stylesheet;
  document.body.insertBefore(style, document.body.firstChild);
}

// All the UI code is runned into an IIFE to isolate the local variables.
// These variables are useless for the system and may polluate the global object
// if they are not isolated.

(function() {
  // Load the system stylesheets
  loadStylesheet('font-awesome');
  loadStylesheet('main');

  // Make the main window DOM tree
  /** The windows container
    * @type {Element} */
  wdock = document.createElement('div');
  wdock.setAttribute('night-role', 'window');
  wdock.setAttribute('id', 'windock');
  // Make the container invisible ; if the windows are displayed before the
  // launcher is ready it will display ugly things at the screen.
  wdock.style.display = 'none';
  // Insert it at the beginning of the <body> tag
  document.body.insertBefore(wdock, document.body.firstChild);

  // Find the launcher
  let launcher = Night.readRegistry('ui/launcher');

  // If no launcher was specified
  if(typeof launcher !== 'object' || !launcher.application)
    error(tr('No launcher defined. Please define one and restart NightOS.'));

  // Run the launcher with its arguments
  /** The launch's result
    * @type {void|NightError} */
  let result = Night.launchApplication(launcher.application, {
    ticket: {'*': true},
    arguments: launcher.arguments || {},
    level: ROOT_LEVEL
  }, true);

  // If launch failed...
  if(e(result))
    error(result.message, result.arguments.jsError);
})();
