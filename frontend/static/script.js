
let tarefas = []; // [{ nome, inicio, fim, valor }]

const form = document.getElementById('form-tarefa');
const inputNome = document.getElementById('nome');
const inputInicio = document.getElementById('inicio');
const inputFim = document.getElementById('fim');
const inputValor = document.getElementById('valor');
const formErro = document.getElementById('form-erro');

const taskList = document.getElementById('task-list');
const taskListEmpty = document.getElementById('task-list-empty');
const contadorTarefas = document.getElementById('contador-tarefas');

const btnCalcular = document.getElementById('btn-calcular');

const gantt = document.getElementById('gantt');
const ganttEmpty = document.getElementById('gantt-empty');
const legend = document.getElementById('legend');

const resultPlaceholder = document.getElementById('result-placeholder');
const resultContent = document.getElementById('result-content');
const resultadoLucro = document.getElementById('resultado-lucro');

function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR');
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}


//formulario
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const inicio = Number(inputInicio.value);
    const fim = Number(inputFim.value);
    const valor = Number(inputValor.value);

    formErro.textContent = '';

    if (!nome) {
        formErro.textContent = 'Informe um nome para a tarefa.';
        return;
    }

    if (Number.isNaN(inicio) || Number.isNaN(fim) || Number.isNaN(valor)) {
        formErro.textContent = 'Início, fim e valor precisam ser números.';
        return;
    }

    if (fim <= inicio) {
        formErro.textContent = 'O horário de fim deve ser depois do início.';
        return;
    }

    tarefas.push({ nome, inicio, fim, valor });

    form.reset();
    inputNome.focus();

    legend.hidden = true;
    resultPlaceholder.hidden = false;
    resultContent.hidden = true;

    renderizarTudo();
});

//lista de tarefas
function renderizarFila() {
    taskList.innerHTML = '';

    if (tarefas.length === 0) {
        taskList.appendChild(taskListEmpty);
        contadorTarefas.textContent = '0';
        btnCalcular.disabled = true;
        return;
    }

    contadorTarefas.textContent = String(tarefas.length);
    btnCalcular.disabled = false;

    tarefas.forEach(function (tarefa, index) {
        const item = document.createElement('li');
        item.className = 'task-item';
        item.innerHTML = `
            <span class="task-item__time">${tarefa.inicio}h–${tarefa.fim}h</span>
            <span class="task-item__name">${escapeHtml(tarefa.nome)}</span>
            <span class="task-item__value">${formatarMoeda(tarefa.valor)}</span>
            <button type="button" class="task-item__remove" data-index="${index}" aria-label="Remover tarefa">✕</button>
        `;
        taskList.appendChild(item);
    });

    taskList.querySelectorAll('.task-item__remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const index = Number(btn.getAttribute('data-index'));
            tarefas.splice(index, 1);
            renderizarTudo();
        });
    });
}

//agenda
const ALTURA_LINHA = 38;

function renderizarGantt(selecionadas) {
    gantt.innerHTML = '';

    if (tarefas.length === 0) {
        gantt.appendChild(ganttEmpty);
        return;
    }

    const minHora = Math.floor(Math.min(...tarefas.map(t => t.inicio)));
    const maxHora = Math.ceil(Math.max(...tarefas.map(t => t.fim)));
    const span = Math.max(maxHora - minHora, 1);

    const nomesSelecionados = selecionadas ? new Set(selecionadas.map(t => t.nome)) : null;

    // container das linhas
    const rows = document.createElement('div');
    rows.className = 'gantt__rows';
    rows.style.height = (tarefas.length * ALTURA_LINHA) + 'px';

    // linhas verticais pontilhadas, uma por hora
    const gridlines = document.createElement('div');
    gridlines.className = 'gantt__gridlines';
    for (let h = minHora; h <= maxHora; h++) {
        const pos = ((h - minHora) / span) * 100;
        const linha = document.createElement('div');
        linha.className = 'gantt__gridline';
        linha.style.left = pos + '%';
        gridlines.appendChild(linha);
    }
    rows.appendChild(gridlines);

    // uma linha por tarefa, na ordem em que foram adicionadas (igual ao diagrama)
    tarefas.forEach(function (tarefa, index) {
        const row = document.createElement('div');
        row.className = 'gantt-row';

        const left = ((tarefa.inicio - minHora) / span) * 100;
        const width = ((tarefa.fim - tarefa.inicio) / span) * 100;

        const bar = document.createElement('div');
        bar.className = 'gantt-bar';
        bar.style.left = left + '%';
        bar.style.width = width + '%';
        bar.textContent = tarefa.nome;

        if (nomesSelecionados) {
            bar.classList.add(
                nomesSelecionados.has(tarefa.nome) ? 'gantt-bar--selected' : 'gantt-bar--rejected'
            );
        }

        row.appendChild(bar);
        rows.appendChild(row);
    });

    gantt.appendChild(rows);

    // eixo de tempo embaixo, com tick por hora
    const axis = document.createElement('div');
    axis.className = 'gantt__axis';
    axis.style.height = '20px';

    for (let h = minHora; h <= maxHora; h++) {
        const pos = ((h - minHora) / span) * 100;
        const tick = document.createElement('span');
        tick.className = 'gantt__tick';
        tick.style.left = pos + '%';
        tick.textContent = h;
        axis.appendChild(tick);
    }

    gantt.appendChild(axis);
}

function renderizarTudo(selecionadas) {
    renderizarFila();
    renderizarGantt(selecionadas);
}

//algoritmo
btnCalcular.addEventListener('click', async function () {
    if (tarefas.length === 0) return;

    btnCalcular.disabled = true;
    btnCalcular.textContent = 'Calculando...';

    try {
        const resposta = await fetch('/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarefas)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            formErro.textContent = 'Erro: ' + (dados.erro || 'falha desconhecida.');
            return;
        }

        renderizarResultado(dados);
        renderizarGantt(dados.projetos);

    } catch (erro) {
        formErro.textContent = 'Erro ao conectar com o servidor: ' + erro.message;
    } finally {
        btnCalcular.disabled = tarefas.length === 0;
        btnCalcular.textContent = 'Calcular melhor agendamento';
    }
});

function renderizarResultado(dados) {
    resultPlaceholder.hidden = true;
    resultContent.hidden = false;
    legend.hidden = false;

    resultadoLucro.textContent = formatarMoeda(dados.lucro);
}
renderizarTudo();