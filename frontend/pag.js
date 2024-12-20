document.addEventListener('DOMContentLoaded', function () {
    console.log("Script inicializado.");

    // Identifica a página atual
    const bodyId = document.body.id;

    // Executa o código relevante para cada página
    if (bodyId === 'page-Inicial') {
        console.log("Página Inical detectada.");
        carregarProximosCheques();
    }
});

const consultarBtn = document.getElementById('consultar-btn');
if (consultarBtn) {
    consultarBtn.addEventListener('click', consultarCheques);
} else {
    console.warn("Botão 'consultar-btn' não encontrado.");
}

// Carrega os próximos cheques a vencer
async function carregarProximosCheques() {
    try {
        const response = await fetch('http://localhost:5002/api/cheques/proximos');
        const cheques = await response.json();

        const proximoChequeDiv = document.getElementById('proximoChequePag');
        
        // Limpar os cheques anteriores antes de adicionar os novos
        proximoChequeDiv.innerHTML = '<h1>Próximos Cheques à Vencer</h1>'; // Recolocando o título
        
        if (cheques.length > 0) {
            cheques.forEach((cheque) => {
                let classeEmpresa = 'outros';
                if (cheque.empresa === 'clinica') {
                    classeEmpresa = 'clinica';
                } else if (cheque.empresa === 'escola') {
                    classeEmpresa = 'escola';
                }

                // Adiciona o botão "Marcar como Compensado" somente se o status não for "Atrasado"
                const buttonHTML = cheque.status !== 'Atrasado' ? ` 
                    <button class="compensar-btn" onclick="marcarComoCompensado('${cheque.cheque_numero}')">Marcar como Compensado</button>
                ` : '';

                // Adiciona o conteúdo do cheque ao final do proximoChequeDiv
                proximoChequeDiv.innerHTML += `
                    <div class="${classeEmpresa}" id="cheque-${cheque.cheque_numero}">
                        <p>Cheque nº: ${cheque.cheque_numero}</p>
                        <p>Empresa Emitente: <span> ${cheque.empresa} </span></p>
                        <p>Beneficiário: ${cheque.nome_beneficiario}</p>
                        <p>Data de Vencimento: ${formatarData(cheque.data_vencimento)}</p>
                        <p>Valor: R$ ${parseFloat(cheque.valor).toFixed(2).replace('.', ',')}</p>
                        <p>Status: ${cheque.status === 'Pendente' ? 'Pendente' : cheque.status}</p>
                        ${buttonHTML}
                    </div>
                `;
            });
        } else {
            proximoChequeDiv.innerHTML += '<p>Nenhum cheque próximo ao vencimento encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar próximos cheques:', error);
        alert('Erro ao carregar próximos cheques.');
    }
}

// Função para atualizar o status de um cheque no servidor
async function marcarComoCompensado(chequeNumero) {
    await atualizarStatusCheque(chequeNumero, 'Compensado');
    // Recarregar os cheques após a atualização para refletir a mudança
    carregarProximosCheques();
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


// Função para consultar cheques por vencimento e exibir em tabela
function consultarCheques() {
    const dataVencimento = document.getElementById('consultaData').value;

    console.log('Data de vencimento capturada:', dataVencimento);  // Verifique se a data está correta

    if (!dataVencimento) {
        alert('Por favor, preencha a data de vencimento.');
        return;
    }

    // Fazendo a requisição para a API que consulta cheques por data de vencimento
    fetch(`http://localhost:5002/api/cheques/buscar-por-vencimento?dataVencimento=${dataVencimento}`)
        .then(response => response.json())
        .then(data => {
            console.log('Cheques encontrados:', data);

            // Exibe os cheques em formato de tabela
            const resultadosDiv = document.getElementById("resultados");
            resultadosDiv.innerHTML = '';  // Limpa a área de resultados

            if (data.length > 0) {
                // Cria a tabela
                let tabela = `
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Cheque Nº</th>
                                <th>Beneficiário</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                // Adiciona os dados dos cheques na tabela
                data.forEach(cheque => {
                    tabela += `
                        <tr>
                            <td>${cheque.cheque_numero}</td>
                            <td>${cheque.nome_beneficiario}</td>
                            <td>${cheque.valor}</td>
                            <td>${cheque.status}</td>
                        </tr>
                    `;
                });

                // Fecha a tabela
                tabela += `
                        </tbody>
                    </table>
                `;

                resultadosDiv.innerHTML = tabela;  // Exibe a tabela
            } else {
                resultadosDiv.innerHTML = '<p>Nenhum cheque encontrado para esta data.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao consultar cheques:', error);
            alert('Erro ao consultar cheques.');
        });
}

// Função para formatar a data no formato correto
function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Mês começa do 0
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Adiciona o evento de click no botão para chamar a função consultarCheques
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('consultar-btn').addEventListener('click', consultarCheques);
});

async function marcarComoCompensado(chequeNumero) {
    try {
        // Fazendo a requisição PATCH para a API
        const response = await fetch(`http://localhost:5002/api/cheques/compensar/${chequeNumero}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Verifica se a resposta foi bem-sucedida
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao marcar cheque como compensado');
        }

        // Se o cheque foi marcado como compensado com sucesso, atualiza o DOM
        const chequeDiv = document.getElementById(`cheque-${chequeNumero}`);

        if (chequeDiv) {
            // Alterar o status para "Compensado"
            const statusElement = chequeDiv.querySelector('p:last-child');
            if (statusElement) {
                statusElement.textContent = 'Status: Compensado';
            }

            // Alterar a classe para refletir o status compensado, se necessário
            chequeDiv.classList.add('compensado');
            
            // Esconder ou desabilitar o botão de compensar
            const button = chequeDiv.querySelector('.compensar-btn');
            if (button) {
                button.disabled = true;
                button.style.display = 'none';
            }

            // Exibir um feedback para o usuário
            alert(data.message); // Exibe a mensagem de sucesso retornada pela API
        }

    } catch (error) {
        console.error('Erro ao marcar o cheque como compensado:', error);
        alert('Erro ao marcar o cheque como compensado.');
    }
}
