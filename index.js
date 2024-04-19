const { createApp } = Vue;

createApp({
    data() {
        return {
            heroi: {vida: 100, porcentagemDeDefesa: 0, chancesDeTentarCorrer: 3, quantidadeDePocoesDisponiveis: 10},
            vilao: {vida: 100, porcentagemDeDefesa: 0, quantidadeDePocoesDisponiveis: 20},
            atacarDesabilitado: false,
            defenderDesabilitado: false,
            usarPocaoDesabilitado: true,
            correrDesabilitado: false
        }
    },
    methods: {
        atacar(isHeroi) {
            let danoCausado
            let porcentagemDeDefesa
            
            if (isHeroi) {
                danoCausado = 10
                porcentagemDeDefesa = this.vilao.porcentagemDeDefesa
                danoCausado = this.calcularDanoCausado(danoCausado, porcentagemDeDefesa)
                
                this.vilao.vida -= danoCausado
                
                this.adicionarMensagemNoEventLog(`Você atacou o vilão e causou ${danoCausado} de dano.`)

                if (porcentagemDeDefesa !== 0) {
                    this.vilao.porcentagemDeDefesa = 0
                }

                if (this.vilao.vida <= 0) {
                    this.mudarTurno('Vilão')
                    alert('O vilão foi morto. Parabéns, você venceu o jogo!')
                    this.reset()
                } else {
                    this.acaoVilao()
                }
            } else {
                danoCausado = 20
                porcentagemDeDefesa = this.heroi.porcentagemDeDefesa
                danoCausado = this.calcularDanoCausado(danoCausado, porcentagemDeDefesa)
                
                this.heroi.vida -= danoCausado
                
                this.adicionarMensagemNoEventLog(`O vilão atacou você e causou ${danoCausado} de dano.`)
                
                this.usarPocaoDesabilitado = this.heroi.vida > 90 || this.heroi.quantidadeDePocoesDisponiveis === 0;
                
                if (porcentagemDeDefesa !== 0) {
                    this.heroi.porcentagemDeDefesa = 0
                }

                if (this.heroi.vida <= 0) {
                    this.mudarTurno('Herói')
                    alert('Você foi morto. Fim de jogo!')
                    this.reset()
                }
            }
        },
        defender(isHeroi) {
            let porcentagemDeDefesa = Math.round((Math.random() * (1 - Number.EPSILON)) * 100)
            
            if (isHeroi) {
                this.heroi.porcentagemDeDefesa = porcentagemDeDefesa
                this.adicionarMensagemNoEventLog(`Você recebeu ${porcentagemDeDefesa}% de defesa.`)
                this.defenderDesabilitado = true
                this.acaoVilao()
            } else {
                this.vilao.porcentagemDeDefesa = porcentagemDeDefesa
                this.adicionarMensagemNoEventLog(`O vilão recebeu ${porcentagemDeDefesa}% de defesa.`)
            }
        },
        usarPocao(isHeroi) {
            if (isHeroi) {
                this.heroi.vida += 10
                this.heroi.quantidadeDePocoesDisponiveis--
                
                this.usarPocaoDesabilitado = this.heroi.vida > 90;
                
                if (this.heroi.quantidadeDePocoesDisponiveis === 0) {
                    this.usarPocaoDesabilitado = true
                }
                
                this.adicionarMensagemNoEventLog('Você usou poção e recuperou 10 de vida.')
                this.acaoVilao()
            } else {
                this.vilao.vida += 20
                this.vilao.quantidadeDePocoesDisponiveis--
                this.adicionarMensagemNoEventLog('O vilão usou poção e recuperou 20 de vida.')
            }
        },
        correr(isHeroi) {
            let porcentagemDeChanceDeCorrer = Math.random()

            if (isHeroi) {
                if (porcentagemDeChanceDeCorrer <= 0.3) {
                    alert(`Você correu da batalha e o jogo acabou.`)
                    this.reset();
                } else {
                    this.heroi.chancesDeTentarCorrer--
                    this.adicionarMensagemNoEventLog('Você tentou correr e não conseguiu.')
                    alert(`Você não conseguiu correr e o jogo continuará.`)
                    
                    if (this.heroi.chancesDeTentarCorrer === 0) {
                        this.correrDesabilitado = true
                        this.adicionarMensagemNoEventLog('Você gastou todas as suas chances de correr.')
                    }
                    
                    this.acaoVilao('Vilão')
                }
            } else {
                if (porcentagemDeChanceDeCorrer <= 0.4) {
                    alert(`O vilão correu da batalha e o jogo acabou.`)
                    this.reset()
                } else {
                    this.adicionarMensagemNoEventLog('O vilão tentou correr e não conseguiu.')
                }
            }
        },
        acaoVilao() {
            this.mudarTurno('Vilão');

            setTimeout(() => {
                const acoes = ['atacar', 'defender', 'usarPocao', 'correr'];

                if (this.vilao.porcentagemDeDefesa !== 0) {
                    acoes.splice(1,1)
                }

                if (this.vilao.vida > 80) {
                    if (this.vilao.porcentagemDeDefesa === 0) {
                        acoes.splice(2, 1)
                    } else {
                        acoes.splice(1,1)
                    }
                }

                let chances = [];
                if (acoes.length === 4) {
                    chances = [40, 40, 15, 5];
                } else if (acoes.length === 3 && acoes.includes('usarPocao')) {
                    chances = [47, 47, 6];
                } else if (acoes.length === 3 && !acoes.includes('usarPocao')) {
                    chances = [48, 48, 4];
                } else if (acoes.length === 2 && acoes.includes('usarPocao')) {
                    chances = [95, 5];
                } else if (acoes.length === 2 && !acoes.includes('usarPocao')) {
                    chances = [48, 52];
                }

                let totalChances = chances.reduce((acc, curr) => acc + curr, 0);
                let randomChance = Math.random() * totalChances;
                let cumulativeChance = 0;
                let selectedActionIndex = -1;

                for (let i = 0; i < chances.length; i++) {
                    cumulativeChance += chances[i];
                    if (randomChance < cumulativeChance) {
                        selectedActionIndex = i;
                        break;
                    }
                }

                let selectedAction = acoes[selectedActionIndex];
                this[selectedAction](false);

                this.mudarTurno('Herói');
            }, 5000);
        },
        reset() {
            this.heroi.vida = 100
            this.heroi.porcentagemDeDefesa = 0
            this.heroi.chancesDeTentarCorrer = 3
            this.heroi.quantidadeDePocoesDisponiveis = 10
            this.vilao.vida = 100
            this.vilao.porcentagemDeDefesa = 0
            this.vilao.quantidadeDePocoesDisponiveis = 20
            this.limparEventLog()
            this.desabilitarBotoesDoHeroi(false)
            this.usarPocaoDesabilitado = true
        },
        adicionarMensagemNoEventLog(mensagem) {
            let outputDiv = document.getElementById("output")

            let quebraDeLinha = document.createElement("br")
            outputDiv.appendChild(quebraDeLinha);

            let novaMensagem = document.createElement("div")
            novaMensagem.textContent = mensagem;
            outputDiv.appendChild(novaMensagem);

           outputDiv.scrollTop = outputDiv.scrollHeight
        },
        limparEventLog() {
            let outputDiv = document.getElementById("output")
            outputDiv.textContent = ''
        },
        desabilitarBotoesDoHeroi(bit) {
            this.atacarDesabilitado = bit

            this.usarPocaoDesabilitado = this.heroi.quantidadeDePocoesDisponiveis === 0 || this.heroi.vida > 90 || bit

            if (this.heroi.porcentagemDeDefesa === 0) {
                this.defenderDesabilitado = bit
            }
            
            if (this.heroi.chancesDeTentarCorrer !== 0) {
                this.correrDesabilitado = bit
            }
        },
        mudarTurno(personagem) {
            let outputDiv = document.querySelector(".turno")
            outputDiv.textContent = `Turno: ${personagem}`

            let desabilitarBotoesDoHeroi = false
            if (personagem === 'Vilão') {
                desabilitarBotoesDoHeroi = true;
                this.usarPocaoDesabilitado = true
            }

            this.desabilitarBotoesDoHeroi(desabilitarBotoesDoHeroi)
        },
        calcularDanoCausado(danoPadraoDoPersonagemQueEstaAtacando, porcentagemDeDefesaDeQuemVaiSofrerOAtaque) {
            return (danoPadraoDoPersonagemQueEstaAtacando *= (1 - porcentagemDeDefesaDeQuemVaiSofrerOAtaque / 100)).toFixed(2)
        }
    }
}).mount("#app");