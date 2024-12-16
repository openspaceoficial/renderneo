// Objeto para armazenar todos os cheques
let cheques = {};

function carregarFiltros() {
    // Obtém o valor selecionado no dropdown
    var filtroSelecionado = document.getElementById("status-filtroo").value;

    // Referência a todos os filtros
    var filtros = {
        Nome: document.getElementById("filtro-nome"),
        Data: document.getElementById("filtro-data"),
        Status: document.getElementById("filtro-status")
    };

    // Oculta todos os filtros inicialmente
    Object.keys(filtros).forEach(function(filtro) {
        filtros[filtro].style.display = "none";
    });

    // Exibe o filtro correspondente ao valor selecionado, se não for "Selecione"
    if (filtroSelecionado && filtros[filtroSelecionado]) {
        filtros[filtroSelecionado].style.display = "block";
    }
}



async function carregarCheques(status = 'todos') {
    // Define a URL com base no filtro de status
    const url =
        status === 'todos'
            ? 'http://localhost:5002/api/cheques/todos'
            : `http://localhost:5002/api/cheques/todos?status=${encodeURIComponent(status)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                // Se for 404, nenhuma mensagem genérica - tratamos como "sem cheques encontrados"
                atualizarResultados([], status);
                return;
            }
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Cheques encontrados:', data);

        // Armazenar os cheques no objeto global
        cheques = data;

        // Atualiza os resultados com os cheques retornados
        atualizarResultados(data, status);
    } catch (error) {
        console.error('Erro ao consultar cheques:', error);
        atualizarResultados([], status); // Mostra mensagem amigável se houver erro
    }
}

// Função para atualizar os resultados na página
function atualizarResultados(cheques, status) {
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = ''; // Limpa os resultados anteriores

    if (cheques.length > 0) {
        let tabela = `
            <table class="tabela">
                <thead>
                    <tr>
                        <th>Cheque Nº</th>
                        <th>Beneficiário</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Data de Emissão</th>
                        <th>Data de Vencimento</th>
                        <th>Descrição</th>
                        <th>Empresa Emitente</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cheques.forEach(cheque => {
            tabela += `
                 <tr>
                    <td>${cheque.cheque_numero || 'N/A'}</td>
                    <td>${cheque.nome_beneficiario || 'N/A'}</td>
                    <td>${cheque.valor || 'N/A'}</td>
                    <td>${cheque.status || 'N/A'}</td>
                    <td>${cheque.data_emissao ? formatarData(cheque.data_emissao) : 'N/A'}</td>
                    <td>${cheque.data_vencimento ? formatarData(cheque.data_vencimento) : 'N/A'}</td>
                    <td>${cheque.descricao || 'N/A'}</td>
                    <td>${cheque.empresa || 'N/A'}</td>
                    <td>
                        <button onclick="editarCheque(${cheque.id})">Editar</button>
                        <button onclick="excluirCheque(${cheque.id})">Excluir</button>
                        <button class="compensar-btn" onclick="marcarComoCompensado('${cheque.cheque_numero}')">Pagar</button>
                    </td>
                </tr>
            `;
        });

        tabela += `</tbody></table>`;
        resultadosDiv.innerHTML = tabela;
    } else {
        // Mostra uma mensagem amigável se não houver cheques com o status selecionado
        resultadosDiv.innerHTML = `<p>Não há cheques com o status "<strong>${status}</strong>".</p>`;
    }
}

function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Mes começa de 0
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function carregarChequesPorBeneficiario() {
    const nome = document.getElementById('nomeBeneficiario').value;
    console.log(`Filtrando por beneficiário: ${nome}`);
    // Adicione aqui a lógica de filtro por nome
}

// Função para excluir um cheque
async function excluirCheque(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este cheque?');

    if (!confirmacao) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5002/api/cheques/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Cheque Excluído com sucesso!');
        }

        alert('Cheque excluído com sucesso!');
        carregarCheques(); // Recarrega a lista de cheques após exclusão

    } catch (error) {
        console.error('Cheque Excluído com sucesso!', error);
        alert('Cheque Excluído com sucesso!');
    }
}

function editarCheque(id) {
    console.log(cheques)
    // Encontrar o cheque no array 'cheques'
    const cheque = cheques.find(cheque => cheque.id === id);
    if (!cheque) {
        alert('Cheque não encontrado!');
        return;
    }

    // Preenche o formulário com os dados do cheque
    const chequeNumeroField = document.getElementById('cheque_numero');
    const nomeBeneficiarioField = document.getElementById('nome_beneficiario');
    const valorField = document.getElementById('valor');
    const statusField = document.getElementById('status');
    const dataEmissaoField = document.getElementById('data_emissao');
    const dataVencimentoField = document.getElementById('data_vencimento');
    const descricaoField = document.getElementById('descricao');
    const empresaField = document.getElementById('empresa');

    chequeNumeroField.value = cheque.cheque_numero || '';
    nomeBeneficiarioField.value = cheque.nome_beneficiario || '';
    valorField.value = cheque.valor || '';
    statusField.value = cheque.status || '';
    dataEmissaoField.value = cheque.data_emissao ? formatarData(cheque.data_emissao) : '';
    dataVencimentoField.value = cheque.data_vencimento ? formatarData(cheque.data_vencimento) : '';
    descricaoField.value = cheque.descricao || '';
    empresaField.value = cheque.empresa || '';
    document.getElementById('cheque-id').value = cheque.id; // Armazena o id do cheque

    // Exibe o formulário de edição
    document.getElementById('form-edicao').style.display = 'block';
       
}
// Função para salvar as edições do cheque
async function salvarEdicao() {
    const chequeId = document.getElementById('cheque-id').value;
    const cheque_numero = document.getElementById('cheque_numero').value;
    const nome_beneficiario = document.getElementById('nome_beneficiario').value;
    const valor = document.getElementById('valor').value;
    const status = document.getElementById('status').value;
    const data_emissao = document.getElementById('data_emissao').value;
    const data_vencimento = document.getElementById('data_vencimento').value;
    const descricao = document.getElementById('descricao').value;
    const empresa = document.getElementById('empresa').value;

    // Validação dos dados antes de salvar
    if (!cheque_numero || !nome_beneficiario || !valor || !status) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    const chequeData = {
        cheque_numero,
        nome_beneficiario,
        valor,
        status,
        data_emissao,
        data_vencimento,
        descricao,
        empresa
    };

    console.log('Dados do cheque para edição:', chequeData);

    try {
        const response = await fetch(`http://localhost:5002/api/cheques/${chequeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chequeData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao salvar edição: ${errorMessage}`);
        }

        const result = await response.json();
        alert(result.message || 'Cheque atualizado com sucesso!');
        carregarCheques(); // Recarrega a lista de cheques após a atualização
        cancelarEdicao(); // Fecha o formulário de edição

    } catch (error) {
        console.error('Cheque atualizado com sucesso!', error);
        alert('Cheque atualizado com sucesso!');
    }
}


// Adiciona o evento de filtro
document.getElementById('filtrar-btn').addEventListener('click', () => {
    const status = document.getElementById('status-filtro').value;
    carregarCheques(status);
});

// Carrega todos os cheques ao carregar a página
carregarCheques();

function cancelarEdicao() {
    document.getElementById('form-edicao').style.display = 'none';
}

async function carregarChequesPorBeneficiario() {
    // Obtendo o valor do campo de entrada
    const nome = document.getElementById('nomeBeneficiario').value;
    const resultadosDiv = document.getElementById('resultados');

    // Limpando resultados anteriores
    resultadosDiv.innerHTML = '<p>Carregando...</p>';

    try {
        // Fazendo a requisição para o servidor
        const response = await fetch(`http://localhost:5002/api/cheques/beneficiario?nome=${encodeURIComponent(nome)}`);
        const cheques = await response.json();

        console.log(cheques)

        // Verificando se a resposta foi bem-sucedida
        if (response.ok) {
            // Construindo a tabela de resultados
            if (cheques.length > 0) {
                let tabela = `
                    <table class="tabela">
                        <thead>
                            <tr>
                                <th>Cheque Nº</th>
                                <th>Beneficiário</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Data de Emissão</th>
                                <th>Data de Vencimento</th>
                                <th>Descrição</th>
                                <th>Empresa Emitente</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
        
                cheques.forEach(cheque => {
                    tabela += `
                         <tr>
                            <td>${cheque.cheque_numero || 'N/A'}</td>
                            <td>${cheque.nome_beneficiario || 'N/A'}</td>
                            <td>${cheque.valor || 'N/A'}</td>
                            <td>${cheque.status || 'N/A'}</td>
                            <td>${cheque.data_emissao ? formatarData(cheque.data_emissao) : 'N/A'}</td>
                            <td>${cheque.data_vencimento ? formatarData(cheque.data_vencimento) : 'N/A'}</td>
                            <td>${cheque.descricao || 'N/A'}</td>
                            <td>${cheque.empresa || 'N/A'}</td>
                            <td><button onclick="editarCheque(${cheque.id})">Editar</button>
                            <button onclick="excluirCheque(${cheque.id})">Excluir</button>
                            <button class="compensar-btn" onclick="marcarComoCompensado('${cheque.cheque_numero}')">Pagar</button>
                            </td>
                        </tr>
                        
                    `;
                });
                tabela += '</table>';
                resultadosDiv.innerHTML = tabela;
            } else {
                resultadosDiv.innerHTML = '<p>Nenhum cheque encontrado para o beneficiário informado.</p>';
            }
        } else {
            resultadosDiv.innerHTML = `<p>Erro: ${cheques.message || 'Não foi possível buscar os cheques.'}</p>`;
        }
    } catch (error) {
        // Tratando erros de conexão ou de script
        resultadosDiv.innerHTML = `<p>Erro ao buscar cheques: ${error.message}</p>`;
    }
}

async function marcarComoCompensado(chequeNumero) {
    await atualizarStatusCheque(chequeNumero, 'Compensado');
}

// Função para atualizar o status de um cheque no servidor
async function atualizarStatusCheque(chequeNumero, status) {
    try {
        const response = await fetch(`http://localhost:5002/api/cheques/atualizar-status/${chequeNumero}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Cheque marcado como Compensado!')
            console.log('Status do cheque atualizado com sucesso!');
        } else {
            console.error('Erro ao atualizar o status do cheque:', result.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Função para formatar a data no formato desejado (ex: dd/mm/yyyy)
function formatarData(data) {
    const date = new Date(data);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

//-------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const relatorioForm = document.getElementById('relatorioForm');
    const resultadosDiv = document.getElementById('resultados');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');

    if (relatorioForm) {
        relatorioForm.addEventListener('submit', async function (event) {
            event.preventDefault();
        
            const dataInicio = document.getElementById('data_inicio').value;
            const dataFim = document.getElementById('data_fim').value;
        
            if (!dataInicio || !dataFim) {
                alert('Por favor, preencha as datas de início e fim.');
                return;
            }
        
            try {
                // Exibir spinner e ocultar mensagens anteriores
                loadingSpinner.style.display = 'block';
                resultadosDiv.innerHTML = '';
                errorMessage.style.display = 'none';
        
                // Fazendo a requisição para o servidor
                const response = await fetch(`http://localhost:5002/api/cheques/relatorio?dataInicio=${dataInicio}&dataFim=${dataFim}`);
        
                // Aqui, só chamamos response.json() uma vez
                const data = await response.json();  // Obtendo o JSON da resposta
        
                if (response.ok && data.cheques && data.cheques.length > 0) {
                    let tabelaHTML = `
                        <table class="tabela">
                        <thead>
                            <tr>
                                <th>Cheque Nº</th>
                                <th>Beneficiário</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Data de Emissão</th>
                                <th>Data de Vencimento</th>
                                <th>Descrição</th>
                                <th>Empresa Emitente</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                    `;
        
                    data.cheques.forEach(cheque => {
                        tabelaHTML += `
                             <tr>
                            <td>${cheque.cheque_numero || 'N/A'}</td>
                            <td>${cheque.nome_beneficiario || 'N/A'}</td>
                            <td>${cheque.valor || 'N/A'}</td>
                            <td>${cheque.status || 'N/A'}</td>
                            <td>${cheque.data_emissao ? formatarData(cheque.data_emissao) : 'N/A'}</td>
                            <td>${cheque.data_vencimento ? formatarData(cheque.data_vencimento) : 'N/A'}</td>
                            <td>${cheque.descricao || 'N/A'}</td>
                            <td>${cheque.empresa || 'N/A'}</td>
                            <td><button onclick="editarCheque(${cheque.id})">Editar</button>
                            <button onclick="excluirCheque(${cheque.id})">Excluir</button>
                            <button class="compensar-btn" onclick="marcarComoCompensado('${cheque.cheque_numero}')">Pagar</button>
                            </td>
                        </tr>
                        `;
                    });
        
                    tabelaHTML += '</table>';
                    resultadosDiv.innerHTML = tabelaHTML;
        
                } else {
                    resultadosDiv.innerHTML = '<p>Nenhum cheque encontrado para o período selecionado.</p>';
                }
            } catch (error) {
                console.error('Erro ao buscar relatório:', error);
                errorMessage.style.display = 'block';
            } finally {
                loadingSpinner.style.display = 'none';
            }
        });        
    } else {
        console.warn("Formulário de relatório não encontrado.");
    }
});

// Função para formatar datas no formato DD/MM/AAAA
function formatarData(dataISO) {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}


