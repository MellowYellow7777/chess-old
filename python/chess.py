from classes import BoardState

class Chess:
  def __init__(self):
    self.bs = BoardState()

  def newGame(self):
    self.bs.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  def makeMove(self,move):
    self.bs.makeMove(move)

  def getBoard(self):
    return self.bs

  def getMoves(self):
    return self.bs.moves()
