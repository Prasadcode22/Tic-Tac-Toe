from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

HUMAN = 'X'
AI = 'O'
EMPTY = ' '

winning_lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
]

def is_winner(board, player):
    for line in winning_lines:
        if all(board[i] == player for i in line):
            return True
    return False

def is_board_full(board):
    return all(s != EMPTY for s in board)

def minimax(board, depth, is_maximizing):
    if is_winner(board, AI):
        return 10 - depth
    if is_winner(board, HUMAN):
        return depth - 10
    if is_board_full(board):
        return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = AI
                score = minimax(board, depth + 1, False)
                board[i] = EMPTY
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == EMPTY:
                board[i] = HUMAN
                score = minimax(board, depth + 1, True)
                board[i] = EMPTY
                best_score = min(score, best_score)
        return best_score

def best_move(board):
    best_score = -float('inf')
    move = None
    for i in range(9):
        if board[i] == EMPTY:
            board[i] = AI
            score = minimax(board, 0, False)
            board[i] = EMPTY
            if score > best_score:
                best_score = score
                move = i
    return move

def random_move(board):
    empties = [i for i, v in enumerate(board) if v == EMPTY]
    return random.choice(empties) if empties else None

def medium_move(board):
    import random
    if random.random() < 0.5:
        return random_move(board)
    else:
        return best_move(board)

@app.route('/ai-move', methods=['POST'])
def ai_move():
    data = request.get_json()
    board = data.get('board')
    difficulty = data.get('difficulty', 'hard').lower()

    if not board or len(board) != 9:
        return jsonify({'error': 'Invalid board'}), 400

    if difficulty == 'low':
        move = random_move(board)
    elif difficulty == 'medium':
        move = medium_move(board)
    else:
        move = best_move(board)

    return jsonify({'move': move})

if __name__ == '__main__':
    app.run(debug=True)
