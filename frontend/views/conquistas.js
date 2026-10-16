import { apiFetch } from '../services/api.js';


// ======================================================
// LISTA DE CONQUISTAS
// ======================================================

const LISTA_CONQUISTAS = [

  {
    id: 'boas_vindas',

    titulo: 'Primeiro Passo',

    descricao:
      'Criar conta e aceder à plataforma StudyFlow.',

    icone: '🚀',

    xp: 50,

    check: () => true
  },


  {
    id: 'planner_3',

    titulo: 'Organizador Académico',

    descricao:
      'Criar pelo menos 3 metas de estudo no Planner.',

    icone: '📊',

    xp: 100,

    check: (dados) =>
      dados.metasCount >= 3
  },


  {
    id: 'resumos_3',

    titulo: 'Mestre da Síntese',

    descricao:
      'Guardar pelo menos 3 resumos de matérias.',

    icone: '📝',

    xp: 150,

    check: (dados) =>
      dados.resumosCount >= 3
  },


  {
    id: 'foco_total',

    titulo: 'Foco Anti-Procrastinação',

    descricao:
      'Criar pelo menos 5 atividades de estudo entre metas e resumos.',

    icone: '🔥',

    xp: 200,

    check: (dados) =>
      (dados.metasCount + dados.resumosCount) >= 5
  }

];


// ======================================================
// INICIALIZAÇÃO
// ======================================================

export function initConquistasView() {

  loadConquistas();

}


// ======================================================
// CARREGAR CONQUISTAS
// ======================================================

export async function loadConquistas() {

  try {

    // Busca as metas do usuário logado
    const metas = await apiFetch('/planner');


    // Se a API retornar erro
    if (!Array.isArray(metas)) {

      console.error(
        'Erro ao carregar metas:',
        metas
      );

      return;
    }


    // Busca os resumos do usuário logado
    const resumos = await apiFetch('/resumos');


    // Se a API retornar erro
    if (!Array.isArray(resumos)) {

      console.error(
        'Erro ao carregar resumos:',
        resumos
      );

      return;
    }


    // ==================================================
    // ESTATÍSTICAS DO USUÁRIO
    // ==================================================

    const dados = {

      metasCount: metas.length,

      resumosCount: resumos.length

    };


    console.log(
      '📊 Dados das conquistas:',
      dados
    );


    // ==================================================
    // CALCULAR CONQUISTAS
    // ==================================================

    let totalXp = 0;


    const conquistasCalculadas =
      LISTA_CONQUISTAS.map(conquista => {

        const desbloqueada =
          conquista.check(dados);


        if (desbloqueada) {

          totalXp += conquista.xp;

        }


        return {

          ...conquista,

          unlocked: desbloqueada

        };

      });


    console.log(
      '🏆 XP total:',
      totalXp
    );


    // ==================================================
    // ATUALIZAR INTERFACE
    // ==================================================

    atualizarInterface(
      totalXp,
      conquistasCalculadas,
      dados
    );


  } catch (error) {

    console.error(
      'Erro ao carregar conquistas:',
      error
    );

  }

}


// ======================================================
// ATUALIZAR INTERFACE
// ======================================================

function atualizarInterface(
  totalXp,
  conquistas,
  dados
) {


  const levelNumEl =
    document.getElementById(
      'user-level-num'
    );


  const levelTitleEl =
    document.getElementById(
      'user-level-title'
    );


  const xpTextEl =
    document.getElementById(
      'user-xp-text'
    );


  const xpBarInnerEl =
    document.getElementById(
      'xp-bar-inner'
    );


  const gridEl =
    document.getElementById(
      'conquistas-grid'
    );


  // ==================================================
  // NÍVEL
  // ==================================================

  const level =
    Math.floor(totalXp / 100) + 1;


  // XP dentro do nível atual

  const xpCurrentLevel =
    totalXp % 100;


  // Porcentagem da barra

  const percentage =
    Math.min(
      xpCurrentLevel,
      100
    );


  // ==================================================
  // NÚMERO DO NÍVEL
  // ==================================================

  if (levelNumEl) {

    levelNumEl.textContent =
      level;

  }


  // ==================================================
  // TÍTULO DO NÍVEL
  // ==================================================

  if (levelTitleEl) {

    if (level === 1) {

      levelTitleEl.textContent =
        'Estudante Iniciante 📚';

    }

    else if (level === 2) {

      levelTitleEl.textContent =
        'Estudante Focado ⚡';

    }

    else {

      levelTitleEl.textContent =
        'Mestre dos Estudos 🎓';

    }

  }


  // ==================================================
  // TEXTO DO XP
  // ==================================================

  if (xpTextEl) {

    xpTextEl.textContent =
      `${xpCurrentLevel} / 100 XP (Total: ${totalXp} XP)`;

  }


  // ==================================================
  // BARRA DE XP
  // ==================================================

  if (xpBarInnerEl) {

    xpBarInnerEl.style.width =
      `${percentage}%`;

  }


  // ==================================================
  // CONQUISTAS
  // ==================================================

  if (gridEl) {

    gridEl.innerHTML =
      conquistas.map(conquista => `

        <div
          class="badge-card ${
            conquista.unlocked
              ? 'unlocked'
              : 'locked'
          }"
        >

          <div class="badge-icon">

            ${conquista.icone}

          </div>


          <div class="badge-info">

            <h4>

              ${conquista.titulo}

            </h4>


            <p>

              ${conquista.descricao}

            </p>


            <span class="badge-xp">

              +${conquista.xp} XP

              ${
                conquista.unlocked
                  ? '✓ Desbloqueada'
                  : '🔒 Bloqueada'
              }

            </span>

          </div>

        </div>

      `).join('');

  }


  // ==================================================
  // LOG PARA TESTE
  // ==================================================

  console.log(
    '🏆 Conquistas atualizadas:',
    {
      metas: dados.metasCount,
      resumos: dados.resumosCount,
      xp: totalXp,
      nivel: level
    }
  );

}


// ======================================================
// FUNÇÃO GLOBAL
// ======================================================
//
// Planner e Resumos podem chamar essa função depois
// de criar ou excluir alguma coisa.
// ======================================================

window.atualizarConquistas =
  function () {

    loadConquistas();

  };