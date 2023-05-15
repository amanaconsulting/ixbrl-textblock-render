export function createRect(x, y, w, h) {
    return {
        bottom: y + h,
        height: h,
        x     : x,
        left  : x,      
        right : x + w,
        y     : y,
        top   : y,
        width : w
    };
  }
    
  export function unionRect(a, b) {
      var x1 = Math.min(a.x, b.x);
      var x2 = Math.max(a.x + a.width, b.x + b.width);
      var y1 = Math.min(a.y, b.y);
      var y2 = Math.max(a.y + a.height, b.y + b.height);
  
      return createRect(x1, y1, x2 - x1, y2 - y1);  
  }
  
