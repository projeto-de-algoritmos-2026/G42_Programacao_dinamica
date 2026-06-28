## arquivo responsável por criar o flask e sua conexão

from flask import Flask
from flask import request, render_template, redirect,jsonify
from flask_cors import CORS
from algoritmo import Scheduling

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    render_template('home')


@app.post("/schedule")
def schedule():
    try:
        # tratamento de erros pra nao negoçar o front
        tarefas = request.get_json()# aqui ele espera uma lista nao um objeto
        scheduler = Scheduling(tarefas)

        resultado = scheduler.schedule()

        return jsonify(resultado), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)