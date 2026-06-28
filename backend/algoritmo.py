# arquivo que vai ter o algoritmo do trem , vou fzer orientado a objetos, acho masi facil e mais... legal ??

from operator import itemgetter

class Scheduling:
    def __init__(self, tarefas):
        self.tarefas= tarefas

    
    def ordena_pelo_termino(self):
        self.tarefas = sorted(self.tarefas, key= itemgetter('fim'))

        
    def calcula_compativeis(self):
        p =[]
        for i in range(len(self.tarefas)):
            ultimo_compa = -1
            for j in range(i-1,-1,-1):
                if self.tarefas[j]['fim'] <= self.tarefas[i]['inicio']:
                    ultimo_compa = j
                    break
            p.append(ultimo_compa)
        
        self.p = p 

    def calcula_lucro(self):

        n = len(self.tarefas)
        if n == 0 :
            self.dp  = []
            return
        
        dp = [0] * n 

        dp[0] = self.tarefas[0]["valor"]

        for i in range(1, n):

            incluir = self.tarefas[i]["valor"]

            # Soma o melhor lucro compatível
            if self.p[i] != -1:
                incluir += dp[self.p[i]]

            # Não pegar o projeto
            excluir = dp[i - 1]

            dp[i] = max(incluir, excluir)

        self.dp = dp
        return dp 

    def reconstruir_solucao(self):
        escolhidas = []

        i = len(self.tarefas) - 1

        while i >= 0:

            incluir = self.tarefas[i]["valor"]

            if self.p[i] != -1:
                incluir += self.dp[self.p[i]]

            excluir = self.dp[i - 1] if i > 0 else 0

            # O projeto foi escolhido?
            if incluir >= excluir:
                escolhidas.append(self.tarefas[i])
                i = self.p[i]
            else:
                i -= 1

        escolhidas.reverse()

        return escolhidas
        
    def schedule(self):
        self.ordena_pelo_termino()
        self.calcula_compativeis()
        self.calcula_lucro()

        return {
            "lucro": self.dp[-1] if self.dp else 0,
            "projetos": self.reconstruir_solucao()
        }