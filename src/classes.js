class Instrucao {
    texto = "";
    infracoes = [];

    constructor(texto, infracoes) {
        this.texto = texto;
        this.infracoes = infracoes;
    }
}

class Infracao {
    texto = "";
    pontos = 0;
    cometida = false;

    constructor(texto, pontos) {
        this.texto = texto;
        this.pontos = pontos;
    }

    Cometer() {
        this.cometida = true;
    }

    Descometer() {
        this.cometida = false;
    }
}