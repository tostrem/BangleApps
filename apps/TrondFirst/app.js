// place your const, vars, functions or classes here

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if (on) {
    // call your app function here
    // If you clear the screen, do Bangle.drawWidgets();
    E.showMessage("My\nSimple\nApp","My App");
  }
});

g.clear();
// call your app function here
