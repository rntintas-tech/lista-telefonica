// ID da planilha Google Sheets
const SHEET_ID = '1ocVVhfY4-B8LSMhPfSrJfwFPUvlVSo3-l5KYLs9Z8zs';

let departamentos  = {};
let todosRamais    = [];
let ordemGrupos    = {};
let dadosPessoas   = []; // array paralelo ao índice usado em abrirModalAlarme

// ─────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────

/** Retorna true se a janela tiver largura ≤ 768px (mobile). */
function isMobile() {
    return window.innerWidth <= 768;
}

// ─────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────

function mostrarToast(mensagem, icone = 'bi-check-circle-fill', tipo = 'success') {
    const existente = document.querySelector('.toast');
    if (existente) existente.remove();

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

// ─────────────────────────────────────────────────────────────────
// MODAL DE INFORMAÇÕES
// ─────────────────────────────────────────────────────────────────

function abrirModal(nome, telefone, atribuicoes, email) {
    document.getElementById('modalNome').textContent           = nome;
    document.getElementById('modalTelefone').textContent       = telefone;
    document.getElementById('modalAtribuicoesTexto').textContent = atribuicoes || 'Sem atribuições cadastradas';
    document.getElementById('modalEmail').textContent          = email || 'E-mail não cadastrado';
    document.getElementById('modalAtribuicoes').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/** Lê os data-* do botão clicado e abre o modal — chamado via onclick no HTML gerado. */
function abrirModalFromButton(btn) {
    abrirModal(
        btn.dataset.nome      || '',
        btn.dataset.telefone  || '',
        btn.dataset.atribuicoes || '',
        btn.dataset.email     || ''
    );
}

function fecharModal(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalAtribuicoes').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ─────────────────────────────────────────────────────────────────
// MODAL DE ALARME
// ─────────────────────────────────────────────────────────────────

/**
 * Converte a string crua da coluna G em objeto estruturado.
 *
 * Formatos aceitos:
 *   Empresa Alarme: Nome  (XX) XXXXX-XXXX
 *   *1 - Nome - (XX) XXXXX-XXXX   ← asterisco = possui senha
 *   2 - Nome
 */
function parseAlarmes(texto) {
    if (!texto || !texto.trim()) return null;

    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const resultado = { empresa: null, contatos: [] };

    linhas.forEach(linha => {
        if (linha.toLowerCase().startsWith('empresa alarme:')) {
            const resto    = linha.replace(/empresa alarme:/i, '').trim();
            const telMatch = resto.match(/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/);
            resultado.empresa = {
                nome:     telMatch ? resto.replace(telMatch[0], '').trim() : resto,
                telefone: telMatch ? telMatch[0] : ''
            };
        } else {
            const temSenha         = linha.startsWith('*');
            const linhaSemAsterisco = temSenha ? linha.slice(1).trim() : linha;
            const partes           = linhaSemAsterisco.split(' - ');

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

    return (resultado.empresa || resultado.contatos.length) ? resultado : null;
}

function abrirModalAlarme(index) {
    const pessoa = dadosPessoas[index];
    const dados  = parseAlarmes(pessoa.alarmes);
    if (!dados) return;

    let empresaHtml = '';
    if (dados.empresa) {
        const num = dados.empresa.telefone.replace(/\D/g, '');
        const tel = dados.empresa.telefone
            ? `<a href="tel:+55${num}" class="alarm-phone-link"><i class="bi bi-telephone-fill"></i>${dados.empresa.telefone}</a>`
            : '';
        empresaHtml = `
            <div class="alarm-section">
                <div class="alarm-section-title"><i class="bi bi-building"></i> Empresa de Alarme</div>
                <div class="alarm-contact alarm-contact--empresa">
                    <span class="alarm-contact-name">${dados.empresa.nome}</span>
                    ${tel}
                </div>
            </div>`;
    }

    const contatosHtml = dados.contatos.map(c => {
        const num    = c.telefone.replace(/\D/g, '');
        const telHtml = c.telefone
            ? `<a href="tel:+55${num}" class="alarm-phone-link"><i class="bi bi-telephone-fill"></i>${c.telefone}</a>`
            : '<span class="alarm-no-phone">Sem telefone</span>';
        const senhaBadge = c.temSenha
            ? `<span class="alarm-senha-badge"><i class="bi bi-lock-fill"></i> possui senha</span>`
            : '';

        return `
            <div class="alarm-contact">
                <span class="alarm-order">${c.ordem}</span>
                <span class="alarm-contact-name">${c.nome}${senhaBadge}</span>
                ${telHtml}
            </div>`;
    }).join('');

    document.getElementById('alarmeModalDept').textContent = pessoa.departamento;
    document.getElementById('alarmeModalBody').innerHTML = `
        ${empresaHtml}
        <div class="alarm-section">
            <div class="alarm-section-title"><i class="bi bi-list-ol"></i> Ordem de Acionamento</div>
            <p class="alarm-hint">Toque no número para ligar diretamente.</p>
            ${contatosHtml}
        </div>`;

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
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        fecharModal();
        fecharModalAlarme();
        fecharModalAcoes();
    }
});

// ─────────────────────────────────────────────────────────────────
// COPIAR NÚMERO
// ─────────────────────────────────────────────────────────────────

function copiarNumero(numero, btn) {
    navigator.clipboard.writeText(numero).then(() => {
        const icon         = btn.querySelector('i');
        const originalClass = icon.className;

        icon.className = 'bi bi-check-lg';
        btn.style.background = '#16a34a';
        setTimeout(() => {
            icon.className    = originalClass;
            btn.style.background = '';
        }, 1400);

        mostrarToast('Número copiado!', 'bi-clipboard-check-fill');
    }).catch(() => {
        mostrarToast('Erro ao copiar número', 'bi-x-circle-fill', 'error');
    });
}

// ─────────────────────────────────────────────────────────────────
// DROPDOWN (botão ···)
// ─────────────────────────────────────────────────────────────────

/**
 * Abre o modal central com as ações do contato.
 * Recebe um elemento <button> com data-* preenchidos pelo renderizarCards.
 */
function abrirModalAcoes(btn) {
    const nome     = btn.dataset.nome     || '';
    const telefone = btn.dataset.telefone || '';
    const fones    = telefone.replace(/\D/g, '');
    const atrib    = btn.dataset.atribuicoes || '';
    const email    = btn.dataset.email    || '';
    const whatsapp = btn.dataset.whatsapp || 'NAO';
    const idx      = btn.dataset.alarmeidx;

    document.getElementById('acoes-nome').textContent = nome;

    let itens = '';

    // Info / atribuições
    const atribEsc = atrib.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const emailEsc = email.replace(/"/g, '&quot;');
    itens += `
        <button class="acao-btn"
            data-nome="${nome}" data-telefone="${telefone}"
            data-atribuicoes="${atribEsc}" data-email="${emailEsc}"
            onclick="abrirModalFromButton(this); fecharModalAcoes()">
            <span class="acao-icon acao-icon--info"><i class="bi bi-info-circle-fill"></i></span>
            <div><div>Informações</div><div class="acao-desc">Atribuições e e-mail</div></div>
        </button>`;

    // E-mail
    if (email) {
        itens += `
        <a href="mailto:${email}" class="acao-btn" onclick="fecharModalAcoes()">
            <span class="acao-icon acao-icon--email"><i class="bi bi-envelope-fill"></i></span>
            <div><div>Enviar e-mail</div><div class="acao-desc">${email}</div></div>
        </a>`;
    }

    // WhatsApp
    if (whatsapp === 'SIM' && fones) {
        itens += `
        <a href="https://wa.me/55${fones}" target="_blank" rel="noopener" class="acao-btn" onclick="fecharModalAcoes()">
            <span class="acao-icon acao-icon--whats"><i class="bi bi-whatsapp"></i></span>
            <div><div>WhatsApp</div><div class="acao-desc">${telefone}</div></div>
        </a>`;
    }

    // Alarme
    if (idx !== undefined && idx !== '') {
        itens += `
        <button class="acao-btn" onclick="abrirModalAlarme(${idx}); fecharModalAcoes()">
            <span class="acao-icon acao-icon--alarm"><i class="bi bi-shield-lock-fill"></i></span>
            <div><div>Contatos de Alarme</div><div class="acao-desc">Ordem de acionamento</div></div>
        </button>`;
    }

    document.getElementById('acoes-body').innerHTML = `<div class="acoes-list">${itens}</div>`;
    document.getElementById('modalAcoes').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModalAcoes(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('modalAcoes').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/** Mantida para compatibilidade (ESC, fechar ao clicar fora) */
function fecharDropdowns() {}

// ─────────────────────────────────────────────────────────────────
// TUTORIAL BANNER
// ─────────────────────────────────────────────────────────────────

function dispensarTutorial() {
    const banner = document.getElementById('tutorial-banner');
    banner.classList.add('dismissing');
    // Remove do DOM depois da animação para não ocupar espaço
    setTimeout(() => (banner.style.display = 'none'), 380);
}

// ─────────────────────────────────────────────────────────────────
// CONTADOR
// ─────────────────────────────────────────────────────────────────

function atualizarContador(total) {
    const sufixo = total === 1 ? 'contato' : 'contatos';
    document.getElementById('resultsCount').textContent = `${total} ${sufixo}`;
}

// ─────────────────────────────────────────────────────────────────
// CARREGAR DADOS
// ─────────────────────────────────────────────────────────────────

async function carregarRamais() {
    try {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('error').style.display   = 'none';

        // Aba Grupos (ordem de exibição)
        const urlGrupos  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Grupos`;
        const resGrupos  = await fetch(urlGrupos);
        const txtGrupos  = await resGrupos.text();

        if (!txtGrupos.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Grupos" não está acessível.');
        }

        const jsonGrupos = JSON.parse(txtGrupos.substring(47).slice(0, -2));
        ordemGrupos = {};
        jsonGrupos.table.rows.forEach(row => {
            const ordem    = parseInt(row.c[0]?.v) || 999;
            const nomeGrupo = String(row.c[1]?.v || '').trim();
            if (nomeGrupo && nomeGrupo !== 'NOME GRUPO') {
                ordemGrupos[nomeGrupo] = ordem;
            }
        });

        // Aba Ramais (contatos)
        const urlRamais = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Ramais`;
        const resRamais = await fetch(urlRamais);
        const txtRamais = await resRamais.text();

        if (!txtRamais.includes('google.visualization.Query.setResponse')) {
            throw new Error('A aba "Ramais" não está acessível.');
        }

        const jsonRamais = JSON.parse(txtRamais.substring(47).slice(0, -2));

        todosRamais = jsonRamais.table.rows.map(row => ({
            departamento: String(row.c[0]?.v || 'Sem Departamento'),
            nome:         String(row.c[1]?.v || ''),
            telefone:     String(row.c[2]?.v || ''),
            whatsapp:     String(row.c[3]?.v || 'NAO').toUpperCase(),
            atribuicoes:  String(row.c[4]?.v || '').trim(),
            email:        String(row.c[5]?.v || '').trim(),
            alarmes:      String(row.c[6]?.v || '').trim(),
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

    } catch (err) {
        console.error('Erro ao carregar planilha:', err);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display   = 'block';
        document.getElementById('error').innerHTML = `
            <h3>❌ Erro ao carregar a planilha</h3>
            <p><strong>Possíveis causas:</strong></p>
            <ol>
                <li>A planilha não está pública</li>
                <li>Os nomes das abas estão errados (devem ser "Ramais" e "Grupos")</li>
                <li>Problema de conexão</li>
            </ol>
            <p><strong>Erro técnico:</strong> ${err.message}</p>
            <button class="reload-btn" onclick="carregarRamais()">🔄 Tentar novamente</button>`;
    }
}

// ─────────────────────────────────────────────────────────────────
// RENDERIZAR LISTA FLAT
// ─────────────────────────────────────────────────────────────────

function renderizarCards(deps) {
    const container = document.getElementById('cardsContainer');
    const noResults = document.getElementById('noResults');

    if (Object.keys(deps).length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'flex';
        return;
    }

    noResults.style.display = 'none';
    dadosPessoas = []; // reseta o array para o modal de alarme

    const mobile = isMobile();

    const depsOrdenados = Object.entries(deps).sort((a, b) => {
        const oA = ordemGrupos[a[0]] ?? 999;
        const oB = ordemGrupos[b[0]] ?? 999;
        return oA - oB;
    });

    container.innerHTML = depsOrdenados.map(([dept, pessoas], sIdx) => {

        const linhas = pessoas.map((pessoa, pIdx) => {
            const fones       = pessoa.telefone.replace(/\D/g, '');
            const temAtrib    = !!(pessoa.atribuicoes && pessoa.atribuicoes.trim());
            const temEmail    = !!(pessoa.email && pessoa.email.trim());
            const temWhatsApp = pessoa.whatsapp === 'SIM' && fones;

            // Sempre empurra para manter índice consistente com abrirModalAlarme
            const personIdx = dadosPessoas.length;
            dadosPessoas.push(pessoa);

            // ── Botão primário (copiar desktop / ligar mobile) ──
            const primario = fones
                ? (mobile
                    ? `<a href="tel:+55${fones}" class="btn-primary-action" title="Ligar"><i class="bi bi-telephone-fill"></i></a>`
                    : `<button onclick="copiarNumero('${pessoa.telefone}', this)" class="btn-primary-action" title="Copiar número"><i class="bi bi-clipboard"></i></button>`)
                : '';



            // Índice do alarme (-1 se não houver)
            const alarmIdx = pessoa.alarmes ? personIdx : '';

            const atribForData = (pessoa.atribuicoes || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const emailForData = (pessoa.email || '').replace(/"/g, '&quot;');

            const maisBtn = `
                <button class="btn-more"
                    data-nome="${pessoa.nome}"
                    data-telefone="${pessoa.telefone}"
                    data-atribuicoes="${atribForData}"
                    data-email="${emailForData}"
                    data-whatsapp="${pessoa.whatsapp}"
                    data-alarmeidx="${alarmIdx}"
                    onclick="abrirModalAcoes(this)"
                    title="Mais ações">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </button>`;

            // delay escalonado: seção + linha para entrada em cascata
            const delay = ((sIdx * 0.05) + (pIdx * 0.025)).toFixed(3);

            return `<div class="contact-row" style="animation-delay:${delay}s">
                <span class="contact-name">${pessoa.nome}</span>
                <span class="contact-phone">${pessoa.telefone}</span>
                <div class="contact-actions">
                    ${primario}
                    ${maisBtn}
                </div>
            </div>`;
        }).join('');

        return `<section class="dept-section" style="animation-delay:${(sIdx * 0.05).toFixed(3)}s">
            <div class="dept-header">
                <span class="dept-label">${dept}</span>
                <div class="dept-rule"></div>
                <span class="dept-count">${pessoas.length}</span>
            </div>
            <div class="contact-list">${linhas}</div>
        </section>`;

    }).join('');
}

// ─────────────────────────────────────────────────────────────────
// PESQUISA
// ─────────────────────────────────────────────────────────────────

function configurarPesquisa() {
    const input    = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    input.addEventListener('input', e => {
        const termo = e.target.value.toLowerCase().trim();
        clearBtn.classList.toggle('show', !!termo);
        fecharDropdowns();

        if (!termo) {
            renderizarCards(departamentos);
            atualizarContador(todosRamais.length);
            return;
        }

        const filtrados = {};
        let total = 0;

        Object.entries(departamentos).forEach(([dept, pessoas]) => {
            const match = pessoas.filter(p =>
                String(p.nome || '').toLowerCase().includes(termo)     ||
                String(dept   || '').toLowerCase().includes(termo)     ||
                String(p.telefone || '').toLowerCase().includes(termo)
            );
            if (match.length) {
                filtrados[dept] = match;
                total += match.length;
            }
        });

        renderizarCards(filtrados);
        atualizarContador(total);
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.remove('show');
        renderizarCards(departamentos);
        atualizarContador(todosRamais.length);
        input.focus();
        fecharDropdowns();
    });
}

// Re-renderiza ao redimensionar (troca copiar ↔ ligar conforme mobile)
window.addEventListener('resize', () => renderizarCards(departamentos));

// ─────────────────────────────────────────────────────────────────
// INICIAR
// ─────────────────────────────────────────────────────────────────

carregarRamais();

// Atualização automática a cada 5 minutos
setInterval(carregarRamais, 5 * 60 * 1000);