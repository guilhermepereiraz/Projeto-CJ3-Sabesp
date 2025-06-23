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
    trHead.id = "trtopo";
    Object.keys(dados[0]).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.style.color = "#ffffff";
        th.style.fontWeight = "bolder";
        th.style.padding = "15px";
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

// Mostra um loading instantâneo enquanto carrega a tabela
function mostrarLoadingTabela() {
    const tabelaDiv = document.getElementById('tabelaDinamica');
    if (tabelaDiv) {
        tabelaDiv.innerHTML = '<div style="text-align:center;padding:40px 0;font-size:1.2em;color:#065f1a;">Carregando dados, aguarde...</div>';
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    mostrarLoadingTabela();
    montarTabelaDinamica();
    autocompleteContrato();
});

function autocompleteContrato() {
    const input = document.getElementById('codigoContratoInput');
    const sugestoesDiv = document.getElementById('sugestoesContrato');
    let timeout = null;

    if (!input || !sugestoesDiv) return;

    input.addEventListener('input', function () {
        clearTimeout(timeout);
        const termo = input.value.trim();
        if (termo.length < 1) {
            sugestoesDiv.style.display = 'none';
            sugestoesDiv.innerHTML = '';
            return;
        }
        timeout = setTimeout(async () => {
            const contratos = await eel.verificarContrato(termo)();
            sugestoesDiv.innerHTML = '';
            if (contratos && Array.isArray(contratos) && contratos.length > 0) {
                contratos.forEach(item => {
                    const valor = item.contrato;
                    const div = document.createElement('div');
                    div.textContent = valor;
                    div.className = 'autocomplete-item';
                    div.addEventListener('mousedown', function () {
                        input.value = valor;
                        sugestoesDiv.style.display = 'none';
                        sugestoesDiv.innerHTML = '';
                    });
                    sugestoesDiv.appendChild(div);
                });
                sugestoesDiv.style.display = 'block';
            } else {
                sugestoesDiv.style.display = 'none';
            }
        }, 300);
    });

    document.addEventListener('mousedown', function (e) {
        if (!sugestoesDiv.contains(e.target) && e.target !== input) {
            sugestoesDiv.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', autocompleteContrato);

function fadeOutIn({
    hideEls = [],
    showEls = [],
    duration = 500,
    callback = null
}) {
    // Fade out visível
    hideEls.forEach(el => {
        el.style.transition = `opacity ${duration / 1000}s`;
        el.style.opacity = '1';
    });
    setTimeout(() => {
        hideEls.forEach(el => el.style.opacity = '0');
        setTimeout(() => {
            // Esconde todos após fade-out
            hideEls.forEach(el => {
                el.style.display = 'none';
                el.style.transition = '';
            });
            // Só então mostra os novos
            showEls.forEach(el => {
                el.style.display = 'block';
                el.style.opacity = '0';
                el.style.transition = `opacity ${duration / 1000}s`;
            });
            setTimeout(() => {
                showEls.forEach(el => el.style.opacity = '1');
                if (callback) callback();
            }, 20);
        }, duration);
    }, 10);
}

function proximapg() {
    const tabelaContainer = document.getElementById('tabelaProjetosContainer');
    const tituloContainer = document.getElementById('tabelaProjetosTitle');
    const contratoContainer = document.getElementById('tabelaContratoContainer');
    const tituloContrato = document.getElementById('tabelaContratoTitle');

    if (tabelaContainer && tituloContainer && contratoContainer && tituloContrato) {
        fadeOutIn({
            hideEls: [tabelaContainer, tituloContainer],
            showEls: [contratoContainer, tituloContrato],
            duration: 500
        });
    }
}

function voltarPag() {
    const tabelaContainer = document.getElementById('tabelaProjetosContainer');
    const tituloContainer = document.getElementById('tabelaProjetosTitle');
    const contratoContainer = document.getElementById('tabelaContratoContainer');
    const tituloContrato = document.getElementById('tabelaContratoTitle');

    if (tabelaContainer && tituloContainer && contratoContainer && tituloContrato) {
        fadeOutIn({
            hideEls: [contratoContainer, tituloContrato],
            showEls: [tabelaContainer, tituloContainer],
            duration: 500
        });
    }
}

function AdicionarItem() {
    // Cria o overlay se não existir
    let overlay = document.getElementById('overlay-carregamento');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-carregamento';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(128,128,128,0.85)';
        overlay.style.zIndex = '9998';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s';
        overlay.style.display = 'block';
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    } else {
        overlay.style.display = 'block';
        overlay.style.transition = 'opacity 0.4s';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    }

    // Garante que a div de carregamento está no body e com z-index maior
    const divCarregamento = document.getElementById('tabelacarregando');
    const spinner = divCarregamento ? divCarregamento.querySelector('.spinner') : null;
    const checkDiv = document.getElementById('checkconfimar');

    if (divCarregamento) {
        divCarregamento.style.display = 'block';
        divCarregamento.style.width = "30%";
        divCarregamento.style.height = "33%";
        divCarregamento.style.zIndex = '9999'; // maior que o overlay
        divCarregamento.style.boxShadow = '3px 3px 8px rgba(0, 0, 0, 0.64)';
        divCarregamento.style.transition = 'opacity 0.4s';
        document.body.appendChild(divCarregamento);
        setTimeout(() => { divCarregamento.style.opacity = '1'; }, 50);
    }

    // Mostra o spinner e esconde o check
    if (spinner) spinner.style.display = 'block';
    if (checkDiv) checkDiv.style.display = 'none';

    // Após 3 segundos, esconde o spinner e mostra o check
    setTimeout(() => {
        const h1 = document.getElementById('salvarh1');
        if (spinner) spinner.style.display = 'none';
        if (checkDiv) checkDiv.style.display = 'flex';
        if (h1) h1.innerHTML = 'Alterações salvas com sucesso!';
    }, 2000);
}


function RemoverItem() {
    // Cria o overlay se não existir
    let overlay = document.getElementById('overlay-carregamento');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-carregamento';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(128,128,128,0.85)';
        overlay.style.zIndex = '8888';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s';
        overlay.style.display = 'block';
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    } else {
        overlay.style.display = 'block';
        overlay.style.transition = 'opacity 0.4s';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.opacity = '1'; }, 10);
    }

    const divRemover = document.getElementById('exclusaotela');
    const atalhoRemover = document.getElementById('removeritem');

    if (divRemover && atalhoRemover) {
        // Exibe a tela de confirmação com animação de transição
        divRemover.style.display = 'block';
        divRemover.style.width = "30%";
        divRemover.style.height = "33%";
        divRemover.style.boxShadow = '3px 3px 8px rgba(0, 0, 0, 0.64)';
        divRemover.style.opacity = '1';
        divRemover.style.zIndex = '8889';
        divRemover.style.transform = 'scale(0.7)';
        divRemover.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s';

        document.body.appendChild(divRemover);

        // Dispara a animação para o tamanho original
        setTimeout(() => {
            divRemover.style.transform = 'scale(1)';
        }, 10);
    }
}

function SairRemoverItem() {
    const divRemover = document.getElementById('exclusaotela');
    const overlay = document.getElementById('overlay-carregamento');

    if (divRemover) {
        divRemover.style.transform = 'scale(0.7)';
        divRemover.style.opacity = '0';
        divRemover.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s';

        setTimeout(() => {
            divRemover.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
        }, 400);
    }
}