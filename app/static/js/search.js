let search = {
  startSearch: function(eve) {
    if (eve) {
      eve.preventDefault()
    }
    searchphrase = document.getElementById("searchbar").value
    if (searchphrase.length == 0) {
      return
    }
    asticode.loader.show()
    search.pagenum = 0
    search.pagelength = -1
    document.getElementById("searchprev").disabled = true
    document.getElementById("exportsearch").disabled = true
    document.getElementById("searchnext").disabled = true
    util.emptyNode(document.getElementById("majortopics"))
    astilectron.sendMessage({"name":"search.re.simple.start", "payload": searchphrase}, function(message) {
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }
      search.refreshpage()
      search.setpagelength()
      search.getMajorTopics(15)
    });
  },
  pagenum: 0,
  pagelength: -1,
  refreshpage: function() {
    asticode.loader.show()
    resultbox = document.getElementById("resultdisplay")
    util.emptyNode(resultbox)
    astilectron.sendMessage({"name":"search.getResult", "payload": search.pagenum}, function(message) {
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }
      for (let match of message.payload) {
        let row = document.createElement("li")
        let id = document.createElement("h4")
        id.innerHTML = match.Name + " - " + match.Path
        id.classList.add("resultheader")
        id.addEventListener("click", finfo.getInfo.bind(true, match.Id, match.Position))
        row.appendChild(id)
        let sent = document.createElement("p")
        sent.classList.add("resulttext")
        for (let sec of match.Text) {
          let spn = document.createElement("span")
          spn.innerHTML = sec.Text
          if (sec.Highlight) {
            spn.classList.add("highlight")
          }
          sent.appendChild(spn)
        }
        //sent.innerHTML = match.Text
        row.appendChild(sent)
        resultbox.appendChild(row)
      }
    });
  },
  setpagelength: function() {
    astilectron.sendMessage({"name": "search.getLen"}, function(message) {
      if (message.name === "error") {
        asticode.notfier.error(message.payload)
        return
      }
      search.pagelength = message.payload
      document.getElementById("exportsearch").disabled = false
      search.refreshbuttons()
    });
  },
  refreshbuttons: function() {
    document.getElementById("searchprev").disabled = search.pagenum <= 0
    document.getElementById("searchnext").disabled = search.pagenum + 1 >= search.pagelength
  },
  prev: function() {
    search.pagenum = search.pagenum - 1
    search.refreshpage()
    search.refreshbuttons()
  },
  next: function() {
    search.pagenum = search.pagenum + 1
    search.refreshpage()
    search.refreshbuttons()
  },
  export: function() {
    //dialog save
    asticode.loader.show()
    astilectron.showSaveDialog({title: "Export Search"}, function(filename) {
        if (!filename || filename.length == 0) {
          asticode.loader.hide()
          return
        }
        astilectron.sendMessage({"name":"search.export", "payload":filename}, function(message) {
          asticode.loader.hide()
          if (message.name === "error") {
            asticode.notifier.error(message.payload)
            return
          }
        });
    });
  },
  getMajorTopics: function(size) {
    astilectron.sendMessage({"name":"search.GetMajorTopics", "payload":size}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }
      let box = document.getElementById("majortopics")
      for (let word of message.payload) {
        let row = document.createElement("li")
        row.classList.add("alternatesearch")
        row.addEventListener("click", search.startSearchother.bind(true, word))
        row.innerHTML = word
        box.appendChild(row)
      }
    });
  },
  startSearchother: function(word) {
    document.getElementById("searchbar").value = word
    search.startSearch(false)
  },
  hide: function() {
    document.getElementById("searchpanel").style.display = "none"
  },
  show: function() {
    document.getElementById("searchpanel").style.display = "flex"
  }
}
