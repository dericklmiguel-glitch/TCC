// ======================================================
// QUESTOES.JS
// ======================================================

function getQuestoes() {
    return JSON.parse(
        localStorage.getItem("app_questoes") || "[]"
    );
}

function getRespostas() {
    return JSON.parse(
        localStorage.getItem("app_respostas") || "[]"
    );
}

function salvarRespostas(respostas) {
    localStorage.setItem(
        "app_respostas",
        JSON.stringify(respostas)
    );
}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHtml(texto) {

    if (texto === undefined || texto === null) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// CARREGAR QUESTÕES DO ALUNO
// ======================================================

export function loadQuestoesAluno() {

    const container =
        document.getElementById(
            "aluno-questoes-list"
        );

    if (!container) return;


    const user =
        JSON.parse(
            localStorage.getItem("user") || "{}"
        );


    const todasQuestoes = getQuestoes();


    const questoesVisiveis =
        todasQuestoes.filter(q => {

            return (
                q.alunoAlvo === "todos" ||
                q.alunoAlvo === user.email
            );

        });


    if (questoesVisiveis.length === 0) {

        container.innerHTML = `
            <p style="color:#64748b;">
                Nenhuma questão disponível para você no momento.
            </p>
        `;

        return;
    }


    const respostas =
        getRespostas();


    container.innerHTML =
        questoesVisiveis.map(q => {

            const minhaResposta =
                respostas.find(r =>
                    r.questaoId === q.id &&
                    r.alunoEmail === user.email
                );


            return criarCardQuestao(
                q,
                minhaResposta
            );

        }).join("");
}


// ======================================================
// CRIAR CARD DA QUESTÃO
// ======================================================

function criarCardQuestao(
    q,
    minhaResposta
) {

    const cabecalho = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:8px;
        ">

            <span style="
                background:#e0f2fe;
                color:#0369a1;
                padding:3px 8px;
                border-radius:4px;
                font-size:12px;
                font-weight:bold;
            ">
                ${escapeHtml(q.disciplina)}
            </span>

            ${
                q.alunoAlvo !== "todos"
                    ? `
                        <span style="
                            font-size:11px;
                            font-weight:bold;
                            background:#fef3c7;
                            color:#92400e;
                            padding:3px 8px;
                            border-radius:10px;
                        ">
                            Exclusiva para você
                        </span>
                    `
                    : ""
            }

        </div>

        <p style="
            font-weight:600;
            font-size:15px;
            margin-bottom:12px;
            color:#1e293b;
        ">
            ${escapeHtml(q.enunciado)}
        </p>
    `;


    // ==================================================
    // QUESTÃO OBJETIVA
    // ==================================================

    if (q.tipo === "objetiva") {

        return `

            <div style="
                background:#ffffff;
                border:1px solid #e2e8f0;
                padding:16px;
                border-radius:8px;
                margin-bottom:12px;
            ">

                ${cabecalho}

                <div style="
                    display:flex;
                    flex-direction:column;
                    gap:6px;
                ">

                    <button
                        class="option-btn"
                        onclick="
                            window.responderQuestao(
                                ${q.id},
                                'A',
                                '${q.correta}'
                            )
                        "
                    >
                        A) ${escapeHtml(q.opcoes.A)}
                    </button>

                    <button
                        class="option-btn"
                        onclick="
                            window.responderQuestao(
                                ${q.id},
                                'B',
                                '${q.correta}'
                            )
                        "
                    >
                        B) ${escapeHtml(q.opcoes.B)}
                    </button>

                    <button
                        class="option-btn"
                        onclick="
                            window.responderQuestao(
                                ${q.id},
                                'C',
                                '${q.correta}'
                            )
                        "
                    >
                        C) ${escapeHtml(q.opcoes.C)}
                    </button>

                    <button
                        class="option-btn"
                        onclick="
                            window.responderQuestao(
                                ${q.id},
                                'D',
                                '${q.correta}'
                            )
                        "
                    >
                        D) ${escapeHtml(q.opcoes.D)}
                    </button>

                </div>


                <div
                    id="q-feedback-${q.id}"
                    style="
                        font-size:13px;
                        font-weight:700;
                        margin-top:8px;
                    "
                ></div>

            </div>
        `;
    }


    // ==================================================
    // QUESTÃO DISSERTATIVA
    // ==================================================

    if (q.tipo === "dissertativa") {

        return criarQuestaoDissertativa(
            q,
            minhaResposta,
            cabecalho
        );
    }


    return "";
}


// ======================================================
// QUESTÃO DISSERTATIVA
// ======================================================

function criarQuestaoDissertativa(
    q,
    minhaResposta,
    cabecalho
) {

    let areaResposta = "";


    // ----------------------------------------------
    // JÁ FOI CORRIGIDA
    // ----------------------------------------------

    if (
        minhaResposta &&
        minhaResposta.status === "corrigida"
    ) {

        const correta =
            minhaResposta.resultado === "correta";


        areaResposta = `

            <div style="
                background:#f8fafc;
                padding:12px;
                border-radius:8px;
                margin-top:10px;
            ">

                <strong>
                    Sua resposta:
                </strong>

                <p style="white-space:pre-wrap;">
                    ${escapeHtml(minhaResposta.resposta)}
                </p>


                <hr>


                <strong>
                    Resultado:
                </strong>

                <p style="
                    color:${correta ? "#16a34a" : "#dc2626"};
                    font-weight:bold;
                ">

                    ${
                        correta
                            ? "✅ Correta"
                            : "❌ Incorreta"
                    }

                </p>


                ${
                    minhaResposta.nota !== null &&
                    minhaResposta.nota !== undefined
                        ? `
                            <p>
                                <strong>Nota:</strong>
                                ${minhaResposta.nota}/10
                            </p>
                        `
                        : ""
                }


                ${
                    minhaResposta.comentario
                        ? `
                            <p>
                                <strong>
                                    Feedback do professor:
                                </strong>
                            </p>

                            <p style="white-space:pre-wrap;">
                                ${escapeHtml(
                                    minhaResposta.comentario
                                )}
                            </p>
                        `
                        : ""
                }

            </div>
        `;
    }


    // ----------------------------------------------
    // JÁ FOI ENVIADA, MAS AINDA NÃO CORRIGIDA
    // ----------------------------------------------

    else if (minhaResposta) {

        areaResposta = `

            <div style="
                background:#fef3c7;
                color:#92400e;
                padding:12px;
                border-radius:8px;
                margin-top:10px;
            ">

                <strong>
                    ⏳ Resposta enviada!
                </strong>

                <p>
                    O professor ainda não corrigiu sua resposta.
                </p>

                <p style="white-space:pre-wrap;">
                    ${escapeHtml(minhaResposta.resposta)}
                </p>

            </div>
        `;
    }


    // ----------------------------------------------
    // AINDA NÃO RESPONDEU
    // ----------------------------------------------

    else {

        areaResposta = `

            <textarea
                id="resposta-dissertativa-${q.id}"
                rows="6"
                placeholder="Digite sua resposta..."
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:10px;
                    border:1px solid #cbd5e1;
                    border-radius:8px;
                    resize:vertical;
                    margin-top:8px;
                "
            ></textarea>


            <button
                onclick="
                    window.enviarRespostaDissertativa(${q.id})
                "
                style="
                    margin-top:8px;
                    background:#2563eb;
                    color:white;
                    border:none;
                    padding:10px 15px;
                    border-radius:7px;
                    cursor:pointer;
                "
            >
                📤 Enviar resposta
            </button>

        `;
    }


    return `

        <div style="
            background:#ffffff;
            border:1px solid #e2e8f0;
            padding:16px;
            border-radius:8px;
            margin-bottom:12px;
        ">

            ${cabecalho}

            <span style="
                display:inline-block;
                background:#ede9fe;
                color:#6d28d9;
                padding:4px 8px;
                border-radius:5px;
                font-size:12px;
                font-weight:bold;
            ">
                📝 Questão dissertativa
            </span>


            ${areaResposta}

        </div>

    `;
}


// ======================================================
// ENVIAR RESPOSTA DISSERTATIVA
// ======================================================

window.enviarRespostaDissertativa =
    function (questaoId) {

        const textarea =
            document.getElementById(
                `resposta-dissertativa-${questaoId}`
            );


        if (!textarea) return;


        const respostaTexto =
            textarea.value.trim();


        if (!respostaTexto) {

            alert(
                "Digite uma resposta antes de enviar."
            );

            return;
        }


        const user =
            JSON.parse(
                localStorage.getItem("user") || "{}"
            );


        if (!user.email) {

            alert(
                "Não foi possível identificar o aluno."
            );

            return;
        }


        const respostas =
            getRespostas();


        const existente =
            respostas.find(r =>
                r.questaoId === questaoId &&
                r.alunoEmail === user.email
            );


        // Se já foi corrigida, não deixa enviar novamente
        if (
            existente &&
            existente.status === "corrigida"
        ) {

            alert(
                "Essa questão já foi corrigida pelo professor."
            );

            return;
        }


        if (existente) {

            existente.resposta =
                respostaTexto;

            existente.enviadaEm =
                new Date().toLocaleString("pt-BR");

            existente.status =
                "pendente";

        } else {

            respostas.push({

                id:
                    Date.now() +
                    Math.floor(Math.random() * 1000),

                questaoId,

                alunoEmail:
                    user.email,

                alunoNome:
                    user.nome ||
                    user.name ||
                    user.email,

                resposta:
                    respostaTexto,

                enviadaEm:
                    new Date().toLocaleString("pt-BR"),

                status:
                    "pendente",

                resultado:
                    null,

                nota:
                    null,

                comentario:
                    ""

            });
        }


        salvarRespostas(respostas);


        alert(
            "✅ Resposta enviada! Agora aguarde a correção do professor."
        );


        loadQuestoesAluno();
    };


// ======================================================
// QUESTÕES OBJETIVAS
// ======================================================

window.responderQuestao =
    function (
        qId,
        selecionada,
        correta
    ) {

        const feedbackEl =
            document.getElementById(
                `q-feedback-${qId}`
            );


        if (!feedbackEl) return;


        if (selecionada === correta) {

            feedbackEl.style.color =
                "#16a34a";

            feedbackEl.textContent =
                "🎉 Resposta Correta!";

        } else {

            feedbackEl.style.color =
                "#dc2626";

            feedbackEl.textContent =
                `❌ Resposta Incorreta. A certa é (${correta}).`;
        }
    };