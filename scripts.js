
// ID da planilha
const SHEET_ID = '1ocVVhfY4-B8LSMhPfSrJfwFPUvlVSo3-l5KYLs9Z8zs';

let departamentos = {};
let todosRamais = [];
let ordemGrupos = {};

// ===== FUNÇÕES DO MODAL DE ATRIBUIÇÕES =====
function abrirModal(nome, telefone, atribuicoes) {
    document.getElementById('modalNome').textContent = nome;
    document.getElementById('modalTelefone').textContent = telefone;
    document.getElementById('modalAtribuicoesTexto').textContent = atribuicoes || 'Sem atribuições cadastradas';
    document.getElementById('modalAtribuicoes').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModal(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalAtribuicoes').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===== FUNÇÕES DO MODAL DE EMAIL =====
function abrirModalEmail(nome, email) {
    document.getElementById('modalEmailNome').textContent = nome;
    document.getElementById('modalEmailNomeCompleto').textContent = nome;
    document.getElementById('modalEmailTexto').textContent = email || 'E-mail não cadastrado';
    document.getElementById('modalEmail').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModalEmail(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalEmail').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal();
        fecharModalEmail();
    }
});

// Copiar número
function copiarNumero(numero) {
    navigator.clipboard.writeText(numero).then(() => {
        // Feedback visual simples
        const btn = event.target.closest('.copy-btn');
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        
        icon.className = 'bi bi-check-lg';
        btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        setTimeout(() => {
            icon.className = originalClass;
            btn.style.background = '';
        }, 1500);
    });
}

// Atualizar contador
function atualizarContador(total) {
    const texto = total === 1 ? 'contato' : 'contatos';
    document.getElementById('resultsCount').textContent = `${total} ${texto}`;
}

// Carregar ramais da planilha
async function carregarRamais() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        
        // 1️⃣ BUSCAR ABA GRUPOS (ordem de exibição)
        const urlGrupos = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Grupos`;
        const responseGrupos = await fetch(urlGrupos);
        const textGrupos = await responseGrupos.text();
        
        // ✅ VALIDAR se a resposta é JSON do Google Sheets
        if (!textGrupos.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Grupos" não está acessível. Verifique se ela existe na planilha.');
        }
        
        const jsonGrupos = JSON.parse(textGrupos.substring(47).slice(0, -2));
        
        // Mapear: nome do grupo -> ordem
        ordemGrupos = {};
        jsonGrupos.table.rows.forEach(row => {
            const ordem = parseInt(row.c[0]?.v) || 999;
            const nomeGrupo = String(row.c[1]?.v || '').trim();
            if (nomeGrupo && nomeGrupo !== 'NOME GRUPO') {
                ordemGrupos[nomeGrupo] = ordem;
            }
        });
        
        console.log('✅ Ordem dos grupos carregada:', ordemGrupos);
        
        // 2️⃣ BUSCAR ABA RAMAIS (dados dos contatos)
        const urlRamais = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Ramais`;
        const responseRamais = await fetch(urlRamais);
        const textRamais = await responseRamais.text();
        
        // ✅ VALIDAR se a resposta é JSON do Google Sheets
        if (!textRamais.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Ramais" não está acessível. Verifique se ela existe na planilha.');
        }
        
        const jsonRamais = JSON.parse(textRamais.substring(47).slice(0, -2));
        
        // Mapear dados dos ramais (incluindo email - coluna 5)
        todosRamais = jsonRamais.table.rows.map(row => ({
            departamento: String(row.c[0]?.v || 'Sem Departamento'),
            nome: String(row.c[1]?.v || ''),
            telefone: String(row.c[2]?.v || ''),
            whatsapp: String(row.c[3]?.v || 'NAO').toUpperCase(),
            atribuicoes: String(row.c[4]?.v || '').trim(),
            email: String(row.c[5]?.v || '').trim() // 📧 Nova coluna EMAIL
        })).filter(r => r.nome && r.nome !== 'Nome');
        
        // Agrupar por departamento
        departamentos = {};
        todosRamais.forEach(ramal => {
            if (!departamentos[ramal.departamento]) {
                departamentos[ramal.departamento] = [];
            }
            departamentos[ramal.departamento].push(ramal);
        });
        
        console.log('✅ Contatos carregados:', todosRamais.length);
        
        document.getElementById('loading').style.display = 'none';
        renderizarCards(departamentos);
        configurarPesquisa();
        atualizarContador(todosRamais.length);
        
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        
        document.getElementById('error').innerHTML = `
            <h3>❌ Erro ao carregar a planilha</h3>
            <p><strong>Possíveis causas:</strong></p>
            <ol style="margin-left: 20px; margin-top: 10px; text-align: left; display: inline-block;">
                <li>A planilha não está pública</li>
                <li>Os nomes das abas estão errados (devem ser "Ramais" e "Grupos")</li>
                <li>Problema de conexão</li>
            </ol>
            <p><strong>Erro técnico:</strong> ${error.message}</p>
            <button class="reload-btn" onclick="carregarRamais()">🔄 Tentar novamente</button>
        `;
    }
}

// Renderizar cards por departamento ORDENADOS
function renderizarCards(deps) {
    const container = document.getElementById('cardsContainer');
    const noResults = document.getElementById('noResults');
    
    if (Object.keys(deps).length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // 🎯 ORDENAR departamentos pela aba Grupos
    const depsOrdenados = Object.entries(deps).sort((a, b) => {
        const ordemA = ordemGrupos[a[0]] || 999;
        const ordemB = ordemGrupos[b[0]] || 999;
        return ordemA - ordemB;
    });
    
    container.innerHTML = depsOrdenados.map(([dept, pessoas]) => {
        const pessoasHtml = pessoas.map(pessoa => {
            const telefoneNumeros = pessoa.telefone.replace(/\D/g, '');
            
            // Botão de informações (só aparece se tiver atribuições) - COM DEGRADÊ LARANJA
            const infoBtn = pessoa.atribuicoes
                ? `<button 
                        onclick="abrirModal('${pessoa.nome.replace(/'/g, "\\'")}', '${pessoa.telefone}', '${pessoa.atribuicoes.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')"
                        class="action-btn info-btn"
                        title="Ver atribuições">
                        <i class="bi bi-info-circle"></i>
                    </button>`
                : '';
            
            // 📧 Botão de EMAIL (só aparece se tiver email)
            const emailBtn = pessoa.email
                ? `<button 
                        onclick="abrirModalEmail('${pessoa.nome.replace(/'/g, "\\'")}', '${pessoa.email.replace(/'/g, "\\'")}')"
                        class="action-btn email-btn"
                        title="Ver e-mail">
                        <i class="bi bi-envelope"></i>
                    </button>`
                : '';
            
            // Botão do WhatsApp
            const whatsappBtn = pessoa.whatsapp === 'SIM' && telefoneNumeros
                ? `<a href="https://wa.me/55${telefoneNumeros}" 
                        target="_blank" 
                        class="action-btn whatsapp-btn"
                        title="Abrir WhatsApp">
                        <i class="bi bi-whatsapp"></i>
                    </a>`
                : '';
            
            // Botão de copiar (SEMPRE aparece se tiver telefone)
            const copyBtn = telefoneNumeros
                ? `<button 
                        onclick="copiarNumero('${pessoa.telefone}')"
                        class="action-btn copy-btn"
                        title="Copiar número">
                        <i class="bi bi-clipboard"></i>
                    </button>`
                : '';
            
            return `
                <div class="person-item">
                    <div class="person-name">${pessoa.nome}</div>
                    <div class="phone-number">${pessoa.telefone}</div>
                    ${infoBtn}
                    ${emailBtn}
                    ${copyBtn}
                    ${whatsappBtn}
                </div>
            `;
        }).join('');
        
        return `
            <div class="department-card">
                <div class="department-header">${dept}</div>
                <div class="people-list">
                    ${pessoasHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Configurar pesquisa COM BOTÃO LIMPAR
function configurarPesquisa() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    // Evento de input
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        
        // Mostrar/esconder botão limpar
        if (termo) {
            clearBtn.classList.add('show');
        } else {
            clearBtn.classList.remove('show');
        }
        
        if (!termo) {
            renderizarCards(departamentos);
            atualizarContador(todosRamais.length);
            return;
        }
        
        const filtrados = {};
        let totalFiltrados = 0;
        
        Object.entries(departamentos).forEach(([dept, pessoas]) => {
            const pessoasFiltradas = pessoas.filter(pessoa => {
                const nome = String(pessoa.nome || '').toLowerCase().trim();
                const telefone = String(pessoa.telefone || '').toLowerCase().trim();
                const departamento = String(dept || '').toLowerCase().trim();
                
                return nome.includes(termo) || 
                        departamento.includes(termo) || 
                        telefone.includes(termo);
            });
            
            if (pessoasFiltradas.length > 0) {
                filtrados[dept] = pessoasFiltradas;
                totalFiltrados += pessoasFiltradas.length;
            }
        });
        
        renderizarCards(filtrados);
        atualizarContador(totalFiltrados);
    });
    
    // Botão limpar
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('show');
        renderizarCards(departamentos);
        atualizarContador(todosRamais.length);
        searchInput.focus();
    });
}

// Iniciar
carregarRamais();

// Atualizar a cada 5 minutos
setInterval(carregarRamais, 5 * 60 * 1000);
