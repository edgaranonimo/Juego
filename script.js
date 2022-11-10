window.addEventListener("load", function(){

    const canvas = document.getElementById("canvas-1");
    const ctx =  canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 500;
    //Aquí manejamos los eventos de las teclas
    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener("keydown", e => {
                if((    (e.key === "ArrowUp") || (e.key === "ArrowDown")
                    ) && (this.game.keys.indexOf(e.key)  === -1)){
                    this.game.keys.push(e.key);
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                }else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });

            window.addEventListener("keyup", e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });

        }
    }
    //Aquí manejamos lo que tiene que ver con el dibujo del proyectil
    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10; 
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        //Método que se llama para realizar los cambios
        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) {
                this.markedForDeletion = true;
            }
        }
        //Método que se llama para dibujar los cambios
        draw(context){
            context.fillStyle = "yellow";
            context.fillRect(this.x, this.y, this.width, this.height);
        }

        
    }
    //Aquí tenemos todo lo que tiene que ver con nuestro caballito de mar
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.speedY = 0.5;
            this.maxSpeed = 1;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.maxFrame= 37;
        }
        //Método que se llama para realizar los cambios
            //Se repara bug en el que el jugador se sale de los parámetros
        update(){
            this.y += this.speedY;
            if (this.game.keys.includes("ArrowUp") && this.y>=-3.5) {
                this.speedY = -1;
            } else if(this.game.keys.includes("ArrowDown") && this.y<=310.5) {
                this.speedY = 1;
            } else {
                this.speedY = 0;
            }

            this.y += this.speedY;
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile =>!projectile.markedForDeletion);
            if(this.frameX< this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }

        }
        //Método que se llama para dibujar los cambios
        draw(context){
            if(this.game.debug)context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image,
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y, 
                                this.width, this.height
                                );
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            
        }
        //Método para sacar los proyectiles
        shootTop(){
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x+80, this.y+30));
                this.game.ammo--;
            }

        }

    }
    //Aquí tenemos todo lo que tiene que ver con los enemigos
    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random()*-1.5-0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        //Método que se llama para realizar los cambios
        update(){
            this.x += this.speedX;
            if(this.x + this.width < 0){
                this.markedForDeletion = true;
            }
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }
        }
        //Método que se llama para dibujar los cambios
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, 
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y,
                                this.width, this.height
                                );
            context.font = "20px Helvetica";
            context.fillText(this.lives, this.x, this.y);
        }
    }
    //Aquí tenemos todo lo que tiene que ver con la aparición de los enemigos
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random()*(this.game.height*0.9-this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random()*3);

        }
    }
    //Aquí tenemos todo lo que tiene que ver con el escenario
    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        //Método que se llama para actualizar los cambios
        update(){
            if(this.x <= -this.width)this.x = 0;
            else this.x -= this.game.speed*this.speedModifier;
        }
        //Método que se llama para dibujar los cambios
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    //Aquí tenemos todo lo que tiene que ver con los elementos del escenario
    class BackGround{
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById("layer1");
            this.image2 = document.getElementById("layer2");
            this.image3 = document.getElementById("layer3");
            this.image4 = document.getElementById("layer4");
            
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1.2);
            this.layer4 = new Layer(this.game, this.image4, 1.7);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        //Método que se llama para actualizar los cambios
        update(){
            this.layers.forEach(layer=>layer.update());
        }
        //Método que se llama para dibujar los cambios
        draw(context){
            this.layers.forEach(layer=>layer.draw(context));
        }

    }
    //Aquí tenemos todo lo relacionado con las impresiones y resultados de la jugabilidad
    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Helvetica";
            this.color = "white";
        }
        //Método que se llama para dibujar los cambios
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillText("Score " + this.game.score, 20, 40);
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5*i,50,3,20);
            }
            const formattedTime = (this.game.gameTime*0.001).toFixed(1);
            console.log(formattedTime);
            //si queda menos de 5 segundos se pone en rojo el contador y se queda así para que salga you lose en rojo
            if (this.game.gameTime < 5000) {
                    context.fillStyle='red';
            }
            context.fillText("Timer: " + formattedTime, 20, 100);
            if (this.game.gameOver) {
                context.textAlign = "center";
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    //El texto se pone en verde cuando se gana
                    context.fillStyle='green';
                    message1 = "You win";
                    message2 = "Well done";
                } else {
                    message1 = "You lose";
                    message2 = "Try again! :(";
                }
                context.font = "50px " + this.fontFamily;
                context.fillText(   message1, 
                                    this.game.width*0.5, 
                                    this.game.height*0.5-20);
                context.font = "25px " + this.fontFamily;
                context.fillText(   message2,
                                    this.game.width*0.5,
                                    this.game.height*0.5+20);
            }
            
            context.restore();
        }
    }
    //Aquí tenemos todo lo relacionado con la jugabilidad
    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.backGround = new BackGround(this);
            this.keys = [];
            //Se modifíca la munición máxima
            this.ammo = 35;
            this.ammoTimer = 0;
            //Se modifica la velocidad para reaparición de la munición
            this.ammoInterval = 300;
            //Se modifica la cantidad total de munición
            this.maxAmmo = 92;
            this.enemies = [];
            this.enemiesTimer = 0;
            //se modifica la velocidad de aparición de los enemigos
            this.enemiesInterval = 800;
            this.gameOver = false;
            this.score = 0;
            //se modifica el score necesario para ganar
            this.winningScore = 100;
            //se modifica el tiempo total de juego
            this.gameTime = 50000;
            this.timeLimit = 0.5;
            this.speed = 1;
            this.debug = false;
        }
        //Método que se llama para actualizar los cambios
        update(deltaTime){
            //Se modifica para que cuente al revés
            if (!this.gameOver) this.gameTime -= deltaTime;
            if (this.gameTime < this.timeLimit) this.gameOver = true;
            this.backGround.update();
            this.backGround.layer4.update();
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) {
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            } else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy =>{
                enemy.update();
                if (this.checkCollition(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile =>{
                    if (this.checkCollition(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true; 
                            if(!this.gameOver)this.score += enemy.score;
                            if (this.score > this.winningScore)  {
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });

            this.enemies = this.enemies.filter(enemy=>!enemy.markedForDeletion);

            if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) {
                this.addEnemy();
                this.enemiesTimer = 0;
            } else {
                this.enemiesTimer += deltaTime;
            }

        }
        //Método que se llama para dibujar los cambios
        draw(context){
            this.backGround.draw(context);
            this.player.draw(context);
            this.ui.draw(context);

            this.enemies.forEach(enemy =>{
                enemy.draw(context);
            });
            this.backGround.layer4.draw(context);
        }
        //Método que se llama para agregar enemigos
        addEnemy(){
            this.enemies.push(new Angler1(this));
        }
        //Método para dibujar los rectangulos
        checkCollition(rect1, rect2){
            return(     rect1.x < rect2.x + rect2.width
                        && rect1.x + rect1.width > rect2.x
                        && rect1.y < rect2.y + rect2.height
                        && rect1.height + rect1.y > rect2.y
                );
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //Algunas animaciones e impresiones de las mismas
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});