/python/class Piece:
  def __init__(self, color, type, x, y):
    self.color = color
    self.type = type
    self.x = x
    self.y = y
    self.zeroMove = True
    self.enPassant = False

  def __repr__(self):
    return self.color + ' ' + self.type + ' at ' + str(self.x) + ',' + str(self.y)

class Move:
  def __init__(self,piece,x,y,capture=False,castle=False,promotion=False):
    self.piece = piece
    self.x = x
    self.y = y
    self.capture = capture
    self.castle = castle
    self.promotion = promotion
  def __repr__(self):
    #return self.piece.__repr__() + ' to ' + str(self.x) + ',' + str(self.y)
    return self.toSAN()
  def toSAN(self):
    if self.castle:
      if self.piece.x < self.x:
        return '0-0'
      else:
        return '0-0-0'

    san = ''
    if self.piece.type == 'rook': san += 'R'
    if self.piece.type == 'knight': san += 'N'
    if self.piece.type == 'bishop': san += 'B'
    if self.piece.type == 'queen': san += 'Q'
    if self.piece.type == 'king': san += 'K'    
    san += self.toAlgebraic(self.piece.x,self.piece.y)
    if bool(self.capture): san += 'x'
    san += self.toAlgebraic(self.x,self.y)
    if bool(self.promotion):
      if self.promotion == 'rook': san += '=R'
      if self.promotion == 'knight': san += '=N'
      if self.promotion == 'bishop': san += '=B'
      if self.promotion == 'queen': san += '=Q'
    return san
  def toAlgebraic(self,x,y):
    return 'abcdefgh'[x-1] + str(y)
  def copy(self):
    return Move(self.piece,self.x,self.y,self.capture,self.castle,self.promotion)



class BoardState:
  def __init__(self, width=8, height=8):
    self.pieces = []
    self.turn = 'white'
    self.halfmoves = 0
    self.fullmoves = 1
    self.width = width
    self.height = height

  def __repr__(self):
    return self.ascii()

  def fromFEN(self, fen):
    self.pieces = []
    fields = fen.split(' ')
    ranks = fields[0].split('/')
    self.height = len(ranks)
    self.width = sum([int(c) if c in '12345678' else 1 for c in ranks[0]])
    for y, rank in enumerate(ranks):
      y = self.height - y
      x = 1
      for p in rank:
        if p.isdigit():
          x += int(p)
        else:
          color = 'white' if p.isupper() else 'black'
          type = {
            'p': 'pawn',
            'n': 'knight',
            'r': 'rook',
            'b': 'bishop',
            'q': 'queen',
            'k': 'king'
          }[p.lower()]
          piece = Piece(color,type,x,y)
          if type == 'pawn':
            if color == 'white' and y == 2:
              piece.zeroMove = True
            if color == 'black' and y == 7:
              piece.zeroMove = True
          self.pieces.append(piece)
          x += 1
    rook = self.pieceAt(1, 1)
    if rook and rook.type == 'rook' and 'K' in fields[2]:
      rook.zeroMove = True
    rook = self.pieceAt(8, 1)
    if rook and rook.type == 'rook' and 'Q' in fields[2]:
      rook.zeroMove = True
    rook = self.pieceAt(1, 8)
    if rook and rook.type == 'rook' and 'k' in fields[2]:
      rook.zeroMove = True
    rook = self.pieceAt(8, 8)
    if rook and rook.type == 'rook' and 'q' in fields[2]:
      rook.zeroMove = True
    king = self.pieceAt(5, 1)
    if king and king.type == 'king' and ('K' in fields[2] or 'Q' in fields[2]):
      king.zeroMove = True
    king = self.pieceAt(5, 8)
    if king and king.type == 'king' and ('k' in fields[2] or 'q' in fields[2]):
      king.zeroMove = True
    if fields[3] != '-':
      ep = fromAlgebraic(fields[3])
      pawn = self.pieceAt(ep.x, ep.y + 1)
      if pawn:
        pawn.enPassant = True
      pawn = self.pieceAt(ep.x, ep.y - 1)
      if pawn:
        pawn.enPassant = True
    self.halfmoves = int(fields[4])
    self.fullmoves = int(fields[5])
    for piece in self.pieces:
      piece.moves = self.validateMoves(piece)
    if fields[1] == 'w':
      self.turn = 'white'
    if fields[1] == 'b':
      self.turn = 'black'

  def toFEN(self):
    if self.width != 8 or self.height != 8:
      return
    fen = ''
    for y in range(8, 0, -1):
      acc = 0
      for x in range(1, 9):
        piece = self.pieceAt(x, y)
        if piece:
          if acc > 0:
            fen += str(acc)
          acc = 0
          char = {
            'pawn': 'p',
            'rook': 'r',
            'knight': 'n',
            'bishop': 'b',
            'queen': 'q',
            'king': 'k'
          }[piece.type]
          if piece.color == 'white':
            char = char.upper()
          fen += char
        else:
          acc += 1
      if acc > 0:
        fen += str(acc)
      if y > 1:
        fen += '/'
    
    fen += ' ' + self.turn[0]

    QR = self.pieceAt(1, 1)
    KR = self.pieceAt(8, 1)
    K = self.pieceAt(5, 1)
    qr = self.pieceAt(1, 8)
    kr = self.pieceAt(8, 8)
    k = self.pieceAt(5, 8)

    castle = ''

    if K and K.type == 'king' and K.zeroMove and KR and KR.type == 'rook' and KR.zeroMove:
      castle += 'K'
    if K and K.type == 'king' and K.zeroMove and QR and QR.type == 'rook' and QR.zeroMove:
      castle += 'Q'
    if k and k.type == 'king' and k.zeroMove and kr and kr.type == 'rook' and kr.zeroMove:
      castle += 'k'
    if k and k.type == 'king' and k.zeroMove and qr and qr.type == 'rook' and qr.zeroMove:
      castle += 'q'
    if len(castle) == 0:
      castle = '-'

    fen += ' ' + castle

    enpassant = next((piece for piece in self.pieces if piece and piece.enPassant), None)

    ep = ''

    if enpassant:
      ep += 'abcdefgh'[enpassant.x-1]
      ep += str(enpassant.y) + str(int(enpassant.color == 'black') - int(enpassant.color == 'white'))
    if len(ep) == 0:
      ep = '-'
    fen += ' ' + ep
    fen += ' ' + str(self.halfmoves)
    fen += ' ' + str(self.fullmoves)
    return fen

  def copy(self):
    b = BoardState(self.width, self.height)
    b.turn = self.turn

    for piece in self.pieces:
      newpiece = Piece(piece.color,piece.type,piece.x,piece.y)
      newpiece.zeroMove = piece.zeroMove
      newpiece.enPassant = piece.enPassant
      b.pieces.append(newpiece)
    for piece in b.pieces:
      piece.moves = b.validateMoves(piece)

    return b

  def getMovePositions(self):
    mp = []
    for move in self.moves():
      movestr = str(move)
      bs = self.copy()
      bs.makeMove(movestr)
      mp.append([movestr,str(bs)])
    return mp

  def addPiece(self, color, type, x, y):
    if self.pieceAt(x, y):
      return False

    piece = Piece(color,type,x,y)
    piece.zeroMove = True
    piece.enPassant = False
    self.pieces.append(piece)
    for piece in self.pieces:
      piece.moves = self.validateMoves(piece)

    return piece

  def removePiece(self, piece):
    i = self.pieces.index(piece)
    if i > -1:
      self.pieces.pop(i)

  def pieceAt(self, x, y):
    return next((piece for piece in self.pieces if piece.x == x and piece.y == y), None)

  def validXY(self, x, y):
    return x >= 1 and y >= 1 and x <= self.width and y <= self.height

  def getMoves(self, piece, skipex=False):
    if not piece:
      return []
    if piece.type == 'pawn':
      return self.getPawnMoves(piece)
    if piece.type == 'rook':
      return self.getRookMoves(piece)
    if piece.type == 'bishop':
      return self.getBishopMoves(piece)
    if piece.type == 'queen':
      return self.getQueenMoves(piece)
    if piece.type == 'knight':
      return self.getKnightMoves(piece)
    if piece.type == 'king':
      return self.getKingMoves(piece, skipex)

  def getPawnMoves(self, piece):
    x, y, color = piece.x, piece.y, piece.color
    dir = 1 if color == 'white' else -1
    moves = []
    if self.validXY(x, y + dir) and not self.pieceAt(x, y + dir):
      moves.append(Move(piece,x,y + dir))
    if len(moves) == 1 and piece.zeroMove and self.validXY(x, y + 2 * dir) and not self.pieceAt(x, y + 2 * dir):
      moves.append(Move(piece,x,y + 2 * dir))
    capture = self.pieceAt(x + 1, y + dir)
    if self.validXY(x + 1, y + dir) and capture and capture.color != color:
      moves.append(Move(piece,x + 1,y + dir,capture))
    capture = self.pieceAt(x - 1, y + dir)
    if self.validXY(x - 1, y + dir) and capture and capture.color != color:
      moves.append(Move(piece,x - 1,y + dir,capture))
    capture = self.pieceAt(x + 1, y)
    if (self.validXY(x + 1, y + dir) and capture and capture.enPassant and capture.color != color):
      moves.append(Move(piece,x + 1,y + dir,capture))
    capture = self.pieceAt(x - 1, y)
    if (self.validXY(x - 1, y + dir) and capture and capture.enPassant and capture.color != color):
      moves.append(Move(piece,x - 1,y + dir,capture))
    promotion_moves = []
    for move in moves:
      if (move.y == 8 and piece.color == 'white') or (move.y == 1 and piece.color == 'black'):
        move.promotion = 'queen'
        for promotion_type in ['rook', 'knight', 'bishop']:
          copy = move.copy()
          copy.promotion = promotion_type
          promotion_moves.append(copy)

    moves.extend(promotion_moves)
    return moves


  def getLineMoves(self, piece, directions):
    x = piece.x
    y = piece.y
    color = piece.color
    moves = []

    for dx, dy in directions:
      cx, cy = x, y
      while self.validXY(cx + dx, cy + dy):
        capture = self.pieceAt(cx + dx, cy + dy)
        if capture:
          if capture.color != color:
            moves.append(Move(piece,cx + dx,cy + dy,capture))
          break
        moves.append(Move(piece,cx + dx,cy + dy))
        cx += dx
        cy += dy

    return moves

  def getRookMoves(self, piece):
    return self.getLineMoves(piece, [(1, 0), (-1, 0), (0, 1), (0, -1)])

  def getBishopMoves(self, piece):
    return self.getLineMoves(piece, [(1, 1), (-1, 1), (1, -1), (-1, -1)])

  def getQueenMoves(self, piece):
    return self.getRookMoves(piece) + self.getBishopMoves(piece)

  def getKnightMoves(self, piece):
    x = piece.x
    y = piece.y
    color = piece.color
    moves = []
    possible_moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (-1, -2), (-2, -1), (1, -2), (2, -1)]
    for dx, dy in possible_moves:
      new_x, new_y = x + dx, y + dy
      if self.validXY(new_x, new_y):
        capture = self.pieceAt(new_x, new_y)
        if capture:
          if capture.color != color:
            moves.append(Move(piece,new_x,new_y,capture))
        else:
          moves.append(Move(piece,new_x,new_y))
    return moves

  def getKingMoves(self, piece, skipex):
    x = piece.x
    y = piece.y
    color = piece.color
    moves = []
    possible_moves = [(1, 1), (1, 0), (1, -1), (0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1)]
    for dx, dy in possible_moves:
      new_x, new_y = x + dx, y + dy
      if self.validXY(new_x, new_y):
        capture = self.pieceAt(new_x, new_y)
        if capture:
          if capture.color != color:
            moves.append(Move(piece,new_x,new_y,capture))
        else:
          moves.append(Move(piece,new_x,new_y))
    
    if skipex:
      return moves
    
    attacks = self.getAttacks(self.opponentColor(color))
    check = self.inCheck(color)
    
    if piece.zeroMove and not check:
      rook1 = self.pieceAt(self.width, y)
      if rook1 and rook1.type == 'rook' and rook1.zeroMove and not self.pieceAt(x + 1, y) and not self.pieceAt(x + 2, y) and not any(a.x == x + 1 and a.y == y for a in attacks) and not any(a.x == x + 2 and a.y == y for a in attacks):
        moves.append(Move(piece,x + 2,y,castle=rook1))
      rook2 = self.pieceAt(1, y)
      if rook2 and rook2.type == 'rook' and rook2.zeroMove and not self.pieceAt(x - 1, y) and not self.pieceAt(x - 2, y) and not self.pieceAt(x - 3, y) and not any(a.x == x - 1 and a.y == y for a in attacks) and not any(a.x == x - 2 and a.y == y for a in attacks) and not any(a.x == x - 3 and a.y == y for a in attacks):
        moves.append(Move(piece,x - 3,y,castle=rook2))
    
    return moves

  def getAttacks(self, color):
    attacks = []

    def add_unique(pos):
      nonlocal attacks
      if not any(attack.x == pos.x and attack.y == pos.y for attack in attacks):
        attacks.append(pos)

    for piece in self.pieces:
      if piece.color == color:
        if piece.type == 'pawn':
          dir = 1 if piece.color == 'white' else -1
          for move in [Move(piece,piece.x+1,piece.y+dir), Move(piece,piece.x-1,piece.y+dir)]:
            if self.validXY(move.x, move.y):
              add_unique(move)
        else:
          for move in self.getMoves(piece, True):
            add_unique(move)

    return attacks

  def validateMoves(self, piece):
    moves = self.getMoves(piece)
    x0, y0 = piece.x, piece.y
    valid_moves = []
    for move in moves:
      capture = self.pieceAt(move.x, move.y)
      i = self.pieces.index(capture) if capture else -1
      if capture:
        self.pieces.pop(i)
      piece.x, piece.y = move.x, move.y
      valid = not self.inCheck(piece.color)
      piece.x, piece.y = x0, y0
      if capture:
        self.pieces.insert(i, capture)
      if valid:
        valid_moves.append(move)
    return valid_moves

  def inCheck(self, color):
    attacks = self.getAttacks(self.opponentColor(color))
    kings = [piece for piece in self.pieces if piece.color == color and piece.type == 'king']
    for king in kings:
      for attack in attacks:
        if attack.x == king.x and attack.y == king.y:
          return True
    return False

  def opponentColor(self, color):
    return 'black' if color == 'white' else 'white'

  def makeMove(self, move):
    if isinstance(move, str):
      return self.moveSAN(move)
    else:
      piece = move.piece
      x = move.x
      y = move.y
      capture = move.capture
      castle = move.castle
      self.halfmoves += 1
      if capture:
        self.pieces.remove(capture)
        self.halfmoves = 0
      for _piece in self.pieces:
        if _piece.enPassant:
          _piece.enPassant = False
      if piece.type == 'pawn':
        if abs(piece.y - y) == 2:
          piece.enPassant = True
        if bool(move.promotion):
          piece.type = move.promotion
        self.halfmoves = 0
      if castle:
        if castle.x == 1:
          castle.x = x + 1
        if castle.x == self.width:
          castle.x = x - 1
      piece.x = x
      piece.y = y
      if piece.zeroMove:
        piece.zeroMove = False
      if self.turn == 'black':
        self.fullmoves += 1
      self.turn = 'black' if self.turn == 'white' else 'white'
    for piece in self.pieces:
      piece.moves = self.validateMoves(piece)

  def moves(self):
    if self.turn == 'white':
      moves = [piece.moves for piece in self.white]
    else:
      moves = [piece.moves for piece in self.black]
    return [x for xs in moves for x in xs]

  def moveSAN(self, san):
    if san == '0-0' or san == 'O-O':
      piece = next((piece for piece in self.pieces if piece.color == self.turn and piece.type == 'king' and any(move.castle for move in piece.moves)), None)
      move = next((move for move in piece.moves if move.castle and move.x > piece.x), None)
      self.makeMove(move)
      return
    if san == '0-0-0' or san == 'O-O-O':
      piece = next((piece for piece in self.pieces if piece.color == self.turn and piece.type == 'king' and any(move.castle for move in piece.moves)), None)
      move = next((move for move in piece.moves if move.castle and move.x < piece.x), None)
      self.makeMove(move)
      return
    capture = 'x' in san
    san = san.replace('x', '')
    san = san.replace('+', '')
    san = san.replace('#', '')
    promotion = '=' in san
    if promotion:
      i = san.index('=')
      promotion = san[i+1]
      if promotion == 'R':
        promotion = 'rook'
      if promotion == 'N':
        promotion = 'knight'
      if promotion == 'B':
        promotion = 'bishop'
      if promotion == 'Q':
        promotion = 'queen'
      san = san[:i] + san[i+2:]
    type = None
    if 'abcdefgh'.find(san[0]) != -1:
      type = 'pawn'
    if san[0] == 'R':
      type = 'rook'
    if san[0] == 'N':
      type = 'knight'
    if san[0] == 'B':
      type = 'bishop'
    if san[0] == 'Q':
      type = 'queen'
    if san[0] == 'K':
      type = 'king'
    if type != 'pawn':
      san = san[1:]
    dest = san[-2:]
    if 'abcdefgh'.find(dest[0]) == -1: return
    if '12345678'.find(dest[1]) == -1: return
    dest = self.fromAlgebraic(dest)
    from_pos = san[:-2]
    ex = lambda piece: True
    if len(from_pos) == 2:
      x, y = self.fromAlgebraic(from_pos)
      ex = lambda piece: piece.x == x and piece.y == y
    if len(from_pos) == 1:
      if 'abcdefgh'.find(from_pos) != -1:
        x = self.fromAlgebraic(from_pos + '1')[0]
        ex = lambda piece: piece.x == x
      if '12345678'.find(from_pos) != -1:
        y = self.fromAlgebraic('a' + from_pos)[1]
        ex = lambda piece: piece.y == y
    piece = next((piece for piece in self.pieces if piece.color == self.turn and piece.type == type and ex(piece) and any(move.x == dest[0] and move.y == dest[1] and bool(move.capture) == capture for move in piece.moves)), None)
    if (piece == None): return
    move = next((m for m in piece.moves if m.x == dest[0] and m.y == dest[1] and bool(m.capture) == capture and ((not m.promotion) or (m.promotion == promotion))), None)
    if move:
      self.makeMove(move)

  def fromAlgebraic(self, coords):
    x = 'abcdefgh'.find(coords[0]) + 1
    y = int(coords[-1])
    return x, y

  def toAlgebraic(self,x,y):
    return 'abcdefgh'[x-1] + str(y)

  def ascii(self):
    board = [['.' for _ in range(8)] for _ in range(8)]
    for piece in self.pieces:
      char = piece.type[0]
      if piece.type == 'knight':
        char = 'n'
      if piece.color == 'white':
        char = char.upper()
      board[8-piece.y][piece.x-1] = char
    return '\n'.join([f'{8-i} {" ".join(row)}' for i, row in enumerate(board)]) + '\n  a b c d e f g h\n'

  @property
  def white(self):
    return [piece for piece in self.pieces if piece.color == 'white']

  @property
  def black(self):
    return [piece for piece in self.pieces if piece.color == 'black']
