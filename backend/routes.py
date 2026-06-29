from flask import Flask
from flask import request, render_template, redirect,jsonify
from flask_cors import CORS
from algoritmo import Scheduling
import os

style_path=os.path.join(os.path.dirname(__file__),'../frontend/','templates')
static_path=os.path.join(os.path.dirname(__file__),'../frontend/','static')
app = Flask(__name__,template_folder=style_path,static_folder=static_path)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')


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
