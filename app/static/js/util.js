let util = {
  emptyNode: function(n) {
    while(n.firstChild) {
        n.removeChild(n.firstChild);
    }
  }
};
