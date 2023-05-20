let instrucaoAtual;                            // A instrução atual sendo mostrada na tela
let instrucaoInfracoes = [];                        // As infrações da instrução atual
let sequenciaDeInstrucoes = [];     // Começa com a sequência de baliza

let todasInfracoesCometidas = [];                   // Todas as infrações cometidas na sessão
let porcentagem = 0;
let telaAtual = 0;
let duracaoInstrucaoAtual;
let timer;

// Configurações
let modoDeTrajeto = 0; //0 = normal com baliza, 1 = sem baliza, 2 = apenas 3 pontas
let mutado = false;

// Referencias
const exame = document.getElementById("exame");
const resultadoParcial = document.getElementById("resultado-parcial");
const resultadoFinal = document.getElementById("resultado-final");
const configuracoes = document.getElementById("configuracoes");
const pausar = document.getElementById("pause");
const resumir = document.getElementById("resume");
const mutar = document.getElementById("mute");
const desmutar = document.getElementById("unmute");

function adicionarEventosNosBotoes() {
    pausar.addEventListener('click', finalizar);
    resumir.addEventListener('click', inicializar);

    mutar.addEventListener('click', mutarSom);
    desmutar.addEventListener('click', desmutarSom);
}

// Adiciona o evento de clique aos cheques
function adicionarEventosNosCheques() {
    const chequesVerdes = document.getElementsByClassName("green-check");
    const chequesVermelhos = document.getElementsByClassName("red-check");

    for (cheque of chequesVerdes) {
        cheque.addEventListener('click', (e) => marcarCheck(e));
    }

    for (cheque of chequesVermelhos) {
        cheque.addEventListener('click', (e) => marcarCheck(e));
    }
}

// Muta o som
function mutarSom() {
    mutado = true;
    mutar.classList.add("invisible");
    desmutar.classList.remove("invisible");
}

// Desmuta o som
function desmutarSom() {
    mutado = false;
    mutar.classList.remove("invisible");
    desmutar.classList.add("invisible");
}

// Finaliza o simulado e mostra os resultados
function finalizar() {
    if (telaAtual == 1) {
        checarInfracoesCometidas();
    }

    telaAtual = 2;
    pausar.classList.add("invisible");
    resumir.classList.remove("invisible");

    exame.classList.add("invisible");
    resultadoParcial.classList.add("invisible");
    resultadoFinal.classList.remove("invisible");

    const barra = document.getElementById("progress-bar__inner");
    barra.style.width = "0%";
    clearTimeout(timer);
    checarTodasAsInfracoes();
}

// Inicializa ou reinicializa a aplicação
function inicializar() {
    pausar.classList.remove("invisible");
    resumir.classList.add("invisible");

    instrucaoAtual = 10;
    instrucaoInfracoes = [];

    selecionarModoDeTrajeto();

    if (modoDeTrajeto == 0) {
        sequenciaDeInstrucoes = [12, 11, 10, 7, 8];
    } else
    if (modoDeTrajeto == 1) {
        sequenciaDeInstrucoes = [];
    } else
    if (modoDeTrajeto == 2) {
        sequenciaDeInstrucoes = [9];
    }

    todasInfracoesCometidas = [];
    porcentagem = 0;
    telaAtual = 0;
    duracaoInstrucaoAtual = 20;

    exame.classList.remove("invisible");
    configuracoes.classList.add("invisible");
    resultadoParcial.classList.add("invisible");
    resultadoFinal.classList.add("invisible");

    timer = setTimeout(AtualizarPorcentagem, 1000);
    pegarProximaInstrucao();
}

// Marca o cheque clicado
function marcarCheck(e) {
    const element = e.target;

    if (element.nextElementSibling != null)
        element.nextElementSibling.classList.remove("checked");

    if (element.previousElementSibling != null)
        element.previousElementSibling.classList.remove("checked");

    element.classList.toggle("checked");
}

// Atualiza a instrução na tela
function atualizarInstrucao() {
    const texto = document.getElementById("exame-texto");
    texto.innerText = Instrucoes[instrucaoAtual.toString()].texto;

    duracaoInstrucaoAtual = Instrucoes[instrucaoAtual.toString()].duracao;
    instrucaoInfracoes = Instrucoes[instrucaoAtual.toString()].infracoes;

    if (!mutado) {
        tocarSom("../media/" + Instrucoes[instrucaoAtual.toString()].voz + ".mp3");
    }

    atualizarInfracoes();
    adicionarEventosNosCheques();
}

//Toca um som uma vez
function tocarSom(som) {
    const audio = new Audio(som);
    audio.loop = false;
    audio.play();
}

// Pega o modo de trajeto selecionado pelo usuário
function selecionarModoDeTrajeto() {
    const seletores = document.getElementsByName('modo');
 
    for (i = 0; i < seletores.length; i++) {
        if (seletores[i].checked)
            modoDeTrajeto = seletores[i].value;
    }
}

// Atualiza as infrações na tela
function atualizarInfracoes() {
    resultadoParcial.innerHTML = "";

    for (infracao of instrucaoInfracoes) {
        const item = document.createElement("div");

        item.id = "i-" + infracao;
        item.classList.add("resultado-parcial__item");

        const cheques = document.createElement("div");
        cheques.classList.add("resultado-parcial__checks")

        const chequeVerde = document.createElement("ion-icon");
        chequeVerde.setAttribute("name", "checkmark");
        chequeVerde.classList.add("green-check");

        const chequeVermelho = document.createElement("ion-icon");
        chequeVermelho.setAttribute("name", "close");
        chequeVermelho.classList.add("red-check");

        const texto = document.createElement("div");
        texto.classList.add("resultado-parcial__text");
        texto.innerText = Infracoes[infracao.toString()].texto;

        item.appendChild(cheques);
        item.appendChild(texto);

        cheques.appendChild(chequeVerde);
        cheques.appendChild(chequeVermelho);

        resultadoParcial.appendChild(item);
    }
}

// Checar todas as infrações cometidas ao longo do trajeto completo
function checarTodasAsInfracoes() {
    resultadoFinal.innerHTML = "";
    let resultadoPontos = 0;

    // Pequeno algoritmo para contar quantas vezes um valor se repete em um array
    var map = todasInfracoesCometidas.reduce(function(obj, b) {
        obj[b] = ++obj[b] || 1;
        return obj;
    }, {});

    for (infracao of todasInfracoesCometidas) {
        const item = document.createElement("div");
        item.classList.add("resultado-final__item");

        const icone = document.createElement("ion-icon");
        icone.setAttribute("name", "close");

        const texto = document.createElement("div");
        texto.classList.add("resultado-final__texto")

        const repeticoes = map[infracao];
        const pontos = Infracoes[infracao.toString()].pontos;

        texto.innerText =
        `(${repeticoes}) ${Infracoes[infracao.toString()].texto} - [${repeticoes}x${pontos} = ${repeticoes * pontos} pontos]`;

        item.appendChild(icone);
        item.appendChild(texto);
        resultadoFinal.appendChild(item);

        resultadoPontos += repeticoes * pontos;
    }

    const totalPontos = document.createElement("div");
    totalPontos.classList.add("resultado-final__pontos")
    totalPontos.innerText = `Total: ${resultadoPontos} pontos`;

    resultadoFinal.appendChild(totalPontos);
}

// Checa todas as infrações cometidas na instrução atual e adiciona elas a lista
function checarInfracoesCometidas() {
    const infracoes = document.getElementsByClassName("resultado-parcial__item");

    for (infracao of infracoes) {
        const chequeVermelho = document.querySelector(`#${infracao.id} .red-check`);

        if (chequeVermelho.classList.contains("checked")) {
            const idInfracao = parseInt(infracao.id.split("-")[1]);
            todasInfracoesCometidas.push(idInfracao);
        }
    }
}

// Pega a próxima infração da sequência ou uma aleatoriamente
function pegarProximaInstrucao() {
    if (sequenciaDeInstrucoes.length > 0) {
        instrucaoAtual = sequenciaDeInstrucoes.shift();
    } else {
        if (modoDeTrajeto == 2) {
            sequenciaDeInstrucoes = [9];
        } else {
            const aleatorio = Math.floor(Math.random() * 9);

            switch (aleatorio) {
                case 7:
                    sequenciaDeInstrucoes = [7, 8];
                    break;
                case 8:
                    sequenciaDeInstrucoes = [10];
                    break;
                default:
                    sequenciaDeInstrucoes = [aleatorio];
                    break;
            }
        }
    }

    atualizarInstrucao();
}

// Atualiza a tela após a porcentagem atingir 100%
function atualizarTela() {
    if (telaAtual === 0) {
        telaAtual = 1;
        exame.classList.add("invisible");
        resultadoParcial.classList.remove("invisible");
        duracaoInstrucaoAtual = 4 + instrucaoInfracoes.length * 2;
    } else {
        telaAtual = 0;
        exame.classList.remove("invisible");
        resultadoParcial.classList.add("invisible");

        checarInfracoesCometidas();
        pegarProximaInstrucao();
    }

    if (!mutado)
        tocarSom("../media/sino.mp3");
}

// Atualiza a barra de porcentagem
function AtualizarPorcentagem() {
    if (porcentagem < 100) {
        porcentagem += 100/duracaoInstrucaoAtual;
    } else {
        porcentagem = 0;
        atualizarTela();
    }

    const barra = document.getElementById("progress-bar__inner");
    barra.style.width = porcentagem + "%";
    timer = setTimeout(AtualizarPorcentagem, 1000);
}

// Espera 2 segundos para inicializar
adicionarEventosNosBotoes();