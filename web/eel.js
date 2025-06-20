
async function montarTabelaDinamica() {
    // Chama a função Python via Eel
    const dados = await eel.verificarColunaPrimaria()();
    const tabelaDiv = document.getElementById('tabelaDinamica');
    tabelaDiv.innerHTML = '';

    if (!dados || dados.erro) {
        tabelaDiv.innerHTML = '<p>Erro ao carregar dados: ' + (dados ? dados.erro : 'Desconhecido') + '</p>';
        return;
    }
    if (dados.length === 0) {
        tabelaDiv.innerHTML = '<p>Nenhum dado encontrado.</p>';
        return;
    }

    // Cria a tabela
    const tabela = document.createElement('table');
    tabela.className = 'min-w-full divide-y divide-gray-200';

    // Cabeçalho dinâmico
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    Object.keys(dados[0]).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.className = 'px-6 py-4 whitespace-nowrap text-sm font-bold bg-gray-100';
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabela.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    dados.forEach(linha => {
        const tr = document.createElement('tr');
        Object.values(linha).forEach(valor => {
            const td = document.createElement('td');
            td.textContent = valor;
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tabela.appendChild(tbody);

    tabelaDiv.appendChild(tabela);
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', montarTabelaDinamica);