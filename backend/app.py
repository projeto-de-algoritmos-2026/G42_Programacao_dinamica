## arquivo responsável por criar o flask e sua conexão

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

@app.route('/')
def home():
    return{
        'message':'freela de PA '
    }

if __name__ == '__main__':
    app.run(debug=True)