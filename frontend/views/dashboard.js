import { apiFetch } from '../services/api.js';

let dashboardInicializado = false;

export function initDashboardView() {
  carregarDashboard();

  if (!dashboardInicializado) {
    window.addEventListener('studyflow:data-updated', carregarDashboard);
    dashboardInicializado = true;
  }
}

export async function carregarDashboard() {
  // ==========================================
  // ELEMENTOS DO DASHBOARD
  // ==========================================

  const totalMetasEl = document.getElementById('dash-total-metas');
  const altaPrioridadeEl = document.getElementById('dash-metas-alta');
  const totalResumosEl = document.getElementById('dash-total-resumos');

  const ultimasMetasEl = document.getElementById('dash-recent-metas');
  const ultimosResumosEl = document.getElementById('dash-recent-resumos');

  // ==========================================
  // ESTADO DE CARREGAMENTO
  // ==========================================

  if (totalMetasEl) {
    totalMetasEl.textContent = '...';
  }

  if (altaPrioridadeEl) {
    altaPrioridadeEl.textContent = '...';
  }

  if (totalResumosEl) {
    totalResumosEl.textContent = '...';
  }

  if (ultimasMetasEl) {
    ultimasMetasEl.innerHTML = `
      <p class="dashboard-empty">
        Carregando metas...
      </p>
    `;
  }

  if (ultimosResumosEl) {
    ultimosResumosEl.innerHTML = `
      <p class="dashboard-empty">
        Carregando resumos...
      </p>
    `;
  }

  try {
    // ==========================================
    // BUSCAR DADOS DA API
    // ==========================================

    const [metas, resumos] = await Promise.all([
      apiFetch('/planner'),
      apiFetch('/resumos')
    ]);

    console.log('📊 Metas recebidas no Dashboard:', metas);
    console.log('📝 Resumos recebidos no Dashboard:', resumos);

    // ==========================================
    // VALIDAR METAS
    // ==========================================

    if (!Array.isArray(metas)) {
      console.error('Erro ao carregar metas:', metas);

      throw new Error(
        metas?.error || 'Erro ao carregar metas.'
      );
    }

    // ==========================================
    // VALIDAR RESUMOS
    // ==========================================

    if (!Array.isArray(resumos)) {
      console.error('Erro ao carregar resumos:', resumos);

      throw new Error(
        resumos?.error || 'Erro ao carregar resumos.'
      );
    }

    // ==========================================
    // CONTADORES
    // ==========================================

    const totalMetas = metas.length;

    const totalResumos = resumos.length;

    const metasAltaPrioridade = metas.filter(
      meta => meta.prioridade === 'alta'
    ).length;

    // ==========================================
    // ATUALIZAR CONTADORES
    // ==========================================

    if (totalMetasEl) {
      totalMetasEl.textContent = totalMetas;
    }

    if (altaPrioridadeEl) {
      altaPrioridadeEl.textContent = metasAltaPrioridade;
    }

    if (totalResumosEl) {
      totalResumosEl.textContent = totalResumos;
    }

    // ==========================================
    // ÚLTIMAS METAS
    // ==========================================

    if (ultimasMetasEl) {

      if (metas.length === 0) {

        ultimasMetasEl.innerHTML = `
          <p class="dashboard-empty">
            Nenhuma meta cadastrada ainda.
          </p>
        `;

      } else {

        const ultimasMetas = [...metas]
          .sort((a, b) => {
            return new Date(b.criadoEm || 0) -
                   new Date(a.criadoEm || 0);
          })
          .slice(0, 5);

        ultimasMetasEl.innerHTML = ultimasMetas
          .map(meta => {

            let classePrioridade = 'prioridade-media';
            let textoPrioridade = 'MÉDIA';

            if (meta.prioridade === 'alta') {
              classePrioridade = 'prioridade-alta';
              textoPrioridade = 'ALTA';
            }

            if (meta.prioridade === 'baixa') {
              classePrioridade = 'prioridade-baixa';
              textoPrioridade = 'BAIXA';
            }

            return `
              <div class="dashboard-item">

                <div class="dashboard-item-info">

                  <strong>
                    ${escapeHtml(meta.titulo)}
                  </strong>

                  <span
                    class="dashboard-prioridade ${classePrioridade}"
                  >
                    ${textoPrioridade}
                  </span>

                </div>

              </div>
            `;
          })
          .join('');
      }
    }

    // ==========================================
    // ÚLTIMOS RESUMOS
    // ==========================================

    if (ultimosResumosEl) {

      if (resumos.length === 0) {

        ultimosResumosEl.innerHTML = `
          <p class="dashboard-empty">
            Nenhum resumo criado ainda.
          </p>
        `;

      } else {

        const ultimosResumos = [...resumos]
          .sort((a, b) => {
            return new Date(b.dataCriacao || 0) -
                   new Date(a.dataCriacao || 0);
          })
          .slice(0, 5);

        ultimosResumosEl.innerHTML = ultimosResumos
          .map(resumo => {

            return `
              <div class="dashboard-item">

                <div class="dashboard-item-info">

                  <strong>
                    ${escapeHtml(resumo.titulo)}
                  </strong>

                  <span class="dashboard-disciplina">
                    ${escapeHtml(resumo.disciplina)}
                  </span>

                </div>

              </div>
            `;
          })
          .join('');
      }
    }

    // ==========================================
    // DEBUG
    // ==========================================

    console.log('✅ Dashboard atualizado!');
    console.log('🎯 Total de metas:', totalMetas);
    console.log('🔥 Metas de alta prioridade:', metasAltaPrioridade);
    console.log('📚 Total de resumos:', totalResumos);

  } catch (error) {

    console.error(
      '❌ Erro ao carregar Dashboard:',
      error
    );

    // ==========================================
    // ERRO NOS CONTADORES
    // ==========================================

    if (totalMetasEl) {
      totalMetasEl.textContent = '0';
    }

    if (altaPrioridadeEl) {
      altaPrioridadeEl.textContent = '0';
    }

    if (totalResumosEl) {
      totalResumosEl.textContent = '0';
    }

    // ==========================================
    // ERRO NAS METAS
    // ==========================================

    if (ultimasMetasEl) {
      ultimasMetasEl.innerHTML = `
        <p class="dashboard-error">
          Não foi possível carregar as metas.
        </p>
      `;
    }

    // ==========================================
    // ERRO NOS RESUMOS
    // ==========================================

    if (ultimosResumosEl) {
      ultimosResumosEl.innerHTML = `
        <p class="dashboard-error">
          Não foi possível carregar os resumos.
        </p>
      `;
    }
  }
}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHtml(text) {

  if (text === null || text === undefined) {
    return '';
  }

  return String(text).replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]
  );
}


// ==========================================
// ATUALIZAÇÃO MANUAL
// ==========================================

window.atualizarDashboard = function () {
  carregarDashboard();
};