import {
  setupAuthToggle,
  loginUser,
  registerUser
} from './services/auth.js';


document.addEventListener('DOMContentLoaded', () => {

  setupAuthToggle();
  setupNavigation();
  setupLogout();
  setupAuthForms();
  configurarTema();

  checkSession();

});


/* =====================================================
   AUTENTICAÇÃO
   ===================================================== */

function setupAuthForms() {

  const loginForm = document.getElementById('login-form');

  if (loginForm) {

    loginForm.onsubmit = async (e) => {

      e.preventDefault();

      const email =
        document.getElementById('login-email').value;

      const senha =
        document.getElementById('login-password').value;

      const errorEl =
        document.getElementById('login-error');

      if (errorEl) {
        errorEl.textContent = 'A autenticar...';
      }

      try {

        const res = await loginUser(email, senha);

        if (res && res.token) {

          localStorage.setItem(
            'token',
            res.token
          );

          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );

          showAppScreen(res.user);

        } else {

          if (errorEl) {
            errorEl.textContent =
              res?.error ||
              'E-mail ou senha incorretos.';
          }

        }

      } catch (err) {

        console.error(err);

        if (errorEl) {
          errorEl.textContent =
            'Erro ao ligar ao servidor.';
        }

      }

    };

  }


  const registerForm =
    document.getElementById('register-form');

  if (registerForm) {

    registerForm.onsubmit = async (e) => {

      e.preventDefault();

      const nome =
        document.getElementById('reg-nome').value;

      const email =
        document.getElementById('reg-email').value;

      const senha =
        document.getElementById('reg-password').value;

      const perfil =
        document.getElementById('reg-perfil').value;

      const errorEl =
        document.getElementById('register-error');

      if (errorEl) {
        errorEl.textContent = 'A cadastrar...';
      }

      try {

        const res = await registerUser({
          nome,
          email,
          senha,
          perfil
        });

        if (res && res.token) {

          localStorage.setItem(
            'token',
            res.token
          );

          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );

          showAppScreen(res.user);

        } else {

          if (errorEl) {
            errorEl.textContent =
              res?.error ||
              'Erro ao realizar cadastro.';
          }

        }

      } catch (err) {

        console.error(err);

        if (errorEl) {
          errorEl.textContent =
            'Erro ao ligar ao servidor.';
        }

      }

    };

  }

}


/* =====================================================
   VERIFICAR SESSÃO
   ===================================================== */

function checkSession() {

  const token =
    localStorage.getItem('token');

  let user = null;

  try {

    const rawUser =
      localStorage.getItem('user');

    user =
      rawUser
        ? JSON.parse(rawUser)
        : null;

  } catch (e) {

    localStorage.removeItem('user');
    localStorage.removeItem('token');

  }

  if (token && user) {

    showAppScreen(user);

  } else {

    showAuthScreen();

  }

}


/* =====================================================
   MOSTRAR APLICAÇÃO
   ===================================================== */

function showAppScreen(user) {

  const authContainer =
    document.getElementById('auth-container');

  const appContainer =
    document.getElementById('app-container');

  if (authContainer) {
    authContainer.classList.add('hidden');
  }

  if (appContainer) {
    appContainer.classList.remove('hidden');
  }

  const isProf =
    user &&
    user.perfil === 'Professor';


  /* ===================================================
     CONTROLE DA BARRA LATERAL
     =================================================== */

  document
    .querySelectorAll('.aluno-only')
    .forEach(el => {

      if (isProf) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }

    });


  document
    .querySelectorAll('.prof-only')
    .forEach(el => {

      if (isProf) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }

    });


  /* ===================================================
     INFORMAÇÕES DO USUÁRIO
     =================================================== */

  if (user) {

    const userNameEl =
      document.getElementById('user-name');

    const userPerfilEl =
      document.getElementById('user-perfil');

    const dashUserNameEl =
      document.getElementById('dash-user-name');

    const welcomeTextEl =
      document.getElementById('dash-welcome-text');


    if (userNameEl) {
      userNameEl.textContent =
        user.nome || 'Utilizador';
    }

    if (userPerfilEl) {
      userPerfilEl.textContent =
        user.perfil || 'Aluno';
    }

    if (dashUserNameEl) {
      dashUserNameEl.textContent =
        user.nome || 'Utilizador';
    }


    if (welcomeTextEl) {

      welcomeTextEl.textContent = isProf

        ? 'Gerencie simulados, questões, materiais e acompanhe o desempenho dos alunos.'

        : 'Acompanhe o progresso das suas metas e veja os materiais disponibilizados pelo professor.';

    }

  }


  /* ===================================================
     IMPORTANTE:
     ESCONDER TODAS AS TELAS E MOSTRAR SOMENTE
     O DASHBOARD AO ENTRAR
     =================================================== */

  const views =
    document.querySelectorAll('.view-card');

  views.forEach(view => {

    if (view.id === 'view-dashboard') {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }

  });


  /* ===================================================
     MARCAR DASHBOARD COMO ATIVO
     =================================================== */

  const navButtons =
    document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {

    const target =
      btn.getAttribute('data-view');

    if (target === 'dashboard') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

  });


  /* ===================================================
     CARREGAR SOMENTE O DASHBOARD
     =================================================== */

  loadInitialDashboard(user);

}


/* =====================================================
   CARREGAR DASHBOARD INICIAL
   ===================================================== */

async function loadInitialDashboard(user) {

  const isProf =
    user &&
    user.perfil === 'Professor';


  /* ==============================
     DASHBOARD DO PROFESSOR
     ============================== */

  if (isProf) {

    try {

      const profModule =
        await import('./views/professor.js');

      if (
        profModule &&
        profModule.initProfessorView
      ) {

        profModule.initProfessorView();

      }

      if (
        profModule &&
        profModule.atualizarEstatisticasProfessor
      ) {

        profModule.atualizarEstatisticasProfessor();

      }

    } catch (err) {

      console.error(
        'Erro ao carregar dashboard do professor:',
        err
      );

    }

    return;
  }


  /* ==============================
     DASHBOARD DO ALUNO
     ============================== */

  try {

    const dashModule =
      await import('./views/dashboard.js');

    if (
      dashModule &&
      dashModule.initDashboardView
    ) {

      dashModule.initDashboardView();

    }

  } catch (err) {

    console.error(
      'Erro ao carregar dashboard do aluno:',
      err
    );

  }

}


/* =====================================================
   TELA DE LOGIN
   ===================================================== */

function showAuthScreen() {

  const authContainer =
    document.getElementById('auth-container');

  const appContainer =
    document.getElementById('app-container');

  if (authContainer) {
    authContainer.classList.remove('hidden');
  }

  if (appContainer) {
    appContainer.classList.add('hidden');
  }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function setupLogout() {

  const logoutBtn =
    document.getElementById('logout-btn');

  if (logoutBtn) {

    logoutBtn.onclick = () => {

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      showAuthScreen();

    };

  }

}


/* =====================================================
   NAVEGAÇÃO
   ===================================================== */

function setupNavigation() {

  const navButtons =
    document.querySelectorAll('.nav-btn');

  const views =
    document.querySelectorAll('.view-card');


  navButtons.forEach(btn => {

    btn.onclick = async () => {

      const targetView =
        btn.getAttribute('data-view');

      const user =
        JSON.parse(
          localStorage.getItem('user') || '{}'
        );

      const isProf =
        user.perfil === 'Professor';


      /* ==============================
         BOTÃO ATIVO
         ============================== */

      navButtons.forEach(b => {
        b.classList.remove('active');
      });

      btn.classList.add('active');


      /* ==============================
         MOSTRAR SOMENTE A VIEW CLICADA
         ============================== */

      views.forEach(view => {

        if (
          view.id ===
          `view-${targetView}`
        ) {

          view.classList.remove('hidden');

        } else {

          view.classList.add('hidden');

        }

      });


      /* =================================================
         DASHBOARD
         ================================================= */

      if (targetView === 'dashboard') {

        if (isProf) {

          try {

            const profModule =
              await import('./views/professor.js');

            if (
              profModule &&
              profModule.atualizarEstatisticasProfessor
            ) {

              profModule.atualizarEstatisticasProfessor();

            }

          } catch (e) {

            console.error(
              'Erro ao carregar dashboard do professor:',
              e
            );

          }

        } else {

          try {

            const dashModule =
              await import('./views/dashboard.js');

            if (
              dashModule &&
              dashModule.initDashboardView
            ) {

              dashModule.initDashboardView();

            }

          } catch (e) {

            console.error(
              'Erro ao carregar dashboard do aluno:',
              e
            );

          }

        }

      }


      /* =================================================
         PROFESSOR
         ================================================= */

      if (isProf) {

        try {

          const profModule =
            await import('./views/professor.js');


          if (targetView === 'questoes') {

            if (
              profModule &&
              profModule.renderQuestoesProfessor
            ) {

              profModule.renderQuestoesProfessor();

            }

          }


          if (targetView === 'alunos') {

            if (
              profModule &&
              profModule.renderAcompanhamentoAlunos
            ) {

              profModule.renderAcompanhamentoAlunos();

            }

          }

        } catch (e) {

          console.error(
            'Erro ao carregar área do professor:',
            e
          );

        }

      }


      /* =================================================
         MATERIAIS
         ================================================= */

      if (targetView === 'materiais') {

        try {

          const materiaisModule =
            await import('./views/materiais.js');

          if (
            materiaisModule &&
            materiaisModule.initMateriaisView
          ) {

            materiaisModule.initMateriaisView();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir materiais:',
            e
          );

        }

      }


      /* =================================================
         PLANNER
         ================================================= */

      if (
        !isProf &&
        targetView === 'planner'
      ) {

        try {

          const plannerModule =
            await import('./views/planner.js');

          if (
            plannerModule &&
            plannerModule.initPlannerView
          ) {

            plannerModule.initPlannerView();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir Planner:',
            e
          );

        }

      }


      /* =================================================
         RESUMOS
         ================================================= */

      if (
        !isProf &&
        targetView === 'resumos'
      ) {

        try {

          const resumosModule =
            await import('./views/resumos.js');

          if (
            resumosModule &&
            resumosModule.initResumosView
          ) {

            resumosModule.initResumosView();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir Resumos:',
            e
          );

        }

      }


      /* =================================================
         CALENDÁRIO
         ================================================= */

      if (
        !isProf &&
        targetView === 'calendario'
      ) {

        try {

          const calModule =
            await import('./views/calendario.js');

          if (
            calModule &&
            calModule.initCalendarioView
          ) {

            calModule.initCalendarioView();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir Calendário:',
            e
          );

        }

      }


      /* =================================================
         CONQUISTAS
         ================================================= */

      if (
        !isProf &&
        targetView === 'conquistas'
      ) {

        try {

          const conquistasModule =
            await import('./views/conquistas.js');

          if (
            conquistasModule &&
            conquistasModule.initConquistasView
          ) {

            await conquistasModule.initConquistasView();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir Conquistas:',
            e
          );

        }

      }


      /* =================================================
         QUESTÕES DO ALUNO
         ================================================= */

      if (
        !isProf &&
        targetView === 'questoes'
      ) {

        try {

          const questoesModule =
            await import('./views/questoes.js');

          if (
            questoesModule &&
            questoesModule.loadQuestoesAluno
          ) {

            questoesModule.loadQuestoesAluno();

          }

        } catch (e) {

          console.error(
            'Erro ao abrir Questões:',
            e
          );

        }

      }

    };

  });

}


/* =====================================================
   MODO CLARO / MODO ESCURO
   ===================================================== */

function configurarTema() {

  const botaoTema =
    document.getElementById(
      'theme-toggle'
    );

  if (!botaoTema) return;


  const temaSalvo =
    localStorage.getItem(
      'studyflow-theme'
    );


  if (temaSalvo === 'dark') {

    document.body.classList.add(
      'dark-mode'
    );

    botaoTema.textContent = '☀️';

  } else {

    document.body.classList.remove(
      'dark-mode'
    );

    botaoTema.textContent = '🌙';

  }


  botaoTema.onclick = () => {

    const modoEscuro =
      document.body.classList.toggle(
        'dark-mode'
      );


    if (modoEscuro) {

      localStorage.setItem(
        'studyflow-theme',
        'dark'
      );

      botaoTema.textContent = '☀️';

    } else {

      localStorage.setItem(
        'studyflow-theme',
        'light'
      );

      botaoTema.textContent = '🌙';

    }

  };

}