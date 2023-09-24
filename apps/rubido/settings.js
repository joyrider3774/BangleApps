(function(back) {
  var FILE = "rubido.json";
  // Load settings
  var settings = Object.assign({
    sound: true,
    inputRects: false,
    theming: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  // Show the menu
  E.showMenu({
    "" : { "title" : "Rubido" },
    "< Back" : () => back(),
    'Buzz': {
      value: !!settings.sound,  // !! converts undefined to false
      format: v => v?"On":"Off",
      onchange: v => {
        settings.sound = v;
        writeSettings();
      }
    },
    'Input Rects': {
      value: !!settings.inputRects,  // !! converts undefined to false
      format: v => v?"On":"Off",
      onchange: v => {
        settings.inputRects = v;
        writeSettings();
      }
    },
    'Theming': {
      value: !!settings.theming,  // !! converts undefined to false
      format: v => v?"On":"Off",
      onchange: v => {
        settings.theming = v;
        writeSettings();
      }
    }
  });
});