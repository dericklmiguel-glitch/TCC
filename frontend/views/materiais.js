/* =====================================================
   MATERIAIS DE ESTUDO
   Links enviados pelo professor
   ===================================================== */

const API_URL = 'http://localhost:3000';


// =====================================================
// INICIALIZAÇÃO
// =====================================================

export async function initMateriaisView() {

  const user = obterUsuarioAtual();

  if (!user || !user.email) {
    return;
  }

  if (user.perfil === 'Professor') {

    configurarFormularioProfessor();

    await carregarAlunos();

    renderMateriaisProfessor();

  } else {

    renderMateriaisAluno();

  }

}


// =====================================================
// USUÁRIO ATUAL
// =====================================================

function obterUsuarioAtual() {

  try {

    return JSON.parse(
      localStorage.getItem('user') || '{}'
    );

  } catch (erro) {

    console.error(
      'Erro ao obter usuário:',
      erro
    );

    return {};

  }

}


// =====================================================
// MATERIAIS - LOCALSTORAGE
// =====================================================

function obterMateriais() {

  try {

    return JSON.parse(
      localStorage.getItem(
        'studyflow-materiais'
      ) || '[]'
    );

  } catch (erro) {

    console.error(
      'Erro ao carregar materiais:',
      erro
    );

    return [];

  }

}


function salvarMateriais(materiais) {

  localStorage.setItem(
    'studyflow-materiais',
    JSON.stringify(materiais)
  );

}


// =====================================================
// SEGURANÇA HTML
// =====================================================

function escapeHtml(texto) {

  if (
    texto === null ||
    texto === undefined
  ) {
    return '';
  }

  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

}


// =====================================================
// VALIDAR LINK
// =====================================================

function validarLink(link) {

  try {

    const url = new URL(link);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );

  } catch (erro) {

    return false;

  }

}


// =====================================================
// FORMULÁRIO DO PROFESSOR
// =====================================================

function configurarFormularioProfessor() {

  const form =
    document.getElementById(
      'materiais-form'
    );

  if (!form) {
    return;
  }


  // Evita cadastrar o evento várias vezes

  if (
    form.dataset.configurado === 'true'
  ) {
    return;
  }

  form.dataset.configurado = 'true';


  form.onsubmit = (e) => {

    e.preventDefault();


    const titulo =
      document
        .getElementById(
          'material-titulo'
        )
        ?.value
        .trim();


    const descricao =
      document
        .getElementById(
          'material-descricao'
        )
        ?.value
        .trim();


    const link =
      document
        .getElementById(
          'material-link'
        )
        ?.value
        .trim();


    const alunoAlvo =
      document
        .getElementById(
          'material-aluno-alvo'
        )
        ?.value;


    const status =
      document.getElementById(
        'materiais-status'
      );


    // ===============================
    // VALIDAÇÕES
    // ===============================

    if (!titulo) {

      mostrarStatus(
        status,
        'Digite um título para o material.',
        false
      );

      return;

    }


    if (!link) {

      mostrarStatus(
        status,
        'Digite o link do material.',
        false
      );

      return;

    }


    if (!validarLink(link)) {

      mostrarStatus(
        status,
        'Digite um link válido começando com http:// ou https://',
        false
      );

      return;

    }


    if (!alunoAlvo) {

      mostrarStatus(
        status,
        'Selecione para quem deseja enviar.',
        false
      );

      return;

    }


    // ===============================
    // PROFESSOR
    // ===============================

    const professor =
      obterUsuarioAtual();


    // ===============================
    // NOVO MATERIAL
    // ===============================

    const novoMaterial = {

      id: Date.now(),

      titulo,

      descricao,

      link,

      alunoAlvo,

      professorEmail:
        professor.email || '',

      professorNome:
        professor.nome || 'Professor',

      criadoEm:
        new Date().toISOString()

    };


    // ===============================
    // SALVAR
    // ===============================

    const materiais =
      obterMateriais();

    materiais.push(novoMaterial);

    salvarMateriais(materiais);


    // Limpa formulário

    form.reset();


    // ===============================
    // MENSAGEM
    // ===============================

    mostrarStatus(
      status,
      '✅ Material publicado com sucesso!',
      true
    );


    // Atualiza lista

    renderMateriaisProfessor();

  };

}


// =====================================================
// STATUS
// =====================================================

function mostrarStatus(
  elemento,
  mensagem,
  sucesso
) {

  if (!elemento) {
    return;
  }

  elemento.textContent = mensagem;

  elemento.style.color =
    sucesso
      ? '#16a34a'
      : '#dc2626';

}


// =====================================================
// CARREGAR ALUNOS DO BACKEND
// =====================================================

async function carregarAlunos() {

  const select =
    document.getElementById(
      'material-aluno-alvo'
    );


  if (!select) {
    return;
  }


  // Mostra temporariamente

  select.innerHTML = `
    <option value="todos">
      📢 Todos os alunos
    </option>

    <option disabled>
      ⏳ Carregando alunos...
    </option>
  `;


  try {

    const response =
      await fetch(
        `${API_URL}/auth/alunos`
      );


    if (!response.ok) {

      throw new Error(
        `Erro HTTP: ${response.status}`
      );

    }


    const alunos =
      await response.json();


    console.log(
      'Alunos recebidos do backend:',
      alunos
    );


    // Volta para a opção padrão

    select.innerHTML = `
      <option value="todos">
        📢 Todos os alunos
      </option>
    `;


    // ===============================
    // NENHUM ALUNO
    // ===============================

    if (
      !Array.isArray(alunos) ||
      alunos.length === 0
    ) {

      const option =
        document.createElement(
          'option'
        );

      option.disabled = true;

      option.textContent =
        '⚠️ Nenhum aluno cadastrado';

      select.appendChild(option);

      return;

    }


    // ===============================
    // ADICIONAR ALUNOS
    // ===============================

    alunos.forEach(aluno => {

      const option =
        document.createElement(
          'option'
        );


      option.value =
        aluno.email;


      option.textContent =
        `👤 ${aluno.nome || aluno.email}`;


      select.appendChild(option);

    });


  } catch (erro) {

    console.error(
      'Erro ao carregar alunos:',
      erro
    );


    // Mantém "Todos"

    select.innerHTML = `
      <option value="todos">
        📢 Todos os alunos
      </option>

      <option disabled>
        ⚠️ Não foi possível carregar os alunos
      </option>
    `;

  }

}


// =====================================================
// MATERIAIS DO PROFESSOR
// =====================================================

function renderMateriaisProfessor() {

  const container =
    document.getElementById(
      'materiais-professor-list'
    );


  if (!container) {
    return;
  }


  const professor =
    obterUsuarioAtual();


  const materiais =
    obterMateriais()

      .filter(
        material =>
          material.professorEmail ===
          professor.email
      )

      .sort(
        (a, b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
      );


  // ===============================
  // NENHUM MATERIAL
  // ===============================

  if (materiais.length === 0) {

    container.innerHTML = `

      <div class="material-empty">

        <p>
          📚 Nenhum material publicado ainda.
        </p>

        <small>
          Os links que você publicar aparecerão aqui.
        </small>

      </div>

    `;

    return;

  }


  // ===============================
  // LISTA
  // ===============================

  container.innerHTML =
    materiais
      .map(material => {

        const destinatario =
          material.alunoAlvo === 'todos'
            ? 'Todos os alunos'
            : material.alunoAlvo;


        return `

          <div class="material-card">

            <div class="material-card-header">

              <div>

                <span class="material-icon">
                  🔗
                </span>

                <strong>
                  ${escapeHtml(material.titulo)}
                </strong>

              </div>


              <button
                type="button"
                class="material-delete-btn"
                data-id="${material.id}"
              >
                🗑️
              </button>

            </div>


            ${
              material.descricao
                ? `
                  <p class="material-description">
                    ${escapeHtml(material.descricao)}
                  </p>
                `
                : ''
            }


            <div class="material-target">

              👥 Enviado para:

              <strong>
                ${escapeHtml(destinatario)}
              </strong>

            </div>


            <a
              href="${escapeHtml(material.link)}"
              target="_blank"
              rel="noopener noreferrer"
              class="material-open-btn"
            >
              🔗 Abrir material
            </a>

          </div>

        `;

      })
      .join('');


  // ===============================
  // BOTÕES DE EXCLUIR
  // ===============================

  container
    .querySelectorAll(
      '.material-delete-btn'
    )
    .forEach(button => {

      button.onclick = () => {

        const id =
          Number(
            button.dataset.id
          );


        const confirmar =
          confirm(
            'Tem certeza que deseja excluir este material?'
          );


        if (!confirmar) {
          return;
        }


        let materiais =
          obterMateriais();


        materiais =
          materiais.filter(
            material =>
              material.id !== id
          );


        salvarMateriais(
          materiais
        );


        renderMateriaisProfessor();

      };

    });

}


// =====================================================
// MATERIAIS DO ALUNO
// =====================================================

function renderMateriaisAluno() {

  const container =
    document.getElementById(
      'materiais-aluno-list'
    );


  if (!container) {
    return;
  }


  const aluno =
    obterUsuarioAtual();


  const materiais =
    obterMateriais()

      .filter(
        material =>
          material.alunoAlvo === 'todos' ||
          material.alunoAlvo === aluno.email
      )

      .sort(
        (a, b) =>
          new Date(b.criadoEm) -
          new Date(a.criadoEm)
      );


  // ===============================
  // NENHUM MATERIAL
  // ===============================

  if (materiais.length === 0) {

    container.innerHTML = `

      <div class="material-empty">

        <div
          style="
            font-size: 42px;
            margin-bottom: 10px;
          "
        >
          📚
        </div>

        <h3>
          Nenhum material disponível
        </h3>

        <p>
          Quando seu professor enviar algum
          material, ele aparecerá aqui.
        </p>

      </div>

    `;

    return;

  }


  // ===============================
  // LISTA DO ALUNO
  // ===============================

  container.innerHTML =
    materiais
      .map(material => {

        const data =
          new Date(
            material.criadoEm
          );


        const dataFormatada =
          data.toLocaleDateString(
            'pt-BR'
          );


        return `

          <div class="material-card aluno-material-card">

            <div class="material-card-header">

              <div>

                <span class="material-icon">
                  🔗
                </span>

                <strong>
                  ${escapeHtml(material.titulo)}
                </strong>

              </div>

            </div>


            ${
              material.descricao
                ? `
                  <p class="material-description">
                    ${escapeHtml(material.descricao)}
                  </p>
                `
                : ''
            }


            <div class="material-teacher">

              👨‍🏫 Enviado por:

              <strong>
                ${escapeHtml(material.professorNome)}
              </strong>

            </div>


            <div class="material-date">

              📅 ${dataFormatada}

            </div>


            <a
              href="${escapeHtml(material.link)}"
              target="_blank"
              rel="noopener noreferrer"
              class="material-open-btn"
            >
              🔗 Abrir material
            </a>

          </div>

        `;

      })
      .join('');

}