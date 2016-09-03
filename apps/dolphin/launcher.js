'use strict';

(function() {
  /** The dolphin's path
    * @type {string} */
  let path = document.currentScript // Get the current <script> element
              .getAttribute('src')  // Get it's source (e.g. /apps/dolphin/launcher.js)
              .split(SEP_REGEXP)    // Split by separators
              .slice(0, -1)         // Remove the last part (the launcher's name)
              .join('/');           // Join by slah (result e.g. /apps/dolphin)

  // Load the launcher's stylesheet
  /** The windows stylesheet
    * @type {string} */
  let stylesheet;

  // Try to read the file
  try { stylesheet = fs.readFileSync(n(path + '/' + 'launcher.css', true), SYSTEM_ENCODING); }
  // If the opening fails...
  catch(e) { error(tr('Failed to load the launcher stylesheet'), e); }

  // Make a DOM element
  /** The windows stylesheet DOM element
    * @type {Element} */
  let style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.innerHTML = stylesheet;
  document.body.insertBefore(style, document.body.firstChild);

  // Make the windows container visible
  wdock.style.display = 'block';

  // Load the translation
  /** The translation package path
    * @type {string} */
  let tr_path = n(path + '/translations/' + language + '.ntp', true);

  // Try to check if the file exists...
  try {
    // If the file exists...
    if(fs.lstatSync(tr_path).isFile()) {
      // Load the translation package
      let err = Night.require('translate', { ticket: { '*': true } }).load(language, tr_path);
      // If an error occured
      if(e(err))
        // Make it fatal
        // This sentence is translated in the system's native translations
        // packages because it permit applications to display a loading error
        // for their own packages.
        error(tr('Failed to load the translation package for "${language}"', {language}), err);
    }
  } catch(e) {}

  /* =====================
   * = Launcher elements =
   * ===================== */

  /** The launcher element
    * @type {ELement} */
  let launcher = document.createElement('div');
  launcher.setAttribute('id', 'launcher');
  document.body.appendChild(launcher);

  /** The task bar
    * @type {ELement} */
  let taskbar = document.createElement('div');
  taskbar.setAttribute('id', 'taskbar');
  document.body.appendChild(taskbar);

  /** The notifications area
    * @type {Element} */
  let notifications = document.createElement('div');
  notifications.setAttribute('id', 'notifications');
  taskbar.appendChild(notifications);

  /** The clock element
    * @type {Element} */
  let clock = document.createElement('span');
  clock.setAttribute('id', 'clock');
  notifications.appendChild(clock);

  // Set a time interval for the clock
  setInterval(() => {
    clock.innerText = (new Date()).toLocaleTimeString() + '\n' + (new Date()).toLocaleDateString();
  }, 1000);

  // Put an event when a new window is made...
  onWindowMade = ($win, el) => {
    el.style.top  = '60px';
    el.style.left = '40px';

    // Make a <div> element in the taskbar for this window
    /** The taskbar element
      * @type {Element} */
    let task = document.createElement('div');
    task.innerText = $win.getTitle();
    // When the task is clicked, make the window visible
    task.addEventListener('click', () => $win.foreground());
    task.className = 'task';
    taskbar.appendChild(task);

    /** The close element
      * @type {Element} */
    let close = document.createElement('span');
    close.setAttribute('title', tr('Close the window'));
    close.className = 'fa fa-times close';
    task.appendChild(close);

    // Close the window when the close button is clicked
    close.addEventListener('click', () => $win.close());

    // Change the element's appearance when the window is made active...
    $win.on('foreground', () => task.classList.add('active'));

    // or inactive
    $win.on('background', () => task.classList.remove('active'));

    // Update the element when the title changes
    $win.on('title-changed', ($win, title) => task.childNodes[0].data = title);

    // Remove the element when the window is closed
    $win.on('closed', () => task.remove());

    // Hide the task when the window is hidden...
    $win.on('hidden', () => task.classList.add('invisible'));

    // And show it when the window is shown
    $win.on('shown', () => task.classList.remove('invisible'));

    // If the window is visible, trigger the 'foreground' event
    $win.trigger('foreground');
  };
})();
