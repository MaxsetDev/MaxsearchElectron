let index = {
  init: function() {
    asticode.loader.init();
    asticode.modaler.init();
    asticode.notifier.init();

    // document.addEventListener('astilectron-ready', function() {
    //   // This will send a message to GO
    //   astilectron.sendMessage({name: "event.name", payload: "hello"}, function(message) {
    //       console.log("received " + message.payload)
    //   });
    // })
  }
};
