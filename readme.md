# Ideia geral
## nome: Freela Sheduler

Imagine que você é um desenvolvedor freelancer e recebe várias propostas de serviço.

Cada proposta possui:

Nome do projeto
Horário de início
Horário de término
Valor pago

Como você só pode trabalhar em um projeto por vez, o sistema deve encontrar a combinação de projetos que gera o maior lucro possível.

Esse é exatamente o problema de Weighted Interval Scheduling (Interval Scheduling com Peso).


O usuario vai informar o nome, horario de inicio, horario de fim e valor da tarefa. Apos adicionar deve aparecer na lista de tarefas do cara, como uma lista comun (se der tempo botar em grafico).
Vai existir um botao de 'calcular agenda', clicando nele vai executar o algoritmo e atravez d eum endpoint do flask, que vai retornar quais sao as tarefas que serao eitas pra maximar o lucro 