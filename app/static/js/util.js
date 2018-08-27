let util = {
  emptyNode: function(n) {
    while(n.firstChild) {
        n.removeChild(n.firstChild);
    }
  },
  rounddown: function(value, denominator) {
    return value - (value % denominator)
  }
};
