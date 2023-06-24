class Wumpus {

    constructor() {
        this.worldData = new Array(4);
        this.worldVisited = new Array(4);
        this.topPlayers = new Array(10);

        this.steps = [];

        this.Moves = {
            Right: 1,
            Left: 2,
            Up: 3,
            Down: 4
        };

        this.shootDirection = this.Moves.Right;
        this.totalMoves = 0;
        this.randomMoves = 0;
        this.goldFound = false;
        this.point = 0;
        this.gameOver = false;
        this.extraLife = false;
        this.isPlayerNameSet = false;
        this.playerName="";
        this.fechaActual = "";
        this.horaActual = "";
        this.setInitialNumberOfMoves();
        this.tiempoTranscurrido = "";
        this.IAmDead = false;
    }


    setInitialNumberOfMoves() {    
        this.numberOfMoves = 100;
    }


    setExtraLifeNumberOfMoves() {
        this.numberOfMoves = 50;
    }


    reStart() {
        this.IAmDead=false;
        this.tiempoInicial = new Date().getTime();        
        // Initialize world data
        for (var x = 1; x <= 4; x++) {
            this.worldData[x] = new Array(4);
            this.worldVisited[x] = new Array(4);

            for (var y = 1; y <= 4; y++) {
                this.worldData[x][y] = new Cell(x, y);
                this.worldVisited[x][y] = new CellVisited(x, y);
            }
        }

        // Initialize pits
        var countPit = 0;
        while (countPit < 2) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit)
                continue;

            this.worldData[x][y].setPit();
            if (y > 1) this.worldData[x][y - 1].setBreeze();
            if (y < 4) this.worldData[x][y + 1].setBreeze();
            if (x > 1) this.worldData[x - 1][y].setBreeze();
            if (x < 4) this.worldData[x + 1][y].setBreeze();
            countPit++;
        }

        // Initialize wumpus
        while (true) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit)
                continue;

            this.worldData[x][y].setWumpus();
            // Set stench near of wumpus
            if (y > 1) this.worldData[x][y - 1].setStench();
            if (y < 4) this.worldData[x][y + 1].setStench();
            if (x > 1) this.worldData[x - 1][y].setStench();
            if (x < 4) this.worldData[x + 1][y].setStench();
            break;
        }

        // Initialize gold
        while (true) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit || this.worldData[x][y].isWumpus)
                continue;

            this.worldData[x][y].setGold();
            break;
        }

        this.x = 1;
        this.y = 1;
        this.worldData[1][1].setPlayer();

        isWumpusDead = false;
        isShooting = false;

        this.drawCell();
    }

    move() {
        console.log("Wumpus esta muerto? "+isWumpusDead);

        this.CalcBreezeAndStench();

        if (this.worldData[this.x][this.y].isGold) {
            this.goldFound = true;
            this.point += 1000;
            this.worldData[this.x][this.y].isGold = false;
            $('#goldObtained').text('Haz encontrado el oro!!');

        } else if (this.worldData[this.x][this.y].isWumpus && !isWumpusDead) {
            this.KillArrowMan();
        } else if (this.worldData[this.x][this.y].isPit) {
            this.KillArrowMan();
        } else if (this.numberOfMoves < 2) {
            console.log("Moriste porque ya no habian movimientos");
            this.KillArrowMan();            

            // Are we near of wumpus?
        } else if (!isWumpusDead && this.areWeNearOfWumpus()) {
            console.log("Shoot");
            isShooting = true;
            isWumpusDead = true;
            return this.shootDirection;

            // Are we in pit loop?
        } else if (this.areWeInPitLoop()) {
            console.log("pit loop");
            if (this.x != 4 && this.worldVisited[this.x + 1][this.y].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Right;
            } else if (this.y != 4 && this.worldVisited[this.x][this.y + 1].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Top;
            } else if (this.x != 1 && this.worldVisited[this.x - 1][this.y].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Left;
            } else if (this.y != 1 && this.worldVisited[this.x][this.y - 1].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Bottom;
            }
        } else if (this.areWeInDangerSpace()) {
            console.log("danger space");
            // if left is safe, move there
            if (this.x != 1 && this.worldData[this.x - 1][this.y].isVisited) {
                this.worldVisited[this.x - 1][this.y].visitedNum++;
                return this.Moves.Left;
            }
            // if down is safe, move there
            else if (this.y != 1 && this.worldData[this.x][this.y - 1].isVisited) {
                this.worldVisited[this.x][this.y - 1].visitedNum++;
                return this.Moves.Down;
            }
            // if right is safe, move there
            else if (this.x != 4 && this.worldData[this.x + 1][this.y].isVisited) {
                this.worldVisited[this.x + 1][this.y].visitedNum++;
                return this.Moves.Right;
            }
            // if up is safe, move there
            else if (this.y != 4 && this.worldData[this.x][this.y + 1].isVisited) {
                this.worldVisited[this.x][this.y + 1].visitedNum++;
                return this.Moves.Up;
            }
        } else if (this.areWeInFreeSpace) {
            console.log("free space");
            // if right is not visited, move there
            if (this.x != 4 && !this.worldData[this.x + 1][this.y].isVisited) {
                this.worldVisited[this.x + 1][this.y].visitedNum++;
                return this.Moves.Right;
            }
            // if up is not visited, move there
            else if (this.y != 4 && !this.worldData[this.x][this.y + 1].isVisited) {
                this.worldVisited[this.x][this.y + 1].visitedNum++;
                return this.Moves.Up;
            }
            // if left is not visited, move there
            else if (this.x != 1 && !this.worldData[this.x - 1][this.y].isVisited) {
                this.worldVisited[this.x - 1][this.y].visitedNum++;
                return this.Moves.Left;
            }
            // if down is not visited, move there
            else if (this.y != 1 && !this.worldData[this.x][this.y - 1].isVisited) {
                this.worldVisited[this.x][this.y - 1].visitedNum++;
                return this.Moves.Down;
            }
            // if all neighbor have been visited, choose random direction
            else {
                console.log("free neighbor");
                while (true) {
                    switch (this.rand(1, 4)) {
                        //if selected, move right
                        case 1:
                            if (this.x != 4) {
                                this.worldVisited[this.x + 1][this.y].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Right;
                            }
                            break;
                        //if selected, move up
                        case 2:
                            if (this.y != 4) {
                                this.worldVisited[this.x][this.y + 1].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Up;
                            }
                            break;
                        //if selected, move left
                        case 3:
                            if (this.x != 1) {
                                this.worldVisited[this.x - 1][this.y].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Left;
                            }
                            break;
                        //if selected, move down
                        case 4:
                            if (this.y != 1) {
                                this.worldVisited[this.x][this.y - 1].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Down;
                            }
                            break;
                    }
                }
            }
        }
    }

    areWeNearOfWumpus() {
        // Is wumpus up? Shoot
        if (this.y != 4 && this.worldVisited[this.x][this.y + 1].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Up;
            return true;
        }
        // Is wumpus right? Shoot
        else if (this.x != 4 && this.worldVisited[this.x + 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Right;
            return true;
        }
        // Is wumpus left? Shoot
        else if (this.x != 1 && this.worldVisited[this.x - 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Left;
            return true;
        }
        // Is wumpus down? Shoot
        else if (this.y != 1 && this.worldVisited[this.x][this.y - 1].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Down;
            return true;
        }

        return false;
    }

    areWeInPitLoop() {
        if (this.randomMoves > 0 && this.worldVisited[this.x][this.y].totalMoves > 1 && this.worldData[this.x][this.y].isBreeze)
            return true;
        else
            return false;
    }

    areWeInDangerSpace() {
        console.log(this.x + " 1 " + this.y);
        if (this.worldData[this.x][this.y].isBreeze || (this.worldData[this.x][this.y].isStench && !isWumpusDead))
            return true;
        else
            return false;
    }

    areWeInFreeSpace() {
        if ((!this.worldData[this.x][this.y].isBreeze && !this.worldData[this.x][this.y].isStench) || (!this.worldData[this.x][this.y].isBreeze && this.isWumpusDead ))
            return true;
        else
            return false;
    }

    CalcBreezeAndStench() {
        //if spaces neighbors have not already been calculated
        if (!this.worldVisited[this.x][this.y].nearDanger) {
            //if current space has a breeze, calculate odds of pit
            if (this.worldData[this.x][this.y].isBreeze) {
                this.PitWumpusPercentage(true, false);
            }

            //if current space has a stench, calculate odds of wumpus
            if (this.worldData[this.x][this.y].isStench && !isWumpusDead) {
                this.PitWumpusPercentage(false, true);
            }
        }
    }

    PitWumpusPercentage(pit, wumpus) {
        //if up not visited, add 30% chance
        if (this.y != 1 && !this.worldData[this.x][this.y - 1].isVisited) {
            if (pit)
                this.worldVisited[this.x][this.y - 1].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x][this.y - 1].wumpusChance += 30;
        }

        //if up not visited, add 30% chance
        if (this.x != 4 && !this.worldData[this.x + 1][this.y].isVisited) {
            if (pit)
                this.worldVisited[this.x + 1][this.y].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x + 1][this.y].wumpusChance += 30;
        }

        //if up not visited, add 30% chance
        if (this.x != 1 && !this.worldData[this.x - 1][this.y].isVisited) {
            if (pit)
                this.worldVisited[this.x - 1][this.y].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x - 1][this.y].wumpusChance += 30;
        }

        //if up not visited, add 30% chance
        if (this.y != 4 && !this.worldData[this.x][this.y + 1].isVisited) {
            if (pit)
                this.worldVisited[this.x][this.y + 1].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x][this.y + 1].wumpusChance += 30;
        }

        this.worldVisited[this.x][this.y].nearDanger = true;
    }

    calcTime() {
        const tiempoActual = new Date().getTime();
        this.tiempoTranscurrido = (tiempoActual - this.tiempoInicial) / 1000;
        //const mensajeCronometro = `Han transcurrido ${this.tiempoTranscurrido} segundos desde el momento en que comenzó el proceso.`;
        const mensajeCronometro = `Tiempo transcurrido ${this.tiempoTranscurrido} segundos.`;
        console.log(mensajeCronometro);
        $('#cronometro').text(mensajeCronometro);        
    }

    handMove(direction) {
        //Disminuir la cantidad de movimientos
        this.numberOfMoves -= 1;
        //Calcula el tiempo transcurrido
        this.calcTime();


        if (isShooting) {
            this.setGameOver(true);
        } else
            switch (direction) {
                case this.Moves.Up:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.y++;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Right:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.x++;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Down:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.y--;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Left:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.x--;
                    this.worldData[this.x][this.y].setPlayer();
                    break;
            }

        this.point -= 1;
        this.drawCell();
    }

    drawCell() {
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 4; j++) {
                var cell = this.worldData[i][j];

                var img = "";
                if (cell.isPlayer && isShooting) {
                    img = "player-armed.png";
                    isShooting = false;
                } else if (cell.isPlayer) {
                    if(!this.extraLife)
                        img = "player.png";
                    else
                        img = "playerExtraLife.png";

                } else if (cell.isPit && cell.isBreeze && cell.isVisited)
                    img = "pit.png";
                else if (cell.isPit && cell.isVisited)
                    img = "pit.png";
                else if (cell.isStench && cell.isBreeze && cell.isGold && cell.isVisited)
                    img = "gold.png";
                else if (cell.isStench && cell.isBreeze && cell.isVisited)
                    img = "breeze-stench.png";
                else if (cell.isWumpus && cell.isBreeze && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus && cell.isBreeze && cell.isVisited)
                    img = "wumpus.png"; 
                else if (cell.isWumpus && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus && cell.isVisited)
                    img = "wumpus.png";
                else if (cell.isGold && cell.isVisited)
                    img = "gold.png";
                else if (cell.isBreeze && cell.isVisited)
                    img = "breeze.png";
                else if (cell.isStench && cell.isVisited)
                    img = "stench.png";
                else
                    img = "";

                $(".pboard .cell" + cell.x + "" + cell.y).css("background", "url(files/img/" + img + ") no-repeat #000000");


               
                if (cell.isPlayer)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background", "url(files/img/player.png) no-repeat #d0d0d0");

                if (cell.isVisited)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background-color", "#d0d0d0");
            }
        }

        $('#points').text('Points: ' + this.point);
        $('#numberOfMoves').text('Moves: ' + this.numberOfMoves);
    }

    rand(min, max) {
        if (min == max)
            return min;

        var date = new Date();
        var count = date.getMilliseconds() % 10;

        for (var i = 0; i <= count; ++i)
            Math.random();

        if (min > max) {
            min ^= max;
            max ^= min;
            min ^= max;
        }

        return Math.floor((Math.random() * (max - min + 1)) + min);
    }


    KillArrowMan() {
        this.point -= 10000;
        if(!this.extraLife) {
            console.log("Using extra-life");
            this.extraLife = true;
            this.setExtraLifeNumberOfMoves();
        } else {
            this.setGameOver();
        }
    }


    setPlayerName(playerName) {
        this.playerName=playerName

        // Obtener la fecha y hora actual
        const fechaHoraActual = new Date();

        // Obtener la fecha actual
        this.fechaActual = fechaHoraActual.toLocaleDateString();

        // Obtener la hora actual
        this.horaActual = fechaHoraActual.toLocaleTimeString();

        // Mostrar la fecha y hora actual en consola
        console.log("Nombre del jugador:", this.playerName);
        console.log("Fecha actual:", this.fechaActual);
        console.log("Hora actual:", this.horaActual);

    }        


    setGameOver(winTheGame) {
        this.gameOver = true;
        if (winTheGame) {
            $('#status').text('Wumpus esta muerto! Tu ganaste!');
        }else {
            console.log("Tu perdiste! Estas muerto!");
        }
        this.getFinalTime();
    }


    getFinalTime() {

        // Mostrar la fecha y hora actual en consola
        console.log("Nombre del jugador:", this.playerName);
        console.log("Fecha actual:", this.fechaActual);
        console.log("Hora actual:", this.horaActual);
        console.log("Tiempo transcurrido:", this.tiempoTranscurrido);

    }    



    setInitialTable( objectTable ) {
        sessionStorage.setItem("playersRanking", objectTable);
    }    



    saveData() {


        // Datos a guardar en el archivo JSON
        let dataPlayer = {
            nombre: this.playerName,
            fecha: this.fechaActual,
            hora: this.horaActual, 
            tiempoTranscurrido: this.tiempoTranscurrido
        };
        
        // Convertir el objeto JavaScript en formato JSON
        let dataPlayerJSON = JSON.stringify(dataPlayer);


        //this.topPlayers

        
        // Almacenar la cadena JSON en localStorage
        //localStorage.setItem("dataPlayer", dataPlayerJSON);
        sessionStorage.setItem("dataPlayer", dataPlayerJSON);

/*
        const tabla = sessionStorage.getItem("playersRanking");

        const fila = document.createElement('tr');
        const celdaNombre = document.createElement('td');
        const celdaFecha = document.createElement('td');
        const celdaHora = document.createElement('td');
        const celdaTiempoTranscurrrido = document.createElement('td');

        celdaNombre.textContent = dataPlayerJSON.nombre;
        celdaFecha.textContent = dataPlayerJSON.fecha;
        celdaHora.textContent = dataPlayerJSON.hora;
        celdaTiempoTranscurrrido.textContent = dataPlayerJSON.tiempoTranscurrido;            

        fila.appendChild(celdaNombre);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaHora);
        fila.appendChild(celdaTiempoTranscurrrido);            

        tabla.appendChild(fila);

        sessionStorage.setItem("playersRanking", tabla);
*/

    }    

}