document.addEventListener('DOMContentLoaded', () => {
    let items = JSON.parse(localStorage.getItem('shoppingItems')) || [];
    const modal = document.getElementById('modalCarrinho');
    const listaCompras = document.querySelector('.lista_comprando');

    // Funções auxiliares
    const saveItems = () => {
        localStorage.setItem('shoppingItems', JSON.stringify(items));
    };

    const renderList = () => {
        listaCompras.innerHTML = items.map(item => `
            <li class="lista_item" data-id="${item.id}">
                <div class="checkbox_container">
                    <input type="checkbox" id="check_${item.id}" ${item.checked ? 'checked' : ''}>
                    <label for="check_${item.id}" class="container_nome_produto ${item.checked ? 'riscado' : ''}">
                        <span class="lista_quantidade_produto">${item.quantidade}x</span>
                        ${item.nome}
                    </label>
                </div>
                <div class="valor_container">
                    <span class="valor_produto">${item.total}</span>
                    ${item.checked ? `<button class="btn-excluir" data-id="${item.id}">×</button>` : ''}
                </div>
            </li>
        `).join('');
        
        updateTotal();
        updateClearButton();
    };

    const updateTotal = () => {
        const total = items
            .filter(item => item.checked)
            .reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        
        document.getElementById('totalConcluido').textContent = total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const updateClearButton = () => {
        const hasCompleted = items.some(item => item.checked);
        document.getElementById('limparConcluidos').classList.toggle('visible', hasCompleted);
    };

    // Eventos do Modal
    document.querySelector('.cabecalho_botao').addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    document.querySelector('.modal-fechar').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Controle de Quantidade
    document.querySelectorAll('.btn-quantidade').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('quantidade');
            let value = parseInt(input.value);
            btn.dataset.acao === 'aumentar' ? value++ : value--;
            input.value = Math.max(1, value);
        });
    });

    // Adição de Itens
    document.getElementById('formProduto').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const precoUnitario = parseFloat(document.getElementById('precoUnitario').value);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        
        const newItem = {
            id: Date.now().toString(),
            nome: document.getElementById('nomeProduto').value.trim(),
            quantidade: quantidade,
            preco: precoUnitario || 0,
            checked: false,
            total: precoUnitario 
                ? (precoUnitario * quantidade).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) 
                : 'R$ 0,00'
        };

        items.push(newItem);
        saveItems();
        renderList();
        modal.style.display = 'none';
        e.target.reset();
    });

    // Eventos da Lista
    listaCompras.addEventListener('click', (e) => {
        // Marcar como concluído
        if (e.target.matches('input[type="checkbox"]')) {
            const item = items.find(i => i.id === e.target.closest('.lista_item').dataset.id);
            const checkbox = e.target;

            if (checkbox.checked) {
                if (item.preco <= 0 || isNaN(item.preco)) {
                    let precoValido = false;
                    
                    while (!precoValido) {
                        const input = prompt('Preço obrigatório!\nDigite o valor unitário (ex: 5.99):');
                        
                        if (input === null) {
                            checkbox.checked = false;
                            alert('Operação cancelada!\nO preço é obrigatório para concluir.');
                            return;
                        }

                        const valor = parseFloat(input.replace(',', '.'));
                        if (!isNaN(valor) && valor > 0) {
                            item.preco = valor;
                            precoValido = true;
                        } else {
                            alert('Valor inválido!\nUse números maiores que zero (ex: 7,50)');
                        }
                    }

                    item.total = (item.quantidade * item.preco).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                }
            }

            item.checked = checkbox.checked;
            saveItems();
            renderList();
        }

        // Excluir item
        if (e.target.matches('.btn-excluir')) {
            const itemId = e.target.dataset.id;
            items = items.filter(item => item.id !== itemId);
            saveItems();
            renderList();
        }
    });

    // Limpar concluídos
    document.getElementById('limparConcluidos').addEventListener('click', () => {
        items = items.filter(item => !item.checked);
        saveItems();
        renderList();
    });

    // Inicialização
    renderList();
});