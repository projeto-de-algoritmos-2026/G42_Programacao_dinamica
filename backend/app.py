## arquivo responsável por criar o flask e sua conexão

from routes import app


if __name__ == '__main__':
    app.run(debug=True)