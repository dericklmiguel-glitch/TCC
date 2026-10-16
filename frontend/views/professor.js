
import { apiFetch } from '../services/api.js';

// ======================================================
// QUESTÕES E RESPOSTAS
// ======================================================

function getQuestoes() {
    try {
        return JSON.parse(localStorage.getItem('app_questoes') || '[]');
    } catch {
        return [];
    }
}

function salvarQuestoes(questoes) {
    localStorage.setItem('app_questoes', JSON.stringify(questoes));
}

function getRespostas() {
    try {
        return JSON.parse(localStorage.getItem('app_respostas') || '[]');
    } catch {
        return [];
    }
}

function salvarRespostas(respostas) {
    localStorage.setItem('app_respostas', JSON.stringify(respostas));
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

export function initProfessorView() {
    carregarAlunosNoSelect();
    configurarTipoQuestao();
    setupFormCadastroQuestao();
    renderQuestoesProfessor();
    renderCorrecoesDissertativas();
    renderAcompanhamentoAlunos();
    atualizarEstatisticasProfessor();
}

// ======================================================
// BUSCAR ALUNOS E PROGRESSO NO BACKEND
// ======================================================

async function buscarAlunos() {
    const resultado = await apiFetch('/auth/alunos/progresso');

    if (resultado?.error) {
        console.error('Erro ao buscar alunos:', resultado.error);
        throw new Error(resultado.error);
    }

    if (!Array.isArray(resultado)) {
        console.error('Resposta inesperada do backend:', resultado);
        throw new Error('O backend não retornou uma lista válida de alunos.');
    }

    return resultado;
}

// ======================================================
// CARREGAR ALUNOS NO SELECT DE DESTINATÁRIOS
// ======================================================

async function carregarAlunosNoSelect() {
    const select = document.getElementById('q-aluno-alvo');
    if (!select) return;

    select.innerHTML = `
        <option value="todos">📢 Enviar para Todos os Alunos</option>
    `;

    try {
        const alunos = await buscarAlunos();

        alunos.forEach(aluno => {
            if (String(aluno.perfil || '').toLowerCase() === 'professor') {
                return;
            }

            const option = document.createElement('option');
            option.value = aluno.email;
            option.textContent = `${aluno.nome || aluno.name || aluno.email} (${aluno.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Não foi possível carregar os destinatários:', error);
        mostrarStatus('Não foi possível carregar os alunos para selecionar.', 'erro');
    }
}

// ======================================================
// TIPO DE QUESTÃO
// ======================================================

function configurarTipoQuestao() {
    const select = document.getElementById('tipoQuestao');
    if (!select) return;

    alterarTipoQuestao();
    select.onchange = alterarTipoQuestao;
}

window.alterarTipoQuestao = function () {
    const tipo = document.getElementById('tipoQuestao')?.value;
    const alternativas = document.getElementById('alternativas');
    const respostaCorreta = document.getElementById('campoRespostaCorreta');

    if (alternativas) {
        alternativas.style.display = tipo === 'dissertativa' ? 'none' : 'block';
    }

    if (respostaCorreta) {
        respostaCorreta.style.display = tipo === 'dissertativa' ? 'none' : 'block';
    }
};

// ======================================================
// FORMULÁRIO DE CADASTRO DE QUESTÕES
// ======================================================

function setupFormCadastroQuestao() {
    const form = document.getElementById('prof-form-questao');
    if (!form) return;

    form.onsubmit = function (event) {
        event.preventDefault();
        salvarQuestao();
    };
}

function salvarQuestao() {
    const tipo = document.getElementById('tipoQuestao')?.value;
    const alunoAlvo = document.getElementById('q-aluno-alvo')?.value || 'todos';
    const disciplina = document.getElementById('q-disciplina')?.value.trim();
    const enunciado = document.getElementById('q-enunciado')?.value.trim();

    if (!disciplina || !enunciado) {
        mostrarStatus('Preencha a disciplina e o enunciado.', 'erro');
        return;
    }

    const questoes = getQuestoes();

    const novaQuestao = {
        id: Date.now(),
        tipo,
        alunoAlvo,
        disciplina,
        enunciado,
        criadaEm: new Date().toLocaleDateString('pt-BR')
    };

    if (tipo === 'objetiva') {
        const A = document.getElementById('q-opt-a')?.value.trim();
        const B = document.getElementById('q-opt-b')?.value.trim();
        const C = document.getElementById('q-opt-c')?.value.trim();
        const D = document.getElementById('q-opt-d')?.value.trim();
        const correta = document.getElementById('q-correta')?.value;

        if (!A || !B || !C || !D || !correta) {
            mostrarStatus('Preencha todas as alternativas e selecione a resposta correta.', 'erro');
            return;
        }

        novaQuestao.opcoes = { A, B, C, D };
        novaQuestao.correta = correta;
    } else if (tipo !== 'dissertativa') {
        mostrarStatus('Selecione um tipo de questão válido.', 'erro');
        return;
    }

    questoes.push(novaQuestao);
    salvarQuestoes(questoes);

    mostrarStatus('✅ Questão publicada com sucesso!', 'sucesso');

    document.getElementById('prof-form-questao')?.reset();
    alterarTipoQuestao();
    renderQuestoesProfessor();
    atualizarEstatisticasProfessor();
}

// ======================================================
// MENSAGENS DE STATUS
// ======================================================

function mostrarStatus(mensagem, tipo) {
    const status = document.getElementById('prof-q-status');
    if (!status) return;

    status.textContent = mensagem;
    status.style.color = tipo === 'erro' ? '#dc2626' : '#16a34a';
}

// ======================================================
// LISTA DE QUESTÕES
// ======================================================

export function renderQuestoesProfessor() {
    const container = document.getElementById('prof-questoes-list');
    if (!container) return;

    const questoes = getQuestoes();

    if (questoes.length === 0) {
        container.innerHTML = `
            <p style="color:#64748b;">Nenhuma questão publicada ainda.</p>
        `;
        return;
    }

    container.innerHTML = questoes.map(q => {
        const tipo = q.tipo === 'dissertativa'
            ? '📝 Dissertativa'
            : '🔘 Múltipla escolha';

        const destino = q.alunoAlvo === 'todos'
            ? 'Todos os alunos'
            : q.alunoAlvo;

        return `
            <div style="background:var(--card-bg, #fff);border:1px solid #e2e8f0;
                padding:16px;border-radius:10px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;gap:10px;
                    margin-bottom:8px;flex-wrap:wrap;">
                    <strong>${escapeHtml(q.disciplina)}</strong>
                    <span>${tipo}</span>
                </div>
                <p>${escapeHtml(q.enunciado)}</p>
                <small style="color:#64748b;">
                    Destinatário: ${escapeHtml(destino)}
                </small>
                <br><br>
                <button onclick="deletarQuestaoProfessor(${Number(q.id)})"
                    style="background:#dc2626;color:white;border:none;padding:8px 12px;
                    border-radius:6px;cursor:pointer;">
                    🗑️ Excluir
                </button>
            </div>
        `;
    }).join('');
}

// ======================================================
// EXCLUIR QUESTÃO
// ======================================================

window.deletarQuestaoProfessor = function (id) {
    if (!confirm('Deseja realmente excluir esta questão?')) return;

    const questoes = getQuestoes().filter(q => String(q.id) !== String(id));
    salvarQuestoes(questoes);

    const respostas = getRespostas().filter(
        r => String(r.questaoId) !== String(id)
    );
    salvarRespostas(respostas);

    renderQuestoesProfessor();
    renderCorrecoesDissertativas();
    atualizarEstatisticasProfessor();
    renderAcompanhamentoAlunos();
};

// ======================================================
// CORREÇÃO DE QUESTÕES DISSERTATIVAS
// ======================================================

function renderCorrecoesDissertativas() {
    const container = document.getElementById('prof-correcoes-dissertativas');
    if (!container) return;

    const questoes = getQuestoes();
    const respostas = getRespostas();

    const questoesDissertativas = questoes.filter(
        q => q.tipo === 'dissertativa'
    );

    const respostasDissertativas = respostas.filter(resposta =>
        questoesDissertativas.some(
            q => String(q.id) === String(resposta.questaoId)
        )
    );

    if (respostasDissertativas.length === 0) {
        container.innerHTML = `
            <p style="color:#64748b;">
                Nenhuma resposta dissertativa aguardando correção.
            </p>
        `;
        return;
    }

    container.innerHTML = respostasDissertativas.map(resposta => {
        const questao = questoes.find(
            q => String(q.id) === String(resposta.questaoId)
        );

        if (!questao) return '';

        const corrigida = resposta.status === 'corrigida';

        return `
            <div style="background:var(--card-bg, #fff);border:1px solid #e2e8f0;
                padding:18px;border-radius:10px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;
                    gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                    <strong>👨‍🎓 ${escapeHtml(
                        resposta.alunoNome || resposta.alunoEmail || 'Aluno'
                    )}</strong>
                    <span style="font-size:12px;padding:4px 8px;border-radius:6px;
                        background:${corrigida ? '#dcfce7' : '#fef3c7'};
                        color:${corrigida ? '#166534' : '#92400e'};">
                        ${corrigida ? 'Corrigida' : 'Pendente'}
                    </span>
                </div>

                <p><strong>Disciplina:</strong> ${escapeHtml(questao.disciplina)}</p>
                <p><strong>Questão:</strong> ${escapeHtml(questao.enunciado)}</p>

                <div style="background:#f8fafc;padding:12px;border-radius:8px;margin:12px 0;">
                    <strong>Resposta do aluno:</strong>
                    <p style="white-space:pre-wrap;">${escapeHtml(resposta.resposta)}</p>
                </div>

                <label for="correcao-resultado-${resposta.id}">Resultado:</label>
                <select id="correcao-resultado-${resposta.id}"
                    style="display:block;margin:5px 0 12px;padding:8px;">
                    <option value="correta" ${resposta.resultado === 'correta' ? 'selected' : ''}>
                        ✅ Correta
                    </option>
                    <option value="incorreta" ${resposta.resultado === 'incorreta' ? 'selected' : ''}>
                        ❌ Incorreta
                    </option>
                </select>

                <label for="correcao-nota-${resposta.id}">Nota:</label>
                <input type="number" id="correcao-nota-${resposta.id}"
                    min="0" max="10" step="0.1"
                    value="${resposta.nota ?? ''}" placeholder="Ex.: 8.5"
                    style="display:block;width:100%;box-sizing:border-box;padding:8px;margin:5px 0 12px;">

                <label for="correcao-comentario-${resposta.id}">
                    Comentário do professor:
                </label>
                <textarea id="correcao-comentario-${resposta.id}" rows="4"
                    placeholder="Escreva um feedback para o aluno..."
                    style="display:block;width:100%;box-sizing:border-box;padding:8px;margin:5px 0 12px;resize:vertical;">${escapeHtml(resposta.comentario || '')}</textarea>

                <button onclick="salvarCorrecaoDissertativa('${String(resposta.id).replace(/'/g, "\\'")}')"
                    style="background:#2563eb;color:white;border:none;padding:10px 15px;
                    border-radius:7px;cursor:pointer;">
                    💾 Salvar Correção
                </button>
            </div>
        `;
    }).join('');
}

// ======================================================
// SALVAR CORREÇÃO
// ======================================================

window.salvarCorrecaoDissertativa = function (respostaId) {
    const respostas = getRespostas();

    const resposta = respostas.find(
        r => String(r.id) === String(respostaId)
    );

    if (!resposta) {
        alert('Resposta não encontrada.');
        return;
    }

    const resultadoEl = document.getElementById(`correcao-resultado-${respostaId}`);
    const notaEl = document.getElementById(`correcao-nota-${respostaId}`);
    const comentarioEl = document.getElementById(`correcao-comentario-${respostaId}`);

    if (!resultadoEl || !notaEl || !comentarioEl) return;

    const nota = notaEl.value.trim();

    if (nota !== '') {
        const numeroNota = Number(nota);

        if (!Number.isFinite(numeroNota) || numeroNota < 0 || numeroNota > 10) {
            alert('A nota precisa estar entre 0 e 10.');
            return;
        }
    }

    resposta.status = 'corrigida';
    resposta.resultado = resultadoEl.value;
    resposta.nota = nota === '' ? null : Number(nota);
    resposta.comentario = comentarioEl.value.trim();
    resposta.corrigidaEm = new Date().toLocaleString('pt-BR');

    salvarRespostas(respostas);
    alert('✅ Correção salva com sucesso!');

    renderCorrecoesDissertativas();
    atualizarEstatisticasProfessor();
    renderAcompanhamentoAlunos();
};

// ======================================================
// ACOMPANHAMENTO DOS ALUNOS — BACKEND
// ======================================================

export async function renderAcompanhamentoAlunos() {
    const container = document.getElementById('prof-acompanhamento-alunos');
    if (!container) {
        console.warn('O elemento prof-acompanhamento-alunos não existe no HTML.');
        return;
    }

    container.innerHTML = `
        <div style="padding:30px;text-align:center;color:#64748b;">
            ⏳ Carregando progresso dos alunos...
        </div>
    `;

    try {
        const alunos = await buscarAlunos();

        // O endpoint deve retornar apenas alunos.
        // Se retornar perfis misturados, excluímos professores.
        const alunosFiltrados = alunos.filter(aluno =>
            String(aluno.perfil || '').toLowerCase() !== 'professor'
        );

        if (alunosFiltrados.length === 0) {
            container.innerHTML = `
                <div style="padding:24px;text-align:center;background:#f8fafc;
                    border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;">
                    <div style="font-size:40px;margin-bottom:10px;">👨‍🎓</div>
                    <strong>Nenhum aluno encontrado</strong>
                    <p style="margin-top:6px;font-size:14px;">
                        Verifique se existem contas cadastradas com o perfil Aluno.
                    </p>
                    <button onclick="window.recarregarAcompanhamentoAlunos()"
                        style="padding:9px 14px;border:0;border-radius:7px;
                        cursor:pointer;background:#2563eb;color:white;">
                        Atualizar lista
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = alunosFiltrados.map(criarCardAluno).join('');

    } catch (error) {
        console.error('Erro no acompanhamento dos alunos:', error);

        container.innerHTML = `
            <div style="padding:20px;color:#b91c1c;background:#fef2f2;
                border:1px solid #fecaca;border-radius:10px;">
                <strong>❌ Não foi possível carregar o acompanhamento.</strong>
                <p>${escapeHtml(error.message || 'Erro desconhecido.')}</p>
                <p style="font-size:13px;">
                    Confira se o backend está ligado e se a rota
                    /auth/alunos/progresso está funcionando.
                </p>
                <button onclick="window.recarregarAcompanhamentoAlunos()"
                    style="padding:9px 14px;border:0;border-radius:7px;
                    cursor:pointer;background:#2563eb;color:white;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

window.recarregarAcompanhamentoAlunos = renderAcompanhamentoAlunos;

// ======================================================
// CARD INDIVIDUAL DO ALUNO
// ======================================================

function criarCardAluno(aluno) {
    const email = aluno.email || '';
    const nome = aluno.nome || aluno.name || 'Aluno';
    const progresso = aluno.progresso || {};

    const metas = Number(progresso.metas ?? progresso.totalMetas ?? 0);
    const metasAlta = Number(progresso.metasAlta ?? 0);
    const resumos = Number(progresso.resumos ?? progresso.totalResumos ?? 0);
    const xp = Number(progresso.xp ?? progresso.totalXp ?? progresso.totalXP ?? 0);
    const nivel = Number(progresso.nivel ?? progresso.level ?? (Math.floor(xp / 100) + 1));

    // Barra de XP até o próximo nível (cada nível = 100 XP)
    const xpNoNivel = xp % 100;

    // Situação do aluno, de acordo com a atividade total
    const atividades = metas + resumos;
    let situacao = { texto: 'Sem atividade', cor: '#64748b', fundo: '#f1f5f9' };
    if (atividades >= 5) {
        situacao = { texto: 'Engajado', cor: '#15803d', fundo: '#dcfce7' };
    } else if (atividades > 0) {
        situacao = { texto: 'Em andamento', cor: '#b45309', fundo: '#fef3c7' };
    }

    const questoes = getQuestoes();
    const respostas = getRespostas();

    const respostasAluno = respostas.filter(resposta =>
        resposta.alunoEmail === email
    );

    const questoesAluno = questoes.filter(questao =>
        questao.alunoAlvo === 'todos' || questao.alunoAlvo === email
    );

    const totalQuestoes = questoesAluno.length;
    const totalRespondidas = respostasAluno.length;

    const totalCorrigidas = respostasAluno.filter(
        resposta => resposta.status === 'corrigida'
    ).length;

    const pctRespondidas = totalQuestoes
        ? Math.min(100, Math.round((totalRespondidas / totalQuestoes) * 100))
        : 0;

    const notas = respostasAluno
        .filter(resposta =>
            resposta.nota !== null &&
            resposta.nota !== undefined &&
            resposta.nota !== ''
        )
        .map(resposta => Number(resposta.nota))
        .filter(nota => Number.isFinite(nota));

    const media = notas.length
        ? (notas.reduce((total, nota) => total + nota, 0) / notas.length).toFixed(1)
        : '—';

    const iniciais = nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte.charAt(0))
        .join('')
        .toUpperCase();

    return `
        <div class="prof-aluno-card"
            style="background:var(--card-bg, #fff);border:1px solid #e2e8f0;
            border-radius:16px;padding:20px;margin-bottom:15px;
            box-shadow:0 4px 12px rgba(15,23,42,.05);">

            <!-- Cabeçalho -->
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
                <div style="width:52px;height:52px;flex-shrink:0;border-radius:50%;
                    background:linear-gradient(135deg,#0284c7,#2563eb);color:white;
                    display:flex;align-items:center;justify-content:center;
                    font-weight:800;font-size:17px;">
                    ${escapeHtml(iniciais)}
                </div>
                <div style="flex:1;min-width:0;">
                    <h3 style="margin:0;color:var(--text-color, #0f172a);font-size:17px;">
                        ${escapeHtml(nome)}
                    </h3>
                    <p style="margin:4px 0 0;color:#64748b;font-size:13px;
                        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${escapeHtml(email)}
                    </p>
                </div>
                <span style="background:${situacao.fundo};color:${situacao.cor};
                    font-size:12px;font-weight:700;padding:5px 10px;
                    border-radius:999px;white-space:nowrap;">
                    ${situacao.texto}
                </span>
            </div>

            <!-- Nível e XP -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;
                border-radius:12px;padding:12px 14px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;
                    align-items:baseline;margin-bottom:8px;">
                    <strong style="color:#1d4ed8;font-size:18px;">⭐ Nível ${nivel}</strong>
                    <span style="color:#64748b;font-size:12px;">${xp} XP no total</span>
                </div>
                <div style="background:#dbeafe;border-radius:999px;height:8px;overflow:hidden;">
                    <div style="width:${xpNoNivel}%;height:100%;border-radius:999px;
                        background:linear-gradient(90deg,#38bdf8,#2563eb);"></div>
                </div>
                <span style="display:block;margin-top:6px;color:#64748b;font-size:12px;">
                    ${xpNoNivel}/100 XP para o nível ${nivel + 1}
                </span>
            </div>

            <!-- Indicadores do planner -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;">
                <div style="background:#f0f9ff;border-radius:10px;padding:12px;">
                    <strong style="display:block;color:#0369a1;font-size:22px;">${metas}</strong>
                    <span style="color:#64748b;font-size:12px;">Metas</span>
                </div>

                <div style="background:#fef2f2;border-radius:10px;padding:12px;">
                    <strong style="display:block;color:#b91c1c;font-size:22px;">${metasAlta}</strong>
                    <span style="color:#64748b;font-size:12px;">Prioridade alta</span>
                </div>

                <div style="background:#f0fdf4;border-radius:10px;padding:12px;">
                    <strong style="display:block;color:#15803d;font-size:22px;">${resumos}</strong>
                    <span style="color:#64748b;font-size:12px;">Resumos</span>
                </div>

                <div style="background:#fff7ed;border-radius:10px;padding:12px;">
                    <strong style="display:block;color:#c2410c;font-size:22px;">${media}</strong>
                    <span style="color:#64748b;font-size:12px;">Média local</span>
                </div>
            </div>

            <!-- Questões -->
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #e2e8f0;">
                <div style="display:flex;justify-content:space-between;
                    margin-bottom:6px;color:#64748b;font-size:13px;">
                    <span>📝 Questões respondidas neste navegador</span>
                    <strong style="color:#7e22ce;">${totalRespondidas}/${totalQuestoes}</strong>
                </div>
                <div style="background:#f3e8ff;border-radius:999px;height:8px;overflow:hidden;">
                    <div style="width:${pctRespondidas}%;height:100%;
                        border-radius:999px;background:#9333ea;"></div>
                </div>
                <div style="margin-top:10px;display:flex;justify-content:space-between;
                    gap:10px;flex-wrap:wrap;color:#64748b;font-size:13px;">
                    <span>📚 ${totalQuestoes} questões disponíveis</span>
                    <span>✅ ${totalCorrigidas} corrigidas neste navegador</span>
                </div>
            </div>
        </div>
    `;
}

// ======================================================
// ESTATÍSTICAS DO PROFESSOR
// ======================================================

export function atualizarEstatisticasProfessor() {
    const questoes = getQuestoes();
    const respostas = getRespostas();

    // IDs encontrados em diferentes versões do HTML.
    const totalQuestoes = document.getElementById('prof-stat-questoes')
        || document.getElementById('prof-total-questoes');

    const totalRespostas = document.getElementById('prof-total-respostas');
    const pendentes = document.getElementById('prof-respostas-pendentes');

    if (totalQuestoes) totalQuestoes.textContent = questoes.length;
    if (totalRespostas) totalRespostas.textContent = respostas.length;

    if (pendentes) {
        pendentes.textContent = respostas.filter(
            resposta => resposta.status !== 'corrigida'
        ).length;
    }

    const totalAlunos = document.getElementById('prof-stat-alunos');

    if (totalAlunos) {
        buscarAlunos()
            .then(alunos => {
                totalAlunos.textContent = alunos.filter(
                    aluno => String(aluno.perfil || '').toLowerCase() !== 'professor'
                ).length;
            })
            .catch(error => {
                console.error('Erro ao atualizar total de alunos:', error);
                totalAlunos.textContent = '—';
            });
    }
}

// ======================================================
// UTILITÁRIO DE SEGURANÇA PARA HTML
// ======================================================

function escapeHtml(text) {
    if (text === null || text === undefined) return '';

    return String(text).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[char]);
}