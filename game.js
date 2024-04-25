import React, { Component, useRef, useEffect} from 'react';
import { StyleSheet, Text, View,Dimensions} from 'react-native';
import Canvas from 'react-native-canvas';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
console.log(windowHeight,windowWidth);

                //const ctx = c.getContext('2d');
                var WIDTH = 200;
                var HEIGHT = 200;
               // ctx.canvas.width = WIDTH;
                //ctx.canvas.height = HEIGHT;
                var mouseX = 0;
                var mouseY = 0;

                var zoom = 0.01;

                const STARTINGSIZE = 20;
                const MAXFOODSIZE = 10;
                const MAPSIZE = 2000;
                const decayRate = 1;
                const FEEDFACTOR = 2;
                const PROJECTILESPEED = 20;
                var FIRESPEED = 2
                const MAXBULLETS = 1000;
                const MAXFOOD = 1000;

                var draw = true;
                var stats = true;

                //debug
                var LINE_DEBUG = false;

                var time = Date.now();
                var deltaTime = 0;
                var oldTime = time;
                var elapsedTime = 0;
                var oldDirection = 0;
                var fireTime = 0;

                var fps = 60; //uncapped

                var currentFps = 0;
                var fpsCounter = 0;
                var fpsTimer = 0;

               // document.onkeydown = checkKey;

                function checkKey(e) {

                    e = e || window.event;

                    if (e.keyCode == '38') {
                        zoom+=zoom/70;
                    }
                    else if (e.keyCode == '40') {
                        if(zoom>0.01) {
                       zoom-=zoom/70;
                        }
                    }

                }

                var clicking = false;
                function ClickDown() {
                    clicking = true;
                }

                function ClickUp() {
                    clicking = false;
                }

                class ConvertTo {
                    static Deg(rad) {
                        return rad * (180 / Math.PI);
                    }
                    static Rad(deg) {
                        return deg * (Math.PI / 180);
                    }
                    static X(screenX) {
                        return screenX + player.X - WIDTH / 2;
                    }
                    static Y(screenY) {
                        return screenY + player.Y - HEIGHT / 2;
                    }
                    static ScreenX(x) {
                        return x * zoom - player.X * zoom + WIDTH / 2;
                    }
                    static ScreenY(y) {
                        return y * zoom - player.Y * zoom + HEIGHT / 2;
                    }
                }

                function getPosition(e) {
                    let rect = c.getBoundingClientRect();
                    mouseX = e.pageX - rect.left;
                    mouseY = e.pageY - rect.top;
                }

                function Clear(ctx) {
                 ctx.fillStyle = 'white';
                 ctx.fillRect(0, 0, WIDTH, HEIGHT);
                }
                class Food {
                    constructor(maxFood = 2000, mapSize, maxFoodSize = 5, minFoodSize = 1) {
                        this.food = []; // vector [x,y,size  x,y,size];
                        this.mapSize = mapSize;
                        this.MaxFoodSize = maxFoodSize;
                        this.minFoodSize = minFoodSize;
                        this.maxFood = maxFood;
                    }
                    Generate() {
                        if (this.food.length < this.maxFood * 3) {
                            this.food.push((Math.random() * this.mapSize + 1) * (Math.random() < 0.5 ? -1 : 1));
                            this.food.push((Math.random() * this.mapSize + 1) * (Math.random() < 0.5 ? -1 : 1));
                            this.food.push(this.minFoodSize + Math.floor(Math.random() * this.MaxFoodSize + 1));
                        }
                    }
                    Draw(ctx) {
                        for (let i = 0; i < this.food.length; i += 3) {
                            Draw.Circle(this.food[i], this.food[i + 1], this.food[i + 2] * zoom, "yellow",ctx);
                          //  console.log(this.food[i], this.food[i+1]);
                        }
                    }
                    Delete(adresses) {
                        for(let i of adresses) {
                            delete this.food[i];
                            delete this.food[i+1];
                            delete this.food[i+2];
                        }
                        this.food = this.food.filter(x => x !== undefined);
                       
                    }
                    CheckCollide(player) {
                        for (let i = 0; i < this.food.length; i += 3) {
                            //console.log([this.food[i],this.food[i+1]], player.tip, player.left, player.right);
                            if(Collision.Triangle([this.food[i],this.food[i+1]], player.tip, player.left, player.right)) {
                                    player.trueSize += this.food[i + 2] * FEEDFACTOR;
                                    this.Delete([i]);
                            }
                        }

                    }
                }
                class Collision {
                    static Triangle(point, v1,v2,v3) {
                        let d1 = Collision.Sign(point, v1, v2);
                        let d2 = Collision.Sign(point, v2, v3);
                        let d3 = Collision.Sign(point, v3, v1);

                        return!((d1<0 || d2<0 || d3<0) && (d1>0 || d2>0 || d3>0));
                    }
                    static Sign(p1,p2,p3) {
                        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
                    }
                    static TriangleInCircle(point, radius, v1,v2,v3) {
                        let carre = radius * radius;

                        let c1x = point[0] - v1[0];
                        let c1y = point[1] - v1[1]; 
                        let c1sqrt = c1x*c1x + c1y*c1y - carre;

                        if(c1sqrt<= 0) {
                            return true;
                        }

                        let c2x = point[0] - v2[0];
                        let c2y = point[1] - v2[1]; 
                        let c2sqr = c2x*c2x + c2y*c2y - carre;

                        if(c2sqr<= 0) {
                            return true;
                        }

                        let c3x = point[0] - v3[0];
                        let c3y = point[1] - v3[1]; 
                        let c3sqr = c3x*c3x + c3y*c3y - carre;

                        if(c3sqr<= 0) {
                            return true;
                            
                        }
                        return false;
                    }
                }


                class Player {

                    constructor(fireRate) {
                        this.fireRate = 60/fireRate;
                        this.X = 30;
                        this.Y = 30;
                        this.tip = [0, 0];
                        this.left = [0,0];
                        this.right = [0,0];
                        zoom = 3/Math.sqrt(this.size);
                    }
                    speed = 300;
                    size = STARTINGSIZE;
                    trueSize = STARTINGSIZE;
                    Move(direction, deltaTime) {
                        let a = 0, b = 0;
                        let mRatio = 0.5//Mouse.Triangulate(direction, this) * deltaTime;
                        let xDist = 0;
                        let yDist = 0;
                        switch (direction) {
                            case 1:
                                a = mouseX - ConvertTo.ScreenX(this.X);
                                b = mouseY - ConvertTo.ScreenY(this.Y);
                                //1er
                                xDist = a * mRatio;
                                yDist = b * mRatio;
                                break;
                            case 2:
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = mouseY - ConvertTo.ScreenY(player.Y);
                                //2e
                                xDist -= a * mRatio;
                                yDist += b * mRatio;
                                break;
                            case 3:
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = ConvertTo.ScreenY(player.Y) - mouseY;
                                //3e
                                xDist -= a * mRatio;
                                yDist -= b * mRatio;
                                break;
                            case 4:
                                a = mouseX - ConvertTo.ScreenX(player.X);
                                b = ConvertTo.ScreenY(player.Y) - mouseY;
                                //4e
                                xDist += a * mRatio;
                                yDist -= b * mRatio;
                                break;

                        }
                        if(Math.abs(player.X + xDist) < MAPSIZE) {
                            player.X += xDist;
                        }
                        if(Math.abs(player.Y + yDist) < MAPSIZE) {
                            player.Y += yDist;
                        }
                    }
                    Decay() {
                        if (player.trueSize > STARTINGSIZE)
                            player.trueSize -= decayRate;
                    }
                    Gain(deltaTime = 0) {
                        if (this.trueSize > this.size + 1 || this.trueSize < this.size - 1) {
                            
                            this.size += (this.trueSize - this.size) * deltaTime;

                          // zoom = 3/Math.sqrt(this.size); 
                        }


                    }
                    Fire(bulletsObj, rad) {
                        bulletsObj.Fire(this.tip[0], this.tip[1], rad -  (3 * Math.PI / 4));
                    }
                    Draw(direction = 1,ctx) {
                        direction = direction || 1;
                        let matrix1, matrix2, matrix3;
                        let center = [2];
                        center = [player.X, player.Y];
                        matrix1 = [player.X - (STARTINGSIZE + player.size), player.Y - (STARTINGSIZE + player.size)];
                        matrix2 = [player.X + (STARTINGSIZE + player.size), player.Y];
                        matrix3 = [player.X, player.Y + (STARTINGSIZE + player.size)];
                        let a1 = [2], b1 = [2], c1 = [2];
                        a1 = Matrix.Center(matrix1, center);
                        b1 = Matrix.Center(matrix2, center);
                        c1 = Matrix.Center(matrix3, center);
                        a1 = Matrix.Rotate(a1, direction);
                        b1 = Matrix.Rotate(b1, direction);
                        c1 = Matrix.Rotate(c1, direction);
                        a1 = Matrix.Translate(a1, center);
                        b1 = Matrix.Translate(b1, center);
                        c1 = Matrix.Translate(c1, center);
                        Draw.Triangle(a1, b1, c1, "blue",ctx);
                        this.tip = a1;
                        this.left = b1;
                        this.right = c1;
                        if(isNaN(this.tip[0])) {
                            console.log(direction,matrix1,matrix2,matrix3);
                        }
                    }
                }

                class Mouse {
                    static Triangulate(direction = 1, player) {
                        let a = 0, b = 0, c = 0;
                        switch (direction) {
                            case 1:
                                a = mouseX - ConvertTo.ScreenX(player.X);
                                b = mouseY - ConvertTo.ScreenY(player.Y);
                                break;
                            case 2:
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = mouseY - ConvertTo.ScreenY(player.Y);
                                break;
                            case 3:
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = ConvertTo.ScreenY(player.Y) - mouseY
                                break;
                            default:
                                a = mouseX - ConvertTo.ScreenX(player.X);
                                b = ConvertTo.ScreenY(player.Y) - mouseY;
                                break;
                        }
                        c = Math.pow(a, 2) + Math.pow(b, 2);
                        c = Math.sqrt(c);
                        return player.speed / c;
                    }
                    static Direction(player, oldDirection = 1) {
                        //1er
                        if (mouseX > ConvertTo.ScreenX(player.X) && mouseY > ConvertTo.ScreenY(player.Y)) {
                            return 1;
                        }
                        //2e
                        if (mouseX < ConvertTo.ScreenX(player.X) && mouseY > ConvertTo.ScreenY(player.Y)) {
                            return 2;
                        }
                        //3e
                        if (mouseX < ConvertTo.ScreenX(player.X) && mouseY < ConvertTo.ScreenY(player.Y)) {
                            return 3;
                        }
                        //4e
                        if (mouseX > ConvertTo.ScreenX(player.X) && mouseY < ConvertTo.ScreenY(player.Y)) {
                            return 4;
                        }
                        return oldDirection;
                    }
                    static Angle(direction) {
                        let a = 0, b = 0, c = 0;
                        switch (direction) {
                            //1er
                            case 1:
                                a = mouseX - ConvertTo.ScreenX(player.X);
                                b = mouseY - ConvertTo.ScreenY(player.Y);
                                return Math.PI / 2 - Mouse.TriangulateAngle(a, b);
                                break;
                            case 2:
                                //2e
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = mouseY - ConvertTo.ScreenY(player.Y);
                                return Math.PI / 2 + Mouse.TriangulateAngle(a, b);
                                break;
                            case 3:
                                //3e
                                a = ConvertTo.ScreenX(player.X) - mouseX;
                                b = ConvertTo.ScreenY(player.Y) - mouseY;
                                return Math.PI + Mouse.TriangulateAngle(b, a);
                                break;
                            default:
                                //4e
                                a = mouseX - ConvertTo.ScreenX(player.X);
                                b = ConvertTo.ScreenY(player.Y) - mouseY;
                                return Math.PI * 2 - Mouse.TriangulateAngle(b, a);
                                break;
                        }
                    }
                    static TriangulateAngle(oposite, adjacent) {
                        let t = 0;
                        t = oposite / adjacent;
                        t = Math.atan(t);
                        return t;
                    }
                }

                class Draw {
                    static Circle(x, y, size, style= "green",ctx) {
                        ctx.beginPath();
                        ctx.arc(ConvertTo.ScreenX(x), ConvertTo.ScreenY(y), size * zoom, 0, Math.PI * 2);
                      ctx.fillStyle = style;
                        ctx.fill();
                        ctx.closePath();
                    }
                    static Triangle(matrix1, matrix2, matrix3, style = "green",ctx) {
                        ctx.beginPath();
                        ctx.moveTo(ConvertTo.ScreenX(matrix1[0]), ConvertTo.ScreenY(matrix1[1]));
                        ctx.lineTo(ConvertTo.ScreenX(matrix2[0]), ConvertTo.ScreenY(matrix2[1]));
                        ctx.lineTo(ConvertTo.ScreenX(matrix3[0]), ConvertTo.ScreenY(matrix3[1]));
                     ctx.fillStyle = style;
                        ctx.fill();
                        ctx.closePath();
                    }
                    static Text(text, x,y, font = "30px Arial", style = "green",ctx) {
                      ctx.fillStyle = style
                        ctx.font = font;
                        ctx.fillText(text, x, y);
                    }
                }
                class Bullet {
                    constructor(maxBullets, speed) {
                        this.maxBullets = maxBullets;
                        this.bullets = []; //vector format [x,y,rad,collisions  x,y,rad,collisions]
                        this.speed = speed;
                    
                        


                    }
                    SetDeleted(i) {
                        this.bullets[i] = undefined;
                        this.bullets[i+1] = undefined;
                        this.bullets[i+2] = undefined;
                        this.bullets[i+3] = undefined;
                    }
                    Reindex() {
                        this.bullets = this.bullets.filter(x => x !== undefined);
                    }
                    RefreshColisions() {
                        let len = this.bullets.length;
                        for(let i=0;i < len -3; i+=4) {
                            this.bullets[i+3] = 1;
                          }
                    }
                    Move(deltaTime) {
                        let length = this.bullets.length
                        if(length/4 > this.maxBullets) {
                            this.bullets.splice(0,(length-this.maxBullets*4));
                            length = this.bullets.length;
                        }
                        for (let i = 0; i < length - 3; i += 4) {
                            let unchanged = true;
                            let xDist = (Math.cos(this.bullets[i + 2]) * deltaTime * this.speed);
                            let yDist = (Math.sin(this.bullets[i + 2]) * deltaTime * this.speed);
                            if(Math.abs(this.bullets[i] + xDist) < MAPSIZE) {
                            this.bullets[i] += xDist;
                            unchanged = false;
                            }
                            if(Math.abs(this.bullets[i+1] + yDist) < MAPSIZE) {
                            this.bullets[i + 1] += yDist;
                            unchanged = false;
                            }
                            if(unchanged) {
                               this.SetDeleted(i);
                            }
                        }
                            this.Reindex();
                    }
                    Draw(ctx) {
                        let length = this.bullets.length
                        for (let i = 0; i < length - 3; i += 4) {
                            Draw.Circle(this.bullets[i], this.bullets[i + 1], 30, "red",ctx);
                        }
                    }
                    Delete(adresses) {
                        for(let i of adresses) {
                            delete this.bullets[i];
                            delete this.bullets[i+1];
                            delete this.bullets[i+2];
                            delete this.bullets[i+3];
                            //console.log(i);
                        }
                        this.bullets = this.bullets.filter(x => x !== undefined);
                        
                    }
                    Fire(x, y, rad) {
                     //   if (this.bullets.length > this.maxBullets * 4) {
                    //        this.Delete([0]);
                    ///    }
                        this.bullets.push(x);
                        this.bullets.push(y);
                        this.bullets.push(rad + (Math.random() < 0.5 ? -1 : 1) * Math.random() * Math.PI/25);  //recoil
                        this.bullets.push(1); //collisions enabled
                    }
                    CheckCollide(ennemyManager) {
                        
                        let ennemiesToRemove = [];
                        for(let iBullet = 0; iBullet < this.bullets.length - 3; iBullet+= 4) {
                            if(this.bullets[iBullet] != undefined && this.bullets[iBullet+3] == 1) {
                            let near = false;

                            let ienemy = 0;
                            for(let enemy of ennemyManager.ennemies) {
                                if(Collision.TriangleInCircle([this.bullets[iBullet],this.bullets[iBullet+1]],30,enemy.tip,enemy.left,enemy.right)) {
                               ennemyManager.Remove(ienemy);
                               this.SetDeleted(iBullet);
                                  
                            }
                            else{
                              //  console.log(Math.sqrt(Math.pow(this.bullets[iBullet] + enemy.tip[0],2) + Math.pow(this.bullets[iBullet+1] + enemy.tip[1],2)));
                                if(Math.sqrt(Math.pow(this.bullets[iBullet] + enemy.tip[0],2) + Math.pow(this.bullets[iBullet+1] + enemy.tip[1],2)) < this.speed * 2) {
                                    near = true;
                                }
                            }
                            ienemy++;
                        }
                        if(!near) {
                            this.bullets[iBullet+3] =0;
                        }
                    }
                    }
                        for(let i of ennemiesToRemove) {
                            ennemyManager.Remove(ennemiesToRemove[i]);
                        }

                     // this.Reindex();
                    }
                }

                class Ennemy {
                    tip = 0;
                    left = 0;
                    right = 0;
                    direction = 0;

                    constructor(x,y,color, speed, fireRate, size,index,manager) {
                        this.x = x;
                        this.y = y;
                        this.color = color;
                        this.speed = speed;
                        this.fireRate = fireRate;
                        this.size = size;
                        this.index = index;
                        this.manager = manager
                        this.route = [(Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1), (Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1)];
                        this.direction = Math.atan2(this.route[1] - this.y,this.route[0] - this.x);
                    }
                    Remove() {
                        manager.Remove(this.index);
                    }
                    Update(deltaTime,ctx) {
                        if(this.x <= this.route[0] + 1 && this.x >= this.route[0] - 1 && this.y <= this.route[1] + 1 && this.y >= this.route[1] - 1) {
                            let rX = (Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1);
                            let rY = (Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1);
                            this.route = [rX,rY]
                            this.direction = Math.atan2(this.route[1] - this.y,this.route[0] - this.x);
                        }

                        let magnitude = Math.sqrt(Math.pow((this.route[0] - this.x),2) + Math.pow((this.route[1] - this.y),2));

                        this.x += (this.route[0] - this.x)/magnitude * deltaTime * this.speed;
                        this.y += (this.route[1] - this.y)/magnitude * deltaTime * this.speed;


                        this.Draw(ctx);


                        if(Collision.Triangle(player.tip, this.tip,this.left,this.right)) {
                            return false;
                        }
                        if(Collision.Triangle(player.left, this.tip,this.left,this.right)) {
                            return false;
                        }
                        if(Collision.Triangle(player.right, this.tip,this.left,this.right)) {
                            return false;
                        }
                        if(Collision.Triangle(this.tip, player.tip,player.right,player.left)) {
                            return false;
                        }
                        if(Collision.Triangle(this.left, player.tip,player.right,player.left)) {
                            return false;
                        }
                        if(Collision.Triangle(this.right, player.tip,player.right,player.left)) {
                            return false;
                        }

                        return true;
                    }
                    Draw(ctx) {
                        let direction = 3;
                        let matrix1, matrix2, matrix3;
                        let center = [2];
                        center = [this.x, this.y];
                        matrix1 = [this.x - (STARTINGSIZE + this.size), this.y - (STARTINGSIZE + this.size)];
                        matrix2 = [this.x + (STARTINGSIZE + this.size),this.y];
                        matrix3 = [this.x, this.y + (STARTINGSIZE + this.size)];
                        let a1 = [2], b1 = [2], c1 = [2];
                        a1 = Matrix.Center(matrix1, center);
                        b1 = Matrix.Center(matrix2, center);
                        c1 = Matrix.Center(matrix3, center);
                        a1 = Matrix.Rotate(a1, this.direction + (3 * Math.PI / 4));
                        b1 = Matrix.Rotate(b1, this.direction + (3 * Math.PI / 4));
                        c1 = Matrix.Rotate(c1, this.direction + (3 * Math.PI / 4));
                        a1 = Matrix.Translate(a1, center);
                        b1 = Matrix.Translate(b1, center);
                        c1 = Matrix.Translate(c1, center);
                        Draw.Triangle(a1, b1, c1, this.color,ctx);
                        this.tip = a1;
                        this.left = b1;
                        this.right = c1;
                    }
                }

                class EnnemyManager {
                    ennemies = [];
                    constructor(maxEnnemies, avgSpeed) {
                        this.maxEnnemies = maxEnnemies;
                        this.avgSpeed = avgSpeed;
                    }
                    Spawn() {
                        if(this.ennemies.length < this.maxEnnemies) {
                        let x = (Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1);
                        let y = (Math.random() * MAPSIZE + 1) * (Math.random() < 0.5 ? -1 : 1);
                        this.ennemies.push(new Ennemy(x,y,"green", this.avgSpeed * 5, 2, 10,ennemies.length,this));
                        }
                    }
                    Update(deltaTime,ctx) {
                        let indexesToRemove = [];
                        for(let i in this.ennemies) {
                            if(!this.ennemies[i].Update(deltaTime,ctx)) {
                                indexesToRemove.push(i);
                            }
                        }
                        for(let index of indexesToRemove) {
                            this.Remove(index);
                        }
                    }
                    Remove(index) {
                        this.ennemies.splice(index,1);
                    }
                }

                class Matrix {
                    static Scale(matrix, factor) {
                        let result = [2];

                        result[0] = matrix[0] * factor;
                        result[1] = matrix[1] * factor;

                        return result;
                    }
                    static Translate(matrix, matrix2) {
                        let result = [2];
                        result[0] = matrix[0] + matrix2[0];
                        result[1] = matrix[1] + matrix2[1];
                        return result;
                    }
                    static Rotate(matrix, rad) {
                        let result = [2];

                        result[0] = Math.cos(rad) * matrix[0] - Math.sin(rad) * matrix[1];
                        result[1] = Math.sin(rad) * matrix[0] + Math.cos(rad) * matrix[1];

                        return result;
                    }
                    static Center(matrix, origin) {
                        let result = [2];

                        result[0] = matrix[0] - origin[0];
                        result[1] = matrix[1] - origin[1];

                        return result;
                    }
                    static Copy(matrix1, matrix2) {
                        for (let i = 0; i < matrix1.length; i++) {
                            matrix2[i] = matrix1[1];
                        }
                    }
                }


                var bullet = new Bullet(4000, 700);

                var player = new Player(600);

                var food = new Food(200, MAPSIZE, 15, 5);

                var ennemies = new EnnemyManager(200, 100);

                function Sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                
                var timeStats;
                var bulletColide = 0;
                var bulletMove = 0;
                var bulletDraw = 0;
                var bulletColideAvg = 0;
                var bulletMoveAvg = 0;
                var bulletDrawAvg = 0;
                var bulletRefreshAvg=0;
                
                var ennemiesUpdate = 0;
                var ennemiesUpdateAvg = 0;

                var foodDraw = 0;
                var foodColide = 0;
                var foodDrawAvg = 0;
                var foodColideAvg = 0;

                var oldrad = 0;
                async function Main(ctx,canvas) {

                   // console.log(WIDTH,HEIGHT);
                   WIDTH = canvas.width;
                   HEIGHT = canvas.height;

               // while(true) {
                    time = Date.now();
                    deltaTime = (time - oldTime) / 1000;
                    oldTime = time;
                    elapsedTime += deltaTime;
                    if(fireTime < player.fireRate) {
                    fireTime+= deltaTime;
                    }

                    let direction = 1//Mouse.Direction(player, oldDirection);
                    
                    let rad = 1//Mouse.Angle(direction) + (3 * Math.PI / 4);

                    player.Move(direction, deltaTime);
                    bullet.Move(deltaTime);

                
                    food.Generate();

                    ennemies.Spawn();

                    Clear(ctx);

                    if(draw) {
                    timeStats = Date.now();
                    food.Draw(ctx);
                    foodDraw=(foodDraw + Date.now()-timeStats);

                    player.Draw(rad,ctx);

                    timeStats = Date.now();
                    ennemies.Update(deltaTime,ctx);
                    ennemiesUpdate=(ennemiesUpdate + Date.now()-timeStats);

                    timeStats = Date.now();
                   bullet.Draw(ctx);
                    bulletDraw= (bulletDraw + Date.now()-timeStats);
                }
                
                if (clicking && fireTime >= player.fireRate) {
                    let ammount = ~~(fireTime/player.fireRate);
                    for(let i =0;player.fireRate<=fireTime;i++) {
                    player.Fire(bullet,rad + (oldrad-rad)/ammount*i);
                    fireTime-=player.fireRate;
                    }
                }
                player.Gain(deltaTime);

                timeStats = Date.now();
               bullet.CheckCollide(ennemies);
                bulletColide= (bulletColide + Date.now()-timeStats);

                timeStats = Date.now();
                food.CheckCollide(player);
                foodColide= (foodColide + Date.now()-timeStats);

                oldDirection = direction;
                oldrad = rad;

                fpsTimer+= deltaTime;
                    if(fpsTimer > 1) {

                        currentFps = fpsCounter;
                        fpsCounter = 0;
                        fpsTimer = 0;

                    bulletColideAvg = bulletColide/currentFps;
                    bulletMoveAvg = bulletMove/currentFps;
                    bulletDrawAvg = bulletDraw/currentFps;
                    bulletColide = 0;
                    bulletMove = 0;
                    bulletDraw = 0;

                    ennemiesUpdateAvg = ennemiesUpdate/currentFps;
                    ennemiesUpdate = 0;

                    foodDrawAvg = foodDraw/currentFps;
                    foodColideAvg = foodColide/currentFps;
                    foodDraw = 0;
                    foodColide = 0;
                    timeStats = Date.now();
                     bullet.RefreshColisions();
                       bulletRefreshAvg= (bulletRefreshAvg + Date.now()-timeStats);
                    }
                //    Draw.Text("FPS: " + currentFps, 0, 30);

                //    if(stats) {
                //        Draw.Text("bDraw: " + bulletDrawAvg, 0, 30 * 2);
                //        Draw.Text("bMove: " + bulletMoveAvg, 0, 30 * 3);
                //        Draw.Text("bColide: " + bulletColideAvg, 0, 30 * 4);
                //        Draw.Text("bullet count: " + bullet.bullets.length, 0, 30 * 5);
                //        Draw.Text("bRefresh: " + bulletRefreshAvg, 0, 30 * 6);
                //        Draw.Text("fColide: " + foodColideAvg, 0, 30 * 7);
                //        Draw.Text("fDraw: " + foodDrawAvg, 0, 30 * 8);
                //        Draw.Text("eUpdate: " + ennemiesUpdateAvg, 0, 30 * 9);
                //    }

                 //   time = Date.now();
                 //   if((time - oldTime) <= 1000 / fps) {
                 //       await Sleep((1000 / fps - (time - oldTime)));
                 //   }
                    
                    fpsCounter++;
                }
           // }


export default function Game({}) {

    const ref = useRef();

    useEffect(() => {
        const render = () => {
                let canvas = ref.current;
                let context = canvas.getContext('2d');
                
                      Main(context,canvas);
                             
        
            requestAnimationFrame(render);
        };
            render();
        });

    return(
        <Canvas width={WIDTH} height={HEIGHT} style={{backgroundColor: "yellow"}} ref={ref}>
        </Canvas>
    )
} 