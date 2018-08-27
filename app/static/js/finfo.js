let finfo = {
  getInfo: function(id, start) {
    finfo.show()
    search.hide()
    finfo.currentid = id
    finfo.start = util.rounddown(start, finfo.pagesize)
    finfo.size = -1
    finfo.refreshcontrol()
    asticode.loader.show()
    util.emptyNode(document.getElementById("infodisplay"));
    astilectron.sendMessage({"name":"finfo.getinfo", "payload":id}, function(message){
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }

      //fill in values
      document.getElementById("finfoname").value = message.payload.Name;
      document.getElementById("finfopath").innerHTML = message.payload.Path;
      document.getElementById("finfomodtime").innerHTML = message.payload.Modified;
      document.getElementById("finfoupload").innerHTML = message.payload.Upload;

      if (message.payload.IsFile) {
        finfo.getSents(id);
        astilectron.sendMessage({"name":"finfo.getLen", "payload":id}, function(message){
          if (message.name === "error") {
            asticode.notifier.error(message.payload)
            return
          }
          finfo.size = message.payload
          finfo.refreshcontrol()
        });
      }
    });
  },
  getSents: function() {
    asticode.loader.show()
    util.emptyNode(document.getElementById("infodisplay"));
    astilectron.sendMessage({"name":"finfo.getSents", "payload":{"Id": finfo.currentid, "Start": finfo.start, "End": finfo.start + finfo.pagesize}}, function(message){
      asticode.loader.hide()
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }
      let box = document.getElementById("infodisplay")
      for (let sent of message.payload) {
        let p = document.createElement("p")
        p.innerHTML = sent
        box.appendChild(p)
      }
    });
  },
  refreshcontrol: function() {
    document.getElementById("infoprev").disabled = finfo.size < 0 || finfo.start <= 0
    if (finfo.size < 0) {
      document.getElementById("startindx").innerHTML = finfo.size
    } else {
      document.getElementById("startindx").innerHTML = finfo.start + 1
    }
    if (finfo.start + finfo.pagesize < finfo.size) {
      document.getElementById("endindx").innerHTML = finfo.start + finfo.pagesize
    } else {
      document.getElementById("endindx").innerHTML = finfo.size
    }
    document.getElementById("totalindx").innerHTML = finfo.size
    document.getElementById("infonext").disabled = finfo.size < 0 || finfo.start + finfo.pagesize >= finfo.size
  },
  prev: function() {
    finfo.start = finfo.start - finfo.pagesize
    finfo.getSents()
    finfo.refreshcontrol()
  },
  next: function() {
    finfo.start = finfo.start + finfo.pagesize
    finfo.getSents()
    finfo.refreshcontrol()
  },
  currentid: "",
  start: 0,
  pagesize: 10,
  size: -1,
  hide: function() {
    document.getElementById("fileinfopanel").style.display = "none"
  },
  show: function() {
    document.getElementById("fileinfopanel").style.display = "flex"
  },
  changeName: function() {
    let nname = document.getElementById("finfoname").value
    astilectron.sendMessage({"name":"finfo.changeName", "payload":{"Id":finfo.currentid, "Name": nname}}, function(message){
      if (message.name === "error") {
        asticode.notifier.error(message.payload)
        return
      }
      file.refreshfiledisplay()
    });
  }
}
