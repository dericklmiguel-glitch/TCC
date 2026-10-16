import { apiFetch } from '../services/api.js';


export function initPlannerView() {

  const plannerForm =
    document.getElementById('planner-form');

  const statusMsg =
    document.getElementById('planner-status');


  if (plannerForm) {

    plannerForm.onsubmit = async (e) => {

      e.preventDefault();


      const tituloInput =
        document.getElementById(
          'planner-titulo'
        );


      const prioridadeSelect =
        document.getElementById(
          'planner-prioridade'
        );


      const titulo =
        tituloInput
          ? tituloInput.value.trim()
          : '';


      const prioridade =
        prioridadeSelect
          ? prioridadeSelect.value
          : 'media';


      if (!titulo) {

        return;

      }


      if (statusMsg) {

        statusMsg.style.color =
          '#0284c7';

        statusMsg.textContent =
          'A guardar meta...';

      }


      const result =
        await apiFetch(
          '/planner',
          {
            method: 'POST',

            body: JSON.stringify({
              titulo,
              prioridade
            })
          }
        );


      if (
        result &&
        !result.error
      ) {


        if (tituloInput) {

          tituloInput.value = '';

        }


        if (statusMsg) {

          statusMsg.style.color =
            '#16a34a';

          statusMsg.textContent =
            '✅ Meta salva com sucesso!';


          setTimeout(() => {

            statusMsg.textContent = '';

          }, 3000);

        }


        // Atualiza o Planner
        await loadPlannerItems();

       if (res && !res.error) {
  loadPlannerItems();

  if (window.atualizarDashboard) {
    window.atualizarDashboard();
  }
}
        // Atualiza as conquistas
        if (
          window.atualizarConquistas
        ) {

          window.atualizarConquistas();

        }


      }

      else {


        if (statusMsg) {

          statusMsg.style.color =
            '#dc2626';

          statusMsg.textContent =
            result?.error ||
            'Erro ao salvar meta.';

        }

      }

    };

  }


  // ==================================================
  // EXCLUIR META
  // ==================================================

  window.deleteTask =
    async (id) => {

      const res =
        await apiFetch(
          `/planner/${id}`,
          {
            method: 'DELETE'
          }
        );


      if (
        res &&
        !res.error
      ) {

        await loadPlannerItems();


        if (
          window.atualizarConquistas
        ) {

          window.atualizarConquistas();

        }

      }

    };


  loadPlannerItems();

}


// ======================================================
// CARREGAR METAS
// ======================================================

export async function loadPlannerItems() {

  const plannerList =
    document.getElementById(
      'planner-list'
    );


  if (!plannerList) {

    return;

  }


  const items =
    await apiFetch('/planner');


  if (Array.isArray(items)) {


    if (items.length === 0) {

      plannerList.innerHTML = `
        <p
          style="
            color: #64748b;
            font-size: 14px;
            margin-top: 10px;
          "
        >
          Nenhuma meta cadastrada até ao momento.
        </p>
      `;

      return;

    }


    plannerList.innerHTML =
      items.map(item => `

        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
          "
        >

          <div>

            <strong
              style="
                color: #0f172a;
                font-size: 15px;
              "
            >
              ${escapeHtml(item.titulo)}
            </strong>


            <span
              style="
                display: inline-block;
                margin-left: 8px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                ${getPriorityStyle(
                  item.prioridade
                )}
              "
            >

              ${
                item.prioridade
                  ? item.prioridade.toUpperCase()
                  : 'MÉDIA'
              }

            </span>

          </div>


          <button
            onclick="
              window.deleteTask('${item.id}')
            "
            style="
              background: #fee2e2;
              color: #dc2626;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Eliminar
          </button>

        </div>

      `).join('');

  }

  else {

    plannerList.innerHTML = `

      <p
        style="
          color: #dc2626;
          font-size: 14px;
        "
      >
        ${
          items?.error ||
          'Erro ao carregar metas.'
        }
      </p>

    `;

  }

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHtml(text) {

  if (!text) {

    return '';

  }


  return text.replace(
    /[&<>"']/g,

    (m) => ({

      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'

    })[m]

  );

}


// ======================================================
// ESTILO DA PRIORIDADE
// ======================================================

function getPriorityStyle(
  prioridade
) {

  switch (prioridade) {

    case 'alta':

      return `
        background-color: #fee2e2;
        color: #991b1b;
      `;


    case 'baixa':

      return `
        background-color: #f0fdf4;
        color: #166534;
      `;


    default:

      return `
        background-color: #fef3c7;
        color: #92400e;
      `;

  }

}