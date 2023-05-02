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
  
  export function createRectFromLTRB(left, top, right, bottom) {
    return createRect(left, top, right - left, bottom - top);
  }
  
  export function createEmptyRect() {
    return createRect(0, 0, 0, 0);
  }
  
  export function offsetRect(rect, x, y) {
      rect.x += x;
      rect.left += x;
      rect.right += x;
      rect.y += y;
      rect.top += y;
      rect.bottom += y;
  }
  
  export function inflateRect(rect, a, b) {
      rect.right += a;
      rect.bottom += b;
      rect.width = rect.right - rect.left;
      rect.height = rect.bottom - rect.top;
  }
  
  export function unionRect(a, b) {
      var x1 = Math.min(a.x, b.x);
      var x2 = Math.max(a.x + a.width, b.x + b.width);
      var y1 = Math.min(a.y, b.y);
      var y2 = Math.max(a.y + a.height, b.y + b.height);
  
      return createRect(x1, y1, x2 - x1, y2 - y1);  
  }
  
  export function intersectRect(a, b) {
      var x1 = Math.max(a.x, b.x);
      var x2 = Math.min(a.x + a.width, b.x + b.width);
      var y1 = Math.max(a.y, b.y);
      var y2 = Math.min(a.y + a.height, b.y + b.height);
  
      if (x2 >= x1 && y2 >= y1) {
          return createRect(x1, y1, x2 - x1, y2 - y1);
      }
  
      return createEmptyRect();
  }
  
  export function equalsRect(a, b) {
      return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }