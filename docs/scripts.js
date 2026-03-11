// ID da planilha
const SHEET_ID = '1ocVVhfY4-B8LSMhPfSrJfwFPUvlVSo3-l5KYLs9Z8zs';

let departamentos = {};
let todosRamais = [];
let ordemGrupos = {};
let dadosPessoas = []; // Armazena objetos completos para o modal de alarme usar por índice

// ===== DETECTAR SE É MOBILE =====
function isMobile() {
    return window.innerWidth <= 768;
}

// ===== TOAST NOTIFICATION =====
function mostrarToast(mensagem, icone = 'bi-check-circle-fill', tipo = 'success') {
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (tipo === 'error') toast.classList.add('error');
    toast.innerHTML = `<i class="bi ${icone}"></i><span>${mensagem}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ===== MODAL DE INFORMAÇÕES (atribuições + email) =====
function abrirModal(nome, telefone, atribuicoes, email) {
    document.getElementById('modalNome').textContent = nome;
    document.getElementById('modalTelefone').textContent = telefone;
    document.getElementById('modalAtribuicoesTexto').textContent = atribuicoes || 'Sem atribuições cadastradas';
    document.getElementById('modalEmail').textContent = email || 'E-mail não cadastrado';
    document.getElementById('modalAtribuicoes').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function abrirModalFromButton(btn) {
    abrirModal(
        btn.dataset.nome || '',
        btn.dataset.telefone || '',
        btn.dataset.atribuicoes || '',
        btn.dataset.email || ''
    );
}

function fecharModal(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalAtribuicoes').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===== MODAL DE ALARME =====

/**
 * Converte a string crua da coluna Alarmes em objeto estruturado.
 * Formato esperado:
 *   Empresa Alarme: Nome  (XX) XXXXX-XXXX
 *   *1 - Nome - (XX) XXXXX-XXXX   ← asterisco indica que possui senha
 *   2 - Nome
 */
function parseAlarmes(texto) {
    if (!texto || !texto.trim()) return null;

    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const resultado = { empresa: null, contatos: [] };

    linhas.forEach(linha => {
        if (linha.toLowerCase().startsWith('empresa alarme:')) {
            const resto = linha.replace(/empresa alarme:/i, '').trim();
            const telMatch = resto.match(/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/);
            resultado.empresa = {
                nome: telMatch ? resto.replace(telMatch[0], '').trim() : resto,
                telefone: telMatch ? telMatch[0] : ''
            };
        } else {
            // Detecta asterisco no início (com ou sem espaço após ele)
            const temSenha = linha.startsWith('*');
            const linhaSemAsterisco = temSenha ? linha.slice(1).trim() : linha;

            const partes = linhaSemAsterisco.split(' - ');
            if (partes.length >= 2) {
                resultado.contatos.push({
                    ordem:    partes[0].trim(),
                    nome:     partes.length >= 3 ? partes.slice(1, -1).join(' - ').trim() : partes[1].trim(),
                    telefone: partes.length >= 3 ? partes[partes.length - 1].trim() : '',
                    temSenha
                });
            }
        }
    });

    return resultado.empresa || resultado.contatos.length ? resultado : null;
}

function abrirModalAlarme(index) {
    const pessoa = dadosPessoas[index];
    const dados = parseAlarmes(pessoa.alarmes);
    if (!dados) return;

    // Seção: empresa de alarme
    let empresaHtml = '';
    if (dados.empresa) {
        const telNumeros = dados.empresa.telefone.replace(/\D/g, '');
        const telHtml = dados.empresa.telefone
            ? `<a href="tel:+55${telNumeros}" class="alarm-phone-link"><i class="bi bi-telephone-fill"></i>${dados.empresa.telefone}</a>`
            : '';
        empresaHtml = `
            <div class="alarm-section">
                <div class="alarm-section-title"><i class="bi bi-building"></i> Empresa de Alarme</div>
                <div class="alarm-contact alarm-contact--empresa">
                    <span class="alarm-contact-name">${dados.empresa.nome}</span>
                    ${telHtml}
                </div>
            </div>
        `;
    }

    // Seção: ordem de acionamento
    const contatosHtml = dados.contatos.map(c => {
        const telNumeros = c.telefone.replace(/\D/g, '');
        const telHtml = c.telefone
            ? `<a href="tel:+55${telNumeros}" class="alarm-phone-link"><i class="bi bi-telephone-fill"></i>${c.telefone}</a>`
            : '<span class="alarm-no-phone">Sem telefone</span>';

        const senhaBadge = c.temSenha
            ? `<span class="alarm-senha-badge"><i class="bi bi-lock-fill"></i> possui senha</span>`
            : '';

        return `
            <div class="alarm-contact">
                <span class="alarm-order">${c.ordem}°</span>
                <span class="alarm-contact-name">${c.nome}${senhaBadge}</span>
                ${telHtml}
            </div>
        `;
    }).join('');

    document.getElementById('alarmeModalDept').textContent = pessoa.departamento;
    document.getElementById('alarmeModalBody').innerHTML = `
        ${empresaHtml}
        <div class="alarm-section">
            <div class="alarm-section-title"><i class="bi bi-list-ol"></i> Ordem de Acionamento</div>
            <p class="alarm-hint">Toque no telefone para ligar diretamente.</p>
            ${contatosHtml}
        </div>
    `;

    document.getElementById('modalAlarme').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModalAlarme(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalAlarme').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Fechar modais com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal();
        fecharModalAlarme();
    }
});

// ===== COPIAR NÚMERO COM TOAST =====
function copiarNumero(numero, btn) {
    navigator.clipboard.writeText(numero).then(() => {
        const icon = btn.querySelector('i');
        const originalClass = icon.className;
        const originalBg = btn.style.background;

        icon.className = 'bi bi-check-lg';
        btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        setTimeout(() => {
            icon.className = originalClass;
            btn.style.background = originalBg;
        }, 1500);

        mostrarToast('Número copiado!', 'bi-clipboard-check-fill', 'success');
    }).catch(() => {
        mostrarToast('Erro ao copiar número', 'bi-x-circle-fill', 'error');
    });
}

// ===== CONTADOR =====
function atualizarContador(total) {
    const texto = total === 1 ? 'contato' : 'contatos';
    document.getElementById('resultsCount').textContent = `${total} ${texto}`;
}

// ===== CARREGAR DADOS DA PLANILHA =====
async function carregarRamais() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        // Aba Grupos (ordem de exibição)
        const urlGrupos = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Grupos`;
        const responseGrupos = await fetch(urlGrupos);
        const textGrupos = await responseGrupos.text();

        if (!textGrupos.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Grupos" não está acessível.');
        }

        const jsonGrupos = JSON.parse(textGrupos.substring(47).slice(0, -2));
        ordemGrupos = {};
        jsonGrupos.table.rows.forEach(row => {
            const ordem = parseInt(row.c[0]?.v) || 999;
            const nomeGrupo = String(row.c[1]?.v || '').trim();
            if (nomeGrupo && nomeGrupo !== 'NOME GRUPO') {
                ordemGrupos[nomeGrupo] = ordem;
            }
        });

        // Aba Ramais (contatos)
        const urlRamais = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Ramais`;
        const responseRamais = await fetch(urlRamais);
        const textRamais = await responseRamais.text();

        if (!textRamais.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Ramais" não está acessível.');
        }

        const jsonRamais = JSON.parse(textRamais.substring(47).slice(0, -2));

        todosRamais = jsonRamais.table.rows.map(row => ({
            departamento: String(row.c[0]?.v || 'Sem Departamento'),
            nome:         String(row.c[1]?.v || ''),
            telefone:     String(row.c[2]?.v || ''),
            whatsapp:     String(row.c[3]?.v || 'NAO').toUpperCase(),
            atribuicoes:  String(row.c[4]?.v || '').trim(),
            email:        String(row.c[5]?.v || '').trim(),
            alarmes:      String(row.c[6]?.v || '').trim()  // nova coluna
        })).filter(r => r.nome && r.nome !== 'Nome');

        departamentos = {};
        todosRamais.forEach(ramal => {
            if (!departamentos[ramal.departamento]) {
                departamentos[ramal.departamento] = [];
            }
            departamentos[ramal.departamento].push(ramal);
        });

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

// ===== RENDERIZAR CARDS =====
function renderizarCards(deps) {
    const container = document.getElementById('cardsContainer');
    const noResults = document.getElementById('noResults');

    if (Object.keys(deps).length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    // Resetar array de pessoas para o modal de alarme usar índices frescos
    dadosPessoas = [];

    const mobile = isMobile();

    const depsOrdenados = Object.entries(deps).sort((a, b) => {
        const ordemA = ordemGrupos[a[0]] || 999;
        const ordemB = ordemGrupos[b[0]] || 999;
        return ordemA - ordemB;
    });

    container.innerHTML = depsOrdenados.map(([dept, pessoas]) => {
        const pessoasHtml = pessoas.map(pessoa => {
            const telefoneNumeros = pessoa.telefone.replace(/\D/g, '');

            // Botão info/email
            const temAtribuicoes = pessoa.atribuicoes && pessoa.atribuicoes.trim();
            const infoBtn = `<button
                    class="action-btn ${temAtribuicoes ? 'info-btn' : 'email-btn'}"
                    data-nome="${pessoa.nome}"
                    data-telefone="${pessoa.telefone}"
                    data-atribuicoes="${pessoa.atribuicoes || ''}"
                    data-email="${pessoa.email || ''}"
                    onclick="abrirModalFromButton(this)"
                    title="${temAtribuicoes ? 'Ver informações' : 'Ver e-mail'}">
                    <i class="bi ${temAtribuicoes ? 'bi-info-circle' : 'bi-envelope'}"></i>
                </button>`;

            // Botão WhatsApp
            const whatsappBtn = pessoa.whatsapp === 'SIM' && telefoneNumeros
                ? `<a href="https://wa.me/55${telefoneNumeros}" target="_blank" class="action-btn whatsapp-btn" title="Abrir WhatsApp">
                        <i class="bi bi-whatsapp"></i>
                   </a>`
                : '';

            // Botão copiar (desktop) ou ligar (mobile) — ambos usam copy-btn para manter o azul
            const callOrCopyBtn = telefoneNumeros
                ? (mobile
                    ? `<a href="tel:+55${telefoneNumeros}" class="action-btn copy-btn" title="Ligar">
                            <i class="bi bi-telephone-fill"></i>
                       </a>`
                    : `<button onclick="copiarNumero('${pessoa.telefone}', this)" class="action-btn copy-btn" title="Copiar número">
                            <i class="bi bi-clipboard"></i>
                       </button>`)
                : '';

            // Botão alarme — só exibe se a linha tem dados de alarme
            let alarmeBtn = '';
            if (pessoa.alarmes) {
                const idx = dadosPessoas.length;
                dadosPessoas.push(pessoa);
                alarmeBtn = `<button
                        onclick="abrirModalAlarme(${idx})"
                        class="action-btn alarm-btn"
                        title="Contatos de alarme">
                        <i class="bi bi-shield-lock-fill"></i>
                    </button>`;
            } else {
                dadosPessoas.push(pessoa);
            }

            // Ordem: info → copiar/ligar → alarme → whatsapp
            return `
                <div class="person-item">
                    <div class="person-name">${pessoa.nome}</div>
                    <div class="phone-number">${pessoa.telefone}</div>
                    ${infoBtn}
                    ${callOrCopyBtn}
                    ${alarmeBtn}
                    ${whatsappBtn}
                </div>
            `;
        }).join('');

        return `
            <div class="department-card">
                <div class="department-header">${dept}</div>
                <div class="people-list">${pessoasHtml}</div>
            </div>
        `;
    }).join('');
}

// ===== PESQUISA =====
function configurarPesquisa() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        clearBtn.classList.toggle('show', !!termo);

        if (!termo) {
            renderizarCards(departamentos);
            atualizarContador(todosRamais.length);
            return;
        }

        const filtrados = {};
        let totalFiltrados = 0;

        Object.entries(departamentos).forEach(([dept, pessoas]) => {
            const pessoasFiltradas = pessoas.filter(pessoa =>
                String(pessoa.nome || '').toLowerCase().includes(termo) ||
                String(dept || '').toLowerCase().includes(termo) ||
                String(pessoa.telefone || '').toLowerCase().includes(termo)
            );
            if (pessoasFiltradas.length > 0) {
                filtrados[dept] = pessoasFiltradas;
                totalFiltrados += pessoasFiltradas.length;
            }
        });

        renderizarCards(filtrados);
        atualizarContador(totalFiltrados);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('show');
        renderizarCards(departamentos);
        atualizarContador(todosRamais.length);
        searchInput.focus();
    });
}

// Re-renderizar ao redimensionar (troca copiar/ligar)
window.addEventListener('resize', () => renderizarCards(departamentos));

// Iniciar
carregarRamais();

// Atualizar a cada 5 minutos
setInterval(carregarRamais, 5 * 60 * 1000);