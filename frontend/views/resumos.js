import { apiFetch } from '../services/api.js';


export function initResumosView() {

  const form =
    document.getElementById(
      'resumos-form'
    );


  const statusMsg =
    document.getElementById(
      'resumos-status'
    );


  if (form) {

    form.onsubmit = async (e) => {

      e.preventDefault();


      const discInput =
        document.getElementById(
          'resumo-disciplina'
        );


      const titInput =
        document.getElementById(
          'resumo-titulo'
        );


      const contInput =
        document.getElementById(
          'resumo-conteudo'
        );


      const disciplina =
        discInput
          ? discInput.value.trim()
          : '';


      const titulo =
        titInput
          ? titInput.value.trim()
          : '';


      const conteudo =
        contInput
          ? contInput.value.trim()
          : '';


      if (
        !disciplina ||
        !titulo ||
        !conteudo
      ) {

        return;

      }


      if (statusMsg) {

        statusMsg.style.color =
          '#0284c7';

        statusMsg.textContent =
          'A guardar resumo...';

      }


      const result =
        await apiFetch(
          '/resumos',
          {
            method: 'POST',

            body: JSON.stringify({
              disciplina,
              titulo,
              conteudo
            })
          }
        );


      if (
        result &&
        !result.error
      ) {


        if (discInput) {

          discInput.value = '';

        }


        if (titInput) {

          titInput.value = '';

        }


        if (contInput) {

          contInput.value = '';

        }


        if (statusMsg) {

          statusMsg.style.color =
            '#16a34a';

          statusMsg.textContent =
            '✅ Resumo salvo com sucesso!';


          setTimeout(() => {

            statusMsg.textContent = '';

          }, 3000);

        }


        // Atualiza a lista
        await loadResumos();


        // Atualiza conquistas
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
            'Erro ao salvar resumo.';

        }

      }

    };

  }


  // ==================================================
  // EXCLUIR RESUMO
  // ==================================================

  window.deleteResumo =
    async (id) => {

      const res =
        await apiFetch(
          `/resumos/${id}`,
          {
            method: 'DELETE'
          }
        );


      if (
        res &&
        !res.error
      ) {

        await loadResumos();

        if (res && !res.error) {
  loadResumos();

  if (window.atualizarDashboard) {
    window.atualizarDashboard();
  }
}

        if (
          window.atualizarConquistas
        ) {

          window.atualizarConquistas();

        }

      }

    };


  loadResumos();

}


// ======================================================
// CARREGAR RESUMOS
// ======================================================

export async function loadResumos() {

  const container =
    document.getElementById(
      'resumos-list'
    );


  if (!container) {

    return;

  }


  const resumos =
    await apiFetch('/resumos');


  if (Array.isArray(resumos)) {


    if (resumos.length === 0) {

      container.innerHTML = `

        <p
          style="
            color: #64748b;
            font-size: 14px;
            margin-top: 10px;
          "
        >
          Nenhum resumo guardado até ao momento.
        </p>

      `;

      return;

    }


    container.innerHTML =
      resumos.map(r => `

        <div
          style="
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
            background: #f8fafc;
          "
        >

          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >

            <h4
              style="
                color: #0f172a;
                font-size: 16px;
                margin: 0;
              "
            >

              ${escapeHtml(r.titulo)}

              <small
                style="
                  color: #0284c7;
                  font-weight: normal;
                  font-size: 13px;
                "
              >
                (${escapeHtml(
                  r.disciplina
                )})
              </small>

            </h4>


            <button
              onclick="
                window.deleteResumo('${r.id}')
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


          <p
            style="
              margin-top: 10px;
              font-size: 14px;
              white-space: pre-wrap;
              color: #334155;
              line-height: 1.5;
            "
          >
            ${escapeHtml(r.conteudo)}
          </p>

        </div>

      `).join('');

  }

  else {

    container.innerHTML = `

      <p
        style="
          color: #dc2626;
          font-size: 14px;
        "
      >
        ${
          resumos?.error ||
          'Erro ao carregar resumos.'
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