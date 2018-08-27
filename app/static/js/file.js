let file = {
  refreshfiledisplay: function() {
    asticode.loader.show();
    var filebox = document.getElementById("filebox");
    util.emptyNode(filebox);

    file.filldirectory(filebox, "__root__");
    asticode.loader.hide();
  },
  filldirectory: function(htmlulbox, dirId) {
    var sort = document.getElementById("filesort");
    var sortvalue = sort.options[sort.selectedIndex].value;
    astilectron.sendMessage({"name":"file.listdir", "payload": {"DirId": dirId, "Sort": sortvalue}}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      for (let entry of message.payload) {
        let activecheck = document.createElement("input");
        activecheck.type = "checkbox";
        activecheck.checked = entry.Active;
        activecheck.addEventListener("click", file.toggleactive.bind(true, entry.Id));

        let nametag = document.createElement("span");
        nametag.innerHTML = entry.Name;
        nametag.classList.add("entryname");

        let move = document.createElement("img");
        move.alt = "+";
        move.src = "static/img/AddButton.png"
        move.classList.add("filecontrol")
        move.addEventListener("click", file.move.bind(true, entry.Id, entry.Name));

        let del = document.createElement("img");
        del.alt = "x";
        del.src = "static/img/MinusButton.png"
        del.classList.add("filecontrol")
        del.addEventListener("click", file.destroy.bind(true, entry.Id, entry.Name));

        let row = document.createElement("li");
        htmlulbox.appendChild(row);
        if (entry.Dir) {
          let additionalrow = document.createElement("li");
          let subdir = document.createElement("ul");
          subdir.classList.add("filebox");

          let expandbutton = document.createElement("button");
          if (entry.Dir.Hidden) {
            subdir.style.display = "none";
            expandbutton.innerHTML = ">";
          } else {
            subdir.style.display = "block";
            expandbutton.innerHTML = "V";
          }
          expandbutton.addEventListener("click", file.togglehidden.bind(true, expandbutton, subdir, entry.Id));
          file.filldirectory(subdir, entry.Id);
          row.appendChild(expandbutton);
          additionalrow.appendChild(subdir);
          htmlulbox.appendChild(additionalrow);
        }
        row.appendChild(activecheck);
        row.appendChild(nametag);
        row.appendChild(move);
        row.appendChild(del);
      }
    });
  },
  toggleactive: function(id) {
    astilectron.sendMessage({"name": "file.toggleactive", "payload": id}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      file.refreshfiledisplay();
    });
  },
  togglehidden: function(b, subul, entryid) {
    astilectron.sendMessage({"name": "file.togglehidden", "payload": entryid}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      if (message.payload) {
        subul.style.display = "none";
        b.innerHTML = ">";
      } else {
        subul.style.display = "block";
        b.innerHTML = "V";
      }
    });
  },
  move: function(id, name) {
    asticode.loader.show()
    file.moveid = id;
    document.getElementById("movingname").innerHTML = name
    astilectron.sendMessage({"name": "file.getMoveOptions", "payload": id}, function(message){
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      let optionbox = document.getElementById("moveoptionsbox");
      util.emptyNode(optionbox);
      for (let op of message.payload) {
        let row = document.createElement("input")
        row.type = "button"
        // row.name = "dirid"
        // row.value = op.Id;
        row.value = op.Name;
        row.addEventListener("click", file.movetodir.bind(true, op.Id));
        optionbox.appendChild(row)
      }
      document.getElementById("movebox").style.display = "block"
    });
  },
  moveid: "",
  movetodir: function(dirid) {
    asticode.loader.show()
    astilectron.sendMessage({"name": "file.movedir", "payload": {"EntryId": file.moveid, "DirId": dirid}}, function(message){
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      document.getElementById("movebox").style.display = "none"
      file.refreshfiledisplay()
    })
  },
  hidemove: function(eve) {
    eve.preventDefault()
    document.getElementById("movebox").style.display = "none"
  },
  destroy: function(id) {
    astilectron.sendMessage({"name": "file.destroy", "payload": {"EntryId": id, "Rec": false}}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload);
        return;
      }
      file.refreshfiledisplay();
    });
  },
  newfile: function() {
    asticode.loader.show()
    astilectron.showOpenDialog({properties:['openFile', 'multiSelections'], title: "Add File", filters: {name:"Documents", extensions: ['txt', 'pdf', 'html']}}, function(paths){
      if (!paths || paths.length == 0) {
        asticode.loader.hide()
        return
      }
      astilectron.sendMessage({"name": "util.sync.countdown.start", "payload":{"Id": "addingfiles", "Total": paths.length}}, function(message){
        if (message.name === "error") {
          asticode.notifier.error(message.payload);
          return;
        }
        for (let p of paths) {
          astilectron.sendMessage({"name": "file.newfile", "payload": p}, function(message){
            if (message.name === "error") {
              asticode.notifier.error(message.payload);
            }
            astilectron.sendMessage({"name": "util.sync.countdown", "payload":"addingfiles"}, function(message){
              if (message.name === "error") {
                asticode.notifier.error(message.payload);
                return
              }
              if (message.payload) {
                asticode.loader.hide()
                file.refreshfiledisplay();
              }
            });
          });
        }
      });
    });
  },
  newfolder: function() {
    //reveal new folder form
    let f = document.getElementById("newfolder")
    if (f.style.display == "none") {
      f.style.display = "block";
    } else {
      f.style.display = "none";
    }
  },
  createDir: function(eve) {
    eve.preventDefault()
    let nname = document.getElementById("newfoldername").value
    if (nname.length > 0){
      astilectron.sendMessage({"name": "file.newdir", "payload": nname}, function(message){
        if (message.name === "error") {
          asticode.notifier.error(message.payload)
          return;
        }
        document.getElementById("newfoldername").value = ""
        file.refreshfiledisplay()
      })
      document.getElementById("newfolder").style.display = "none"
    }
  }
};
