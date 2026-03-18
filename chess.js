var canvas, ctx, imgs, chars, board, mouse, edit, flip, games, game;

var body = document.body;

window.onload = function(event) {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  
  body.style = `width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;`;

  edit = false;
  sel = {type:'move',color:'white'};

  window.onkeydown = function(event) {
    switch(event.code) {
      case 'KeyE': edit = !edit; break;
      case 'KeyP': sel.type = 'pawn'; break;
      case 'KeyR': sel.type = 'rook'; break;
      case 'KeyB': sel.type = 'bishop'; break;
      case 'KeyN': sel.type = 'knight'; break;
      case 'KeyQ': sel.type = 'queen'; break;
      case 'KeyK': sel.type = 'king'; break;
      case 'KeyM': sel.type = 'move'; break;
      case 'KeyD': sel.type = 'delete'; break;
    }
  }

  mouse = {
    x: 0,
    y: 0,
    tx: 1,
    ty: 1,
    holding: null,
  }

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

  arrows = [];

  highlighted = [];

  arrow = null;
  
    function resize() {
    var size = Math.min(window.innerWidth,window.innerHeight);
    canvas.width = canvas.height = size;
  }

  window.onresize = resize;

  resize();

  canvas.oncontextmenu = function(event) {
    event.preventDefault();
    if (mouse.holding) {
      mouse.holding = null;
      return;
    }
  }

  canvas.onpointermove = function(event) {
    mouse.x = _cx(event.offsetX);
    mouse.y = _cy(event.offsetY);
    mouse.tx = Math.floor(mouse.x/50) + 1;
    mouse.ty = bs.height - Math.floor(mouse.y/50);
    var piece = bs.pieceAt(mouse.tx,mouse.ty);
  }

  canvas.onpointerleave = function(event) {
    mouse.x = null;
    mouse.y = null;
    mouse.tx = null;
    mouse.ty = null;
  }

  canvas.onpointerdown = function(event) {
    this.setPointerCapture(event.pointerId);
    if (event.button == 0) leftDown(event);
    if (event.button == 1) middleDown(event);
    if (event.button == 2) rightDown(event);
  }

  canvas.onpointerup = function(event) {
    this.releasePointerCapture(event.pointerId);
    if (event.button == 0) leftUp(event);
    if (event.button == 1) middleUp(event);
    if (event.button == 2) rightUp(event);
  }

  function leftDown(event) {
    arrows = [];
    highlighted = [];
    var piece = bs.pieceAt(mouse.tx,mouse.ty);
    if (edit && sel.type != 'move') {
      if (piece) {bs.removePiece(piece)}
      if (sel.type == 'delete') return;
      piece = bs.addPiece(sel.color,sel.type,mouse.tx,mouse.ty);
      return;
    }
    if (!piece || (piece?.color != bs.turn && !edit)) return;

    mouse.holding = {};
    mouse.holding.piece = piece;
    mouse.holding.dx = 0;
    mouse.holding.dy = 0;
    mouse.holding.moves = piece.moves;
  }

  function leftUp(event) {
    if (!mouse.holding) return;
    var {piece,moves,dx,dy} = mouse.holding;
    if (!piece) return;

    var x = Math.floor((mouse.x-dx)/50) + 1,
        y = bs.height - Math.floor((mouse.y+dy)/50);

    if (!edit) {
      var move = moves.find(move => move.x==x && move.y==y);
      if (move) bs.makeMove(move);
    } else {
      if (!bs.validXY(x,y)) {
        bs.pieces.splice(bs.pieces.indexOf(piece),1);
        mouse.holding = null;
      }
      var target = bs.pieceAt(x,y);
      if (target === piece) return mouse.holding = null;
      if (target) bs.pieces.splice(bs.pieces.indexOf(target),1);
      bs.pieces.forEach(piece => {
        if (piece.enPassant) delete piece.enPassant;
      });
      piece.x = x;
      piece.y = y;
      if (piece.zeroMove) delete piece.zeroMove;
      bs.turn = bs.turn == 'white' ? 'black' : 'white';
    }
    bs.pieces.forEach(piece => piece.moves = bs.validateMoves(piece));

    checkmate = bs.pieces.filter(piece => piece.color == bs.turn).reduce((a,v) => a + v.moves.length, 0) == 0;

    mouse.holding = null;
  }

  function middleDown() {}

  function middleUp() {}

  function rightDown(event) {
    if (edit) {
      sel.color = sel.color == 'white' ? 'black' : 'white';
      return;
    }
    arrow = {from: {x: mouse.tx, y: mouse.ty}, to: null};
  }

  function rightUp(event) {
    if (!arrow) return;
    arrow.to = {x: mouse.tx, y: mouse.ty};

    if (
      arrow.from.x == arrow.to.x &&
      arrow.from.y == arrow.to.y
    ) {
      var highlight = {x: arrow.to.x, y:arrow.to.y};
      var _highlight = highlighted.find(h => 
        h.x == highlight.x &&
        h.y == highlight.y
      );
      if (_highlight) {
        highlighted.splice(highlighted.indexOf(_highlight),1);
      } else {
        highlighted.push(highlight);
      }
    } else {
      var _arrow = arrows.find(a => 
        a.from.x == arrow.from.x &&
        a.from.y == arrow.from.y &&
        a.to.x == arrow.to.x &&
        a.to.y == arrow.to.y
      );
      if (_arrow) {
        arrows.splice(arrows.indexOf(_arrow),1);
      } else {
        arrows.push(arrow);
      }
    }
    arrow = null;
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

  flip = false;

  for (col in chars) {
  for (type in chars[col]) {
    chars[col][type] = 
      String.fromCharCode(chars[col][type]);
  }}

  ctx.font = '50px Kurinto Mono';
  
  bs = new BoardState;
  
  if (typeof init == 'function') init();

  loop();
}

class BoardState {
  pieces = [];
  turn = 'white';
  halfmoves = 0;
  fullmoves = 1;
  
  constructor(width=8,height=8) {
    this.width = width;
    this.height = height;
  }

  fromFEN(fen) {
    this.pieces = [];
    var fields = fen.split(' ');
    var ranks = fields[0].split('/');
    this.height = ranks.length;
    this.width = ranks[0].split('')
      .map(n => isNaN(+n) ? 1 : +n)
      .reduce((a,v) => a+v);
    ranks.forEach((rank,y) => {
      y = this.height - y;
      var x = 1;
      rank.split('').forEach(p => {
        if ('12345678'.includes(p)) return x += +p;
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
        if (type == 'pawn') {
          if (color == 'white' && y == 2) piece.zeroMove = true;
          if (color == 'black' && y == 7) piece.zeroMove = true;
        }
        this.pieces.push(piece);
        x++;
      });
    });
    var rook = this.pieceAt(1,1);
    if (rook && rook.type == 'rook' && fields[2].includes('K')) rook.zeroMove = true;
    var rook = this.pieceAt(8,1);
    if (rook && rook.type == 'rook' && fields[2].includes('Q')) rook.zeroMove = true;
    var rook = this.pieceAt(1,8);
    if (rook && rook.type == 'rook' && fields[2].includes('k')) rook.zeroMove = true;
    var rook = this.pieceAt(8,8);
    if (rook && rook.type == 'rook' && fields[2].includes('q')) rook.zeroMove = true;
    var king = this.pieceAt(5,1);
    if (
      king && king.type == 'king' && 
      (fields[2].includes('K') || fields[2].includes('Q'))
    ) king.zeroMove = true;
    var king = this.pieceAt(5,8);
    if (
      king && king.type == 'king' && 
      (fields[2].includes('k') || fields[2].includes('q'))
    ) king.zeroMove = true;

    if (fields[3] != '-') {
      var ep = fromAlgebraic(fields[3]);
      var pawn = this.pieceAt(ep.x,ep.y+1);
      if (pawn) pawn.enPassant = true;
      var pawn = this.pieceAt(ep.x,ep.y-1);
      if (pawn) pawn.enPassant = true;
    }

    this.halfmoves = +fields[4];
    this.fullmoves = +fields[5];

    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));
    if (fields[1] == 'w') this.turn = 'white';
    if (fields[1] == 'b') this.turn = 'black';
    canvas.width = 50 * this.width;
    canvas.height = 50 * this.height;
  }

  toFEN() {
    if (this.width != 8 || this.height != 8) return;
    var fen = '';
    var acc = 0;
    for(y=8;y>=1;y--) {
    acc = 0;
    for(x=1;x<=8;x++) {
      let piece = this.pieceAt(x,y);
      if (piece) {
        if (acc > 0) fen += acc;
        acc = 0;
        var char = ({
          pawn: 'p',
          rook: 'r',
          knight: 'n',
          bishop: 'b',
          queen: 'q',
          king: 'k',
        })[piece.type];
        if (piece.color == 'white') {
          char = char.toUpperCase();
        }
        fen += char;
      } else acc++;
    }
    if (acc > 0) fen += acc;
    if (y > 1) fen += '/';
    }

    fen += ' ' + this.turn[0]

    var QR = this.pieceAt(1,1),
        KR = this.pieceAt(8,1),
        K = this.pieceAt(5,1),
        qr = this.pieceAt(1,8),
        kr = this.pieceAt(8,8),
        k = this.pieceAt(5,8);

    var castle = '';

    if (
      K && K.type == 'king' && K.zeroMove &&
      KR && KR.type == 'rook' && KR.zeroMove
    ) castle += 'K';
    if (
      K && K.type == 'king' && K.zeroMove &&
      QR && QR.type == 'rook' && QR.zeroMove
    ) castle += 'Q';
    if (
      k && k.type == 'king' && k.zeroMove &&
      kr && kr.type == 'rook' && kr.zeroMove
    ) castle += 'k';
    if (
      k && k.type == 'king' && k.zeroMove &&
      qr && qr.type == 'rook' && qr.zeroMove
    ) castle += 'q';
    if (castle.length == 0) castle = '-';

    fen += ' ' + castle;

    var enpassant = this.pieces.find(piece => piece?.enPassant);

    var ep = '';

    if (enpassant) {
      ep += 'abcdefgh'[enpassant.x-1];
      ep += enpassant.y
        + +(enpassant.color == 'black')
        - +(enpassant.color == 'white');
    }
    if (ep.length == 0) ep = '-';
    fen += ' ' + ep;
    fen += ' ' + this.halfmoves;
    fen += ' ' + this.fullmoves;
    return fen;
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

    var piece = {color,type,x,y,zeroMove:true,enPassant:false}
    this.pieces.push(piece);
    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));

    return piece;
  }

  removePiece(piece) {
    var i = this.pieces.indexOf(piece);
    if (i > -1) this.pieces.splice(i,1);
  }

  piecesFromTxt(txt) {
    var b = txt.split('\n').map(line => line.split(''));
    this.pieces = [];
    this.width = b[0].length;
    this.height = b.length;
    b.forEach((row,iy) => row.forEach((p,ix) => {
      if (p == ' ') return;
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
    if (typeof move === 'string') return this.moveSAN(move);
    var {piece,x,y,capture,castle} = move;
        this.halfmoves++;
        if (capture) {
          this.pieces.splice(this.pieces.indexOf(capture),1);
          this.halfmoves = 0;
        }
        this.pieces.filter(piece => {
          if (piece.enPassant) delete piece.enPassant;
        });
        if (piece.type == 'pawn') {
          if (Math.abs(piece.y - y) == 2) piece.enPassant = true;
          if ((piece.color == 'white' && y == 8)
            || (piece.color == 'black' && y == 1))
            piece.type = 'queen';
          this.halfmoves = 0;
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
        if (this.turn == 'black') this.fullmoves++;
        this.turn = this.turn == 'white' ? 'black' : 'white';

    this.pieces.forEach(piece => piece.moves = this.validateMoves(piece));
  }

  moves() {
    return this[this.turn].flatMap(piece => piece.moves);
  }

  moveSAN(san) {
    if (san == '0-0' || san == 'O-O') {
      var piece = this.pieces.find(piece => 
        piece.color == bs.turn && 
        piece.type == 'king' && 
        piece.moves.some(move => move.castle));
      var move = piece.moves.find(move => 
        move.castle && 
        move.x > piece.x);
      bs.makeMove(move);
      return;
    }
    if (san == '0-0-0' || san == 'O-O-O') {
      var piece = this.pieces.find(piece => 
        piece.color == bs.turn && 
        piece.type == 'king' && 
        piece.moves.some(move => move.castle));
      var move = piece.moves.find(move => 
        move.castle && 
        move.x < piece.x);
      bs.makeMove(move);
      return;
    }
    var capture = san.includes('x');
    san = san.replaceAll('x','');
    san = san.replaceAll('+','');
    san = san.replaceAll('#','');
    var promotion = san.includes('=');
    if (promotion) {
      var i = san.indexOf('=');
      promotion = san[i+1];
      if (promotion == 'R') promotion = 'rook';
      if (promotion == 'N') promotion = 'knight';
      if (promotion == 'B') promotion = 'bishop';
      if (promotion == 'Q') promotion = 'queen';
      san = san.slice(0,i) + san.slice(i+2);
    }
    var type;
    if ('abcdefgh'.includes(san[0])) type = 'pawn';
    if (san[0] == 'R') type = 'rook';
    if (san[0] == 'N') type = 'knight';
    if (san[0] == 'B') type = 'bishop';
    if (san[0] == 'Q') type = 'queen';
    if (san[0] == 'K') type = 'king';
    if (type != 'pawn') san = san.slice(1);
    var dest = this.fromAlgebraic(san.slice(-2));
    var from = san.slice(0,-2);
    var ex = () => true;
    if (from.length == 2) {
      var {x,y} = this.fromAlgebraic(from);
      ex = piece => piece.x == x && piece.y == y;
    }
    if (from.length == 1) {
      if ('abcdefgh'.includes(from)) {
        var {x} = this.fromAlgebraic(from + '1');
        ex = piece => piece.x == x;
      }
      if ('12345678'.includes(from)) {
        var {y} = this.fromAlgebraic('a' + from);
        ex = piece => piece.y == y;
      }
    }
    var piece = this.pieces.find(piece => 
      piece.color == bs.turn &&
      piece.type == type &&
      ex(piece) &&
      piece.moves.some(move =>
        move.x == dest.x &&
        move.y == dest.y &&
        !!move.capture == capture
      )
    );
    var move = piece.moves.find(move =>
      move.x == dest.x &&
      move.y == dest.y &&
      !!move.capture == capture
    );
    if (move) this.makeMove(move);
  }

  fromAlgebraic(coords) {
    var x = 'abcdefgh'.indexOf(coords[0]) + 1,
        y = +coords[coords.length - 1];
    return {x,y};
  }

  ascii() {
    var board = Array(8).fill().map(_ => Array(8).fill('.'));
    this.pieces.map(piece => {
      var char = piece.type[0];
      if (piece.type == 'knight') char = 'n';
      if (piece.color == 'white') char = char.toUpperCase();
      board[8-piece.y][piece.x-1] = char;
      return char;
    });
    return board.map((row,i)=>(8-i) + ' ' + row.join(' ')).join('\n') + '\n  a b c d e f g h'
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
function loop() {
  requestAnimationFrame(loop);
  upd();
  draw();
}

function upd() {
}

function _cx(x) {
  return flip ? canvas.width - x : x;
}
function _cy(y) {
  return flip ? canvas.height - y : y;
}

function _tx(x) {
  return flip ? bs.width - x + 1 : x;
}

function _ty(y) {
  return flip ? bs.height - y + 1 : y;
}

function highlightMove(x,y,capture) {
  if (!capture || !(capture.x == x && capture.y == y)) {
    var cx = _cx((x - 1)*50 + 25);
    var cy = _cy((bs.height - y)*50 + 25);
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
    var cx = _cx((capture.x - 1)*50 + 25);
    var cy = _cy((bs.height - capture.y)*50 + 25);
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

function v_dot(v1,v2) {
  return v1.x*v2.x+v1.y*v2.y;
}

function v_norm(v) {
  return v_dot(v,v);
}

function v_abs(v) {
  return Math.sqrt(v_norm(v));
}

function v_unit(v) {
  var abs = v_abs(v);
  return {x: v.x/abs, y: v.y/abs};
}

function dist2(x1,y1,x2,y2) {
  return ((dx,dy) => dx*dx+dy*dy)(x2-x1,y2-y1);
}

function dist(x1,y1,x2,y2) {
  return Math.sqrt(dist2(x1,y1,x2,y2));
}

function drawArrow(arrow) {
  var x0 = (arrow.from.x - 1)*50 + 25;
  var y0 = (bs.height - arrow.from.y)*50 + 25;
  var x1 = (arrow.to.x - 1)*50 + 25;
  var y1 = (bs.height - arrow.to.y)*50 + 25;
  var t = 20;
  var w = 5;
  var d = dist(x0,y0,x1,y1);
  var cx = x1 + t/d * (x0 - x1);
  var cy = y1 + t/d * (y0 - y1);

  var P = v_unit({x: y0 - y1, y: x1 - x0});

  var P1x = cx + t*P.x;
  var P1y = cy + t*P.y;
  var P2x = cx - t*P.x;
  var P2y = cy - t*P.y;
  var B1x = x0 + w*P.x;
  var B1y = y0 + w*P.y;
  var B2x = x0 - w*P.x;
  var B2y = y0 - w*P.y;
  var C1x = cx + w*P.x;
  var C1y = cy + w*P.y;
  var C2x = cx - w*P.x;
  var C2y = cy - w*P.y;


  ctx.fillStyle = 'black';
  ctx.globalAlpha = .33;
  ctx.beginPath();
  
  ctx.moveTo(_cx(x1),_cy(y1));
  ctx.lineTo(_cx(P1x),_cy(P1y));
  ctx.lineTo(_cx(C1x),_cy(C1y));
  ctx.lineTo(_cx(B1x),_cy(B1y));
  ctx.arcTo(_cx(B1x+B1x-C1x),_cy(B1y+B1y-C1y),_cx(B2x),_cy(B2y),w);
  ctx.lineTo(_cx(C2x),_cy(C2y));
  ctx.lineTo(_cx(P2x),_cy(P2y));
  ctx.lineTo(_cx(x1),_cy(y1));

  ctx.fill();
  ctx.closePath();

  ctx.globalAlpha = 1;
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
    if (highlighted.find(h => h.x == _tx(x) && h.y == _ty(y))) {
      ctx.fillStyle = ['#E16854','#CD6958'][(x+y+bs.width+bs.height)%2];
    }
    ctx.fillRect(cx,cy,50,50);
    var piece = bs.pieceAt(_tx(x),_ty(y));
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
    if (!edit) moves.forEach(pos => highlightMove(pos.x,pos.y,pos.capture));
    if (piece) {
      var img = imgs[piece.color][piece.type];
      ctx.drawImage(img,0,0,img.width,img.height,_cx(mouse.x-dx)-25,_cy(mouse.y+dy)-25,50,50);
    }
  }

  if (edit && sel.type != 'move' && sel.type != 'delete') {

    var cy = (bs.height - mouse.ty)*50;
        cx = (mouse.tx - 1)*50;
    var img = imgs[sel.color][sel.type];
    ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
  }

  if (q0) {
    if (Array.isArray(q0)) {
      q0.forEach(q0 => {
        var piece = q0.piece;
        if (piece) {
          var img = imgs[piece.color][piece.type];
          cx = (q0.current.x - 1)*50;
          cy = (bs.height - q0.current.y)*50;
          ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
        }
      });
    } else {
      var piece = q0.piece;
      if (piece) {
        var img = imgs[piece.color][piece.type];
        cx = (q0.current.x - 1)*50;
        cy = (bs.height - q0.current.y)*50;
        ctx.drawImage(img,0,0,img.width,img.height,cx,cy,50,50);
      }
    }
  }

  arrows.forEach(arrow => drawArrow(arrow));

}

