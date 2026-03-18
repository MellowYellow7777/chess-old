var canvas, ctx, imgs, chars, board, mouse;

function Mouse() {
  this.x = 0;
  this.y = 0;
  this.tx = 1;
  this.ty = 1;
  this.holding = null;
}

window.onload = function(event) {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillText(0,0,0);

  mouse = new Mouse;

  function imgFromSrc(src) {
    var img = new Image;
    img.src = src;
    return img;
  }

  imgs = {
    white: {
      king:   imgFromSrc('./png/wk.png'),
      queen:  imgFromSrc('./png/wq.png'),
      rook:   imgFromSrc('./png/wr.png'),
      bishop: imgFromSrc('./png/wb.png'),
      knight: imgFromSrc('./png/wn.png'),
      pawn:   imgFromSrc('./png/wp.png'),
    },
    black: { 
      king:   imgFromSrc('./png/bk.png'),
      queen:  imgFromSrc('./png/bq.png'),
      rook:   imgFromSrc('./png/br.png'),
      bishop: imgFromSrc('./png/bb.png'),
      knight: imgFromSrc('./png/bn.png'),
      pawn:   imgFromSrc('./png/bp.png'),
    }
  };

  canvas.onpointermove = function(event) {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;
    mouse.tx = Math.floor(mouse.x/50) + 1;
    mouse.ty = bs.height - Math.floor(mouse.y/50);
  }

  canvas.onpointerleave = function(event) {
    mouse.x = null;
    mouse.y = null;
    mouse.tx = null;
    mouse.ty = null;
  }

  canvas.onpointerdown = function(event) {
    this.setPointerCapture(event.pointerId);
    var piece = bs.pieceAt(mouse.tx,mouse.ty);
    if (piece?.color != bs.turn && legalMoves) return;
    mouse.holding = {};
    mouse.holding.piece = piece;
    mouse.holding.dx = 0;
    mouse.holding.dy = 0;
    mouse.holding.moves = piece.moves;
  }

  canvas.onpointerup = function(event) {
    this.releasePointerCapture(event.pointerId);
    if (!mouse.holding) return;
    var {piece,moves,dx,dy} = mouse.holding;
    if (!piece) return;

    var x = Math.floor((mouse.x-dx)/50) + 1,
        y = bs.height - Math.floor((mouse.y+dy)/50);

    if (legalMoves) {

      var move = moves.find(move => move.x==x && move.y==y);
      if (move) {
        bs.makeMove(move);
      }
    } else {
      if (!validXY(x,y)) {
        bs.pieces.splice(bs.pieces.indexOf(piece),1);
        mouse.holding = null;
      }
      var target = bs.pieceAt(x,y);
      if (target === piece) return mouse.holding = null;
      if (target) bs.pieces.splice(pieces.indexOf(target),1);
      bs.pieces.filter(piece => {
        if (piece.enPassant) delete piece.enPassant;
      });
      piece.x = x;
      piece.y = y;
      if (piece.zeroMove) delete piece.zeroMove;
      board = getBoardFromPieces(pieces);
      turn = turn == 'white' ? 'black' : 'white';
    }

    bs.pieces.forEach(piece => piece.moves = bs.validateMoves(piece));

    checkmate = bs.pieces.filter(piece => piece.color == bs.turn).reduce((a,v) => a + v.moves.length, 0) == 0;

    mouse.holding = null;
  }

  chars = {
    white: {
      king:   9812,
      queen:  9813,
      rook:   9814,
      bishop: 9815,
      knight: 9816,
      pawn:   9817,
    },
    black: { 
      king:   9818, 
      queen:  9819, 
      rook:   9820, 
      bishop: 9821, 
      knight: 9822, 
      pawn:   9823,
    }
  };

  turn = 'white';

  legalMoves = true;

  for (col in chars) {
  for (type in chars[col]) {
    chars[col][type] = 
      String.fromCharCode(chars[col][type]);
  }}

  canvas.width = 20*50;
  canvas.height = 20*50;

  width = 20;
  height = 20;

  ctx.font = '50px Kurinto Mono';

bs = new BoardState;
/*
bs.piecesFromTxt(
`rnbqkbnr
pppppppp
        
        
        
        
PPPPPPPP
RNBQKBNR`);
*/
bs.piecesFromTxt(
`rnbqkbnrnbqkbnrnbqkr
pppppppppppppppppppp
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
PPPPPPPPPPPPPPPPPPPP
RNBQKBNRNBQKBNRNBQKR`);



  //fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  // 9x9 fromFEN('rnbqkqbnr/ppppppppp/9/9/9/9/9/PPPPPPPPP/RNBQKQBNR w KQkq - 0 1');
  // 7x7 fromFEN('rnbqkbr/ppppppp/7/7/7/PPPPPPP/RNBKQBR w KQkq - 0 1');

  //board = getBoardFromPieces(pieces);

  animation = null;

  addAnimation({x:20,y:2},{x:20,y:4});
  addAnimation({x:12,y:19},{x:12,y:18},{x:5,y:20});
  addAnimation({x:7,y:2},{x:7,y:4});
  addAnimation({x:2,y:19},{x:2,y:18});
  addAnimation({x:12,y:2},{x:12,y:4});
  addAnimation({x:18,y:19},{x:18,y:18});
  addAnimation({x:13,y:1},{x:10,y:13});
  addAnimation({x:14,y:20},{x:15,y:6},null,{color:'white'});
  addAnimation({x:20,y:1},{x:20,y:3});
  addAnimations([[null,null,null,{newPiece: {x:19,y:19,color:'black',type:'pawn'}}],[{x:19,y:19},{x:19,y:18}],[{x:18,y:18},{x:18,y:15}]]);
  addAnimation({x:18,y:15},{x:18,y:17},null,{newPiece: {x:13,y:1,color:'white',type:'queen'}});
  addAnimations([[{x:2,y:18},{x:2,y:17}],[{x:2,y:20},{x:4,y:18}]]);
  addAnimations([[null,null,null,{newPiece: {x:11,y:1,color:'white',type:'queen'}}],[{x:11,y:1},{x:10,y:16}]]);
  addAnimation({x:3,y:20},{x:3,y:18});
  addAnimation({x:13,y:1},{x:14,y:16});
  addAnimation({x:16,y:20},{x:16,y:16},{x:15,y:6});
  addAnimation({x:16,y:16},{x:16,y:16});
  addAnimations([[{x:4,y:20},{x:14,y:14},null,{color:'white'}],[{x:18,y:20},{x:14,y:14},null,{color:'white'}]]);
  addAnimations([[null,null,null,{newPiece: {x:14,y:16,color:'white',type:'queen'}}],[{x:14,y:16},{x:18,y:19},{x:16,y:19}]]);
  addAnimation({x:20,y:20},{x:19,y:20},null,{color:'white',type:'king'});
  addAnimations([[null,null,null,{newPiece: {x:14,y:16,color:'white',type:'queen'}}],[{x:14,y:16},{x:16,y:17}]]);

/*
  addAnimation({x:5,y:2},{x:5,y:5});
  addAnimation({x:5,y:8},{x:5,y:7});
  addAnimation({x:4,y:2},{x:4,y:4},{x:4,y:8});
  addAnimation({x:8,y:9},{x:6,y:6});
  addAnimations([[{x:1,y:2},{x:1,y:4}],[{x:1,y:8},{x:1,y:7}]]);
  addAnimation({x:2,y:9},{x:3,y:7});
  addAnimation({x:4,y:1},{x:2,y:5});
  addAnimation({x:5,y:7},{x:4,y:6});
  addAnimation({x:7,y:1},{x:7,y:7},{x:7,y:9});
  addAnimation({x:6,y:2},{x:6,y:3});
  addAnimation({x:9,y:8},{x:9,y:8});
  addAnimation({x:6,y:6},{x:3,y:3});
  addAnimation({x:3,y:9},{x:8,y:6});
  addAnimation({x:4,y:9},{x:4,y:7});
  addAnimation({x:6,y:1},{x:4,y:7},{x:4,y:7});
  addAnimation({x:9,y:9},{x:4,y:9});
  addAnimations([[{x:7,y:7},{x:8,y:6},{x:6,y:9}],[{x:8,y:6},{x:8,y:6}]]);
  addAnimation({x:5,y:9},{x:9,y:9});
  addAnimation({x:4,y:7},{x:9,y:7});
  addAnimation({x:9,y:9},{x:8,y:9});
  addAnimation({x:9,y:7},{x:9,y:5});
  addAnimation({x:3,y:3},{x:5,y:5},{x:5,y:5});
  addAnimation({x:2,y:5},{x:2,y:8},{x:2,y:8});
  addAnimation({x:4,y:9},{x:4,y:2});
  addAnimation({x:5,y:1},{x:4,y:2},{x:4,y:2});
  addAnimation({x:5,y:5},{x:7,y:3});
  addAnimation({x:2,y:8},{x:1,y:9},{x:1,y:9});
*/


  loop();
}


class BoardState {

  pieces = [];
  turn = 'white';
  castles = {
    white: {
      queenSide: true,
      kingSide: true,
    },
    black: {
      queenSide: true,
      kingSide: true,
    }
  };
  
  constructor(width=8,height=8) {
    this.width = width;
    this.height = height;
  }

  copy() {
    var b = new BoardState(this.width,this.height);
    b.turn = this.turn;

    this.pieces.forEach(piece => {
      b.pieces.push(Object.fromEntries(Object.entries(piece)));
    });
    b.pieces.forEach(piece => piece.moves = b.validateMoves(piece));

    return b;
  }

  addPiece(color,type,x,y) {
    if (this.pieceAt(x,y)) return false;
    this.pieces.push({color,type,x,y,zeroMove:true,enPassant:false});
    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));
  }

  piecesFromTxt(txt) {
    var b = txt.split('\n').map(line => line.split(''));
    this.pieces = [];
    this.width = b[0].length;
    this.height = b.length;
    b.forEach((row,iy) => row.forEach((p,ix) => {
      if (p == ' ' || p == '_') return;
      var color = 'prbnqk'.includes(p) ? 'black' : 'white';
      var type = ({
        p: 'pawn',
        r: 'rook',
        b: 'bishop',
        n: 'knight',
        q: 'queen',
        k: 'king',
      })[p.toLowerCase()];
      var x = ix + 1;
      var y = this.height - iy;
      this.pieces.push({color,type,x,y,zeroMove:true,enPassant:false});
    }));
    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));
  }

  pieceAt(x,y) {
    return this.pieces.find(piece => piece.x == x && piece.y == y);
  }

  validXY(x,y) {
    return x >= 1 && y >= 1 && x <= this.width && y <= this.height;
  }

  getMoves(piece,skipex) {
    if (!piece) return [];
    if (piece.type == 'pawn') return this.getPawnMoves(piece);
    if (piece.type == 'rook') return this.getRookMoves(piece);
    if (piece.type == 'bishop') return this.getBishopMoves(piece);
    if (piece.type == 'queen') return this.getQueenMoves(piece);
    if (piece.type == 'knight') return this.getKnightMoves(piece);
    if (piece.type == 'king') return this.getKingMoves(piece,skipex);
  }

  getPawnMoves(piece) {
    var {x,y,color} = piece;
    var dir = 
      +(piece.color == 'white') -
      +(piece.color == 'black');
    var moves = [];
    if (
      this.validXY(x,y+dir) &&
      !this.pieceAt(x,y+dir)
    ) moves.push({piece,x,y:y+dir});
    if (
      moves.length == 1 &&
      piece.zeroMove &&
      this.validXY(x,y+2*dir) &&
      !this.pieceAt(x,y+2*dir)
    ) moves.push({piece,x,y:y+2*dir});
    var capture = this.pieceAt(x+1,y+dir);
    if (
      this.validXY(x+1,y+dir) &&
      capture &&
      capture.color != piece.color
    ) moves.push({piece,x:x+1,y:y+dir,capture});
    var capture = this.pieceAt(x-1,y+dir);
    if (
      this.validXY(x-1,y+dir) &&
      capture &&
      capture.color != piece.color
    ) moves.push({piece,x:x-1,y:y+dir,capture});
    var capture = this.pieceAt(x+1,y);
    if (
      this.validXY(x+1,y+dir) &&
      capture &&
      capture.enPassant &&
      capture.color != piece.color
    ) moves.push({piece,x:x+1,y:y+dir,capture});
    var capture = this.pieceAt(x-1,y);
    if (
      this.validXY(x-1,y+dir) &&
      capture &&
      capture.enPassant &&
      capture.color != piece.color
    ) moves.push({piece,x:x-1,y:y+dir,capture});
  
    return moves;
  }

  getLineMoves(piece,directions) {
    var {x,y,color} = piece;
    var moves = [];

    directions.forEach(([dx,dy]) => {
      var [cx, cy] = [x, y];
      while (this.validXY(cx += dx, cy += dy)) {
        var capture = this.pieceAt(cx, cy);
        if (capture) {
          if (capture.color != color) moves.push({piece,x:cx,y:cy,capture});
          break;
        }
        moves.push({piece,x:cx,y:cy});
      }
    });

    return moves;
  }

  getRookMoves(piece) {
    return this.getLineMoves(piece,[[1,0],[-1,0],[0,1],[0,-1]]);
  }

  getBishopMoves(piece) {
    return this.getLineMoves(piece,[[1,1],[-1,1],[1,-1],[-1,-1]]);
  }

  getQueenMoves(piece) {
    return this.getRookMoves(piece).concat(this.getBishopMoves(piece));
  }

  getKnightMoves(piece) {
    var {x,y,color} = piece;
    var x0 = x, y0 = y;
    var moves = [];
  
    [[1,2],[2,1],[-1,2],[-2,1],[-1,-2],[-2,-1],[1,-2],[2,-1]]
    .map(i => [x+i[0],y+i[1]])
    .filter(i => this.validXY(i[0],i[1]))
    .forEach(i => {
      var capture = this.pieceAt(i[0],i[1]);
      if (capture) {
        if (capture.color != color) {
          moves.push({piece,x:i[0],y:i[1],capture});
        }
      } else {
        moves.push({piece,x:i[0],y:i[1]});
      }
    });
    return moves;
  }

  getKingMoves(piece,skipex) {
    var {x,y,color} = piece;
    var x0 = x, y0 = y;
    var moves = [];
  
    [[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]]
    .map(i => [x+i[0],y+i[1]])
    .filter(i => this.validXY(i[0],i[1]))
    .forEach(i => {
      var capture = this.pieceAt(i[0],i[1]);
      if (capture) {
        if (capture.color != color) {
          moves.push({piece,x:i[0],y:i[1],capture});
        }
      } else {
        moves.push({piece,x:i[0],y:i[1]});
      }
    });

    if (skipex) return moves;

    var attacks = this.getAttacks(this.opponentColor(color));
    var check = this.inCheck(color);

    if (piece.zeroMove && !check) {
      var rook = this.pieceAt(this.width,y);
      if (rook && rook.type == 'rook' &&
          rook.zeroMove &&
          !this.pieceAt(x + 1, y) && 
          !this.pieceAt(x + 2, y) && 
          !attacks.some(a => a.x == x + 1 && a.y == y) && 
          !attacks.some(a => a.x == x + 2 && a.y ==  y)) {
        moves.push({piece, x: x + 2, y, castle: rook});
      }
      var rook = this.pieceAt(1,y);
      if (rook && rook.type == 'rook' &&
          rook.zeroMove &&
          !this.pieceAt(x - 1, y) && 
          !this.pieceAt(x - 2, y) && 
          !this.pieceAt(x - 3, y) && 
          !attacks.some(a => a.x == x - 1 && a.y == y) && 
          !attacks.some(a => a.x == x - 2 && a.y ==  y) && 
          !attacks.some(a => a.x == x - 3 && a.y ==  y)) {
        moves.push({piece, x: x - 3, y, castle: rook});
      }
    }

    return moves;
  }


  getAttacks(color) {
    return getAttacks(color,this);
  }

  getAttacks(color) {
    var attacks = [];
  
    function addUnique(pos) {
      if (!attacks.some(attack => attack.x == pos.x && attack.y == pos.y))
        attacks.push(pos);
    }
  
    this.pieces
    .filter(piece => piece.color == color)
    .forEach(piece => {
      if (piece.type == 'pawn') {
        let dir = (piece.color == 'white') ? 1 : -1;
        [
          {x: piece.x+1, y: piece.y+dir},
          {x: piece.x-1, y: piece.y+dir}
        ].filter(move => this.validXY(move.x,move.y))
        .forEach(move => addUnique(move));
      } else {
        this.getMoves(piece,true)
        .forEach(move => addUnique(move));
      }
    });

    return attacks;
  }

  validateMoves(piece) {
    var moves = this.getMoves(piece);
    var [x0,y0] = [piece.x,piece.y];
    return moves.filter(move => {
      var capture = this.pieceAt(move.x,move.y);
      var i = this.pieces.indexOf(capture);
      if (capture) {
        this.pieces.splice(i,1);
      }
      piece.x = move.x;
      piece.y = move.y;
      var valid = !this.inCheck(piece.color);
      piece.x = x0;
      piece.y = y0;
      if (capture) this.pieces.splice(i,0,capture);
      return valid;
    })
  }

  inCheck(color) {
    var attacks = this.getAttacks(this.opponentColor(color));
    var kings = this.pieces.filter(piece => piece.color == color && piece.type == 'king');
    return kings.some(king => attacks.some(attack => 
      attack.x == king.x && attack.y == king.y
    ));
  }

  opponentColor(color) {
    return color == 'white' ? 'black' : 'white';
  }

  makeMove(move) {
    var {piece,x,y,capture,castle} = move;
        if (capture) this.pieces.splice(this.pieces.indexOf(capture),1);
  
        this.pieces.filter(piece => {
          if (piece.enPassant) delete piece.enPassant;
        });
        if (piece.type == 'pawn') {
          if (Math.abs(piece.y - y) == 2) piece.enPassant = true;
          if ((piece.color == 'white' && y == 8)
            || (piece.color == 'black' && y == 1))
            piece.type = 'queen';
        }

        if (castle) {
          if (castle.x == 1) {
            castle.x = x + 1;
          }
          if (castle.x == this.width) {
            castle.x = x - 1;
          }
        }
  
  
        piece.x = x;
        piece.y = y;
        if (piece.zeroMove) delete piece.zeroMove;
        this.turn = this.turn == 'white' ? 'black' : 'white';

    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));
  }

  moves() {
    return this[this.turn].flatMap(piece => piece.moves);
  }

  get white() {
    return this.pieces.filter(piece => piece.color == 'white');
  }
  get black() {
    return this.pieces.filter(piece => piece.color == 'black');
  }

}
function gen(state,depth) {

if (arguments.length == 1) {
  depth = state;
  state = bs;
}

return bs.moves().map((_,i) => {
  var _bs = bs.copy();
  var move = _bs.moves()[i];
  var from = {x:move.piece.x,y:move.piece.y};
  var to = {x:move.x,y:move.y};
  var capture = move.capture;
  if (capture) {
    capture = {x:capture.x,y:capture.y};
  } else {
    capture = false;
  }

  _bs.makeMove(move);

  var responses;
  if (depth > 0) {
    responses = gen(_bs,depth - 1);
  } else {
    responses = null;
  }

  return {move:{from,to,capture},responses,bs:_bs};
  return _bs;
})
}

class Animation {
  static q = [];
  constructor(from,dest,capture,ex) {
    this.from = from;
    this.dest = dest;
    if (from) this.current = {x:from.x,y:from.y};
    this.t = 0;
    this.capture = capture;
    this.ex = ex;
  }

  static interval = false;

  static run() {
    if (this.interval === false) {
      this.interval = setInterval(() => this.step(),0);
    }
  }

  static run1() {
    var len = this.q.length;
    if (this.interval === false) {
      this.interval = setInterval(() => {
        this.step();
        if (this.q.length != len) {
          clearInterval(this.interval);
          this.interval = false;
        }
      },0);
    }
  }

  static stop() {
    if (interval !== false) {
      clearInterval(this.interval);
      this.interval = false;
    }
  }

  static step() {
    if (this.q.length) {
      var q0 = this.q[0];
      if (Array.isArray(q0)) {
        q0.forEach(q => q.step());
        if (q0[0].t == 250) {
          this.q.shift();
        }
      } else {
        q0.step();
        if (q0.t == 250) {
          this.q.shift();
        }
      }
    }
  }

  static fn(t) {
    return -(2*t-3)*t*t;
  }

  step() {
    var {piece,from,dest,current,t,capture,ex} = this;
    var fn = Animation.fn;
    this.t++;
    if (t == 0 && this.from) {
      this.piece = bs.pieceAt(from.x,from.y);
      var eq = from.x == dest.x && from.y == dest.y;
      if (eq && this.piece) {
        var target = bs.pieceAt(dest.x,dest.y);
        if (target) bs.pieces.splice(bs.pieces.indexOf(target),1);
        this.piece = null;
      }
      if (capture) {
        var target = bs.pieceAt(capture.x, capture.y);
        if (target) bs.pieces.splice(bs.pieces.indexOf(target),1);
        this.capture = null;
      }
    }
    if (t == 0 && !from) {
        if (ex.newPiece) {
          bs.pieces.splice(0,0,ex.newPiece);
        }
    }
    if (t <= 200 && this.from) {
      current.x = from.x + fn(t/200) * (dest.x - from.x);
      current.y = from.y + fn(t/200) * (dest.y - from.y);
    }
    if (t == 200 && piece) {
      var target = bs.pieceAt(dest.x,dest.y);
      if (target) bs.pieces.splice(bs.pieces.indexOf(target),1);
      piece.x = dest.x;
      piece.y = dest.y;
      if (ex) {
        if (ex.color) piece.color = ex.color;
        if (ex.type) piece.type = ex.type;
        if (ex.newPiece) {
          bs.pieces.push(ex.newPiece);
        }
      }

    }
  }
  
}

function addAnimation(from,to,capture,ex) {
  Animation.q.push(new Animation(from,to,capture,ex));
}
function addAnimations(animations) {
  Animation.q.push(animations.map(a => new Animation(a[0],a[1],a[2],a[3])));
}

function fromFEN(fen) {
  pieces = [];
  var fields = fen.split(' ');
  var ranks = fields[0].split('/');
  height = ranks.length;
  width = ranks[0].split('').map(n => isNaN(+n) ? 1 : +n).reduce((a,v) => a+v);
  ranks.forEach((rank,y) => {
    y = height - y;
    var x = 1;
    rank.split('').forEach(p => {
      if ('123456789'.includes(p)) return x += +p;
      var color;
      if ('PNBRQK'.includes(p)) color = 'white';
      if ('pnbrqk'.includes(p)) color = 'black';
      var type = ({
        p: 'pawn',
        n: 'knight',
        r: 'rook',
        b: 'bishop',
        q: 'queen',
        k: 'king',
      })[p.toLowerCase()];
      var piece = {color,type,x,y};
      if (type == 'pawn') piece.zeroMove = true;
      pieces.push(piece);
      x++;
    });
  });
  pieces.forEach(piece => piece.moves = validateMoves(piece));
  checkmate = pieces.filter(piece => piece.color == turn).reduce((a,v) => a + v.moves.length, 0) == 0;
  if (fields[1] == 'w') turn = 'white';
  if (fields[1] == 'b') turn = 'black';
  canvas.width = 50 * width;
  canvas.height = 50 * height;
}

function getBoardFromPieces(pieces) {
  var board = Array(width*height).fill('');
  pieces.forEach(piece => {
    var {x,y} = piece;
    board[width*(height-y)+x-1] = pieceToTxt(piece);
  })
  return board;
}

function pieceToTxt(piece) {
  if (!piece) return '';
  var chars = {
    white: {
      king: 'K',
      queen: 'Q',
      rook: 'R',
      bishop: 'B',
      knight: 'N',
      pawn: 'P',
    },
    black: {
      king: 'k',
      queen: 'q',
      rook: 'r',
      bishop: 'b',
      knight: 'n',
      pawn: 'p',
    }
  };
  return chars[piece.color][piece.type];
}

function loop() {
  requestAnimationFrame(loop);
  upd();
  draw();
}

function upd() {
}

function highlightCell(x,y,capture) {
  if (!capture || !(capture.x == x && capture.y == y)) {
    var cx = (x - 1)*50 + 25;
    var cy = (bs.height - y)*50 + 25;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.globalAlpha = .25;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx,cy);
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
  }
  if (capture) {
    var cx = (capture.x - 1)*50 + 25;
    var cy = (bs.height - capture.y)*50 + 25;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.globalAlpha = .25;
    ctx.beginPath();
    ctx.arc(cx, cy, 23, 0, 2*Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
  }
}

function draw() {
  if (canvas.width != bs.width * 50) canvas.width = bs.width * 50;
  if (canvas.height != bs.height * 50) canvas.height = bs.height * 50;
  var holding = mouse.holding?.piece;
  var cx,cy;
  var q0 = Animation.q[0];
  for(y=1;y<=bs.height;y++) {cy = (bs.height - y)*50;
  for(x=1;x<=bs.width;x++) {cx = (x - 1)*50;
    ctx.fillStyle = ['#B88762','#ECD5AE'][(x+y+bs.width+bs.height)%2];
    ctx.fillRect(cx,cy,50,50);
    var piece = bs.pieceAt(x,y);
    if (!(Array.isArray(q0) && q0.some(q => q?.ex?.newPiece?.x == x && q?.ex?.newPiece?.y == y))) {
    if (Array.isArray(q0) && q0.some(q => q && q.piece === piece)) continue;
}
    if (holding === piece || (q0 && q0.piece === piece)) continue;
    if (!piece) continue;
    var img = imgs[piece.color][piece.type];
    ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
  }}

  if (holding) {
    var {piece,moves,dx,dy} = mouse.holding;
    moves.forEach(pos => highlightCell(pos.x,pos.y,pos.capture));
    if (piece) {
      var img = imgs[piece.color][piece.type];
      ctx.drawImage(img,0,0,img.width,img.height,mouse.x-dx-25,mouse.y+dy-25,50,50);
    }
  }

  if (q0) {
    if (Array.isArray(q0)) {
      q0.forEach(q0 => {
        var piece = q0.piece;
        if (piece) {
          var img = imgs[piece.color][piece.type];
          cx = (q0.current.x - 1)*50;
          cy = (height - q0.current.y)*50;
          ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
        }
      });
    } else {
      var piece = q0.piece;
      if (piece) {
        var img = imgs[piece.color][piece.type];
        cx = (q0.current.x - 1)*50;
        cy = (height - q0.current.y)*50;
        ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
      }
    }
  }
}

// from movetext // mm = mt.replaceAll('\n',' ').split('.').flatMap(t => t.slice(0,t.lastIndexOf(' ')).trim().split(' ')).filter(m => m)

function fromAlgebraic(coords) {
  var x = 'abcdefgh'.indexOf(coords[0]) + 1,
      y = +coords[1];
  return {x,y};
}
