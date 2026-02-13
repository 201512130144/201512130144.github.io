// 初始化内容
var wH = window.innerHeight;
var wW = window.innerWidth;
let backgroundRendering = document.getElementById("backgroundRendering");
var generateStars = function generateStars(f) {
    for (var e = 0; e < f; e++) {
        var single = document.createElement("div");
        single.className = e % 20 == 0 ? "spark big-spark" : e % 9 == 0 ? "spark medium-spark" : "star";
        single.setAttribute("style", "top:" + Math.round(Math.random() * wH) + "px;left:" + Math.round(Math.random() * wW) + "px;animation-duration:" + (Math.round(Math.random() * 3000) + 3000) + "ms;animation-delay:" + Math.round(Math.random() * 3000) + "ms;");
        backgroundRendering.appendChild(single);
    }
};
generateStars(getRandom(140,240));


// 全局变量 提供内容/对象存储
let fireworksCanvas = document.getElementById("fireworks");
let currentFireworks = document.createElement("canvas");
let currentObject = currentFireworks.getContext("2d");
let fireworksObject = fireworksCanvas.getContext("2d");



let dpr = window.devicePixelRatio || 8;

fireworksCanvas.width = window.innerWidth * dpr;
fireworksCanvas.height = window.innerHeight * dpr;
fireworksCanvas.style.width = window.innerWidth / 2 + "px";
fireworksCanvas.style.height = window.innerHeight  / 2 + "px";
fireworksObject.scale(dpr, dpr);

currentFireworks.width = window.innerWidth * dpr;
currentFireworks.height = window.innerHeight * dpr;
currentFireworks.style.width = window.innerWidth + "px";
currentFireworks.style.height = window.innerHeight + "px";
currentObject.scale(dpr, dpr);


let fireworksExplosion = [];
let autoPlayFlag = false;

// 自动加载烟花动画
window.onload = function () {
    drawFireworks();
    lastTime = new Date();
    animationEffect();
    // 背景音乐
    let audio = document.getElementById('bgm');
    document.querySelector("body").onclick = function () {
        if (!autoPlayFlag) {
            audio.play();
            autoPlayFlag = true;
        }
    }
		// 淡入
		for (let i = 0; i <= 10; i++){
			setTimeout(function () {
				document.querySelector("body > div.message").style.opacity = i/10;
			}, i*120 + 2000)
		};

		// 淡出
		for (let i = 0; i <= 10; i++){
			setTimeout(function () {
				document.querySelector("body > div.message").style.opacity = 1 - i/10;
			}, i*120 + 8000)
		};

};

let lastTime;


// 烟花动画效果
function animationEffect() {
    fireworksObject.save();

let fade = 0.03 + Math.sin(Date.now() * 0.001) * 0.04;
fireworksObject.fillStyle = `rgba(0,0,0,${fade})`;



    //fireworksObject.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
	fireworksObject.fillRect(0, 0, window.innerWidth, window.innerHeight);
    fireworksObject.restore();
    let newTime = new Date();
    if (newTime - lastTime > getRandom(50,1500)) {
        let random = Math.random() * 100 > 15;
		let x = getRandom(0, window.innerWidth);
		let y = getRandom(0, window.innerHeight * 0.3);

        if (random) {
            let bigExplode = new explode(
			getRandom(0, window.innerWidth),
			getRandom(1, 3),
			"#FFF",
			{ x: x, y: y }
		);

            fireworksExplosion.push(bigExplode);

        } else {
            let x = getRandom(window.innerWidth/2 - 300, window.innerWidth/2 - 200);
            let y = getRandom(0, 350);
            let bigExplode = new explode(
                getRandom(0, window.innerWidth),
                getRandom(1, 3),
                "#FFF",
                {
                    x: x,
                    y: y,
                },
                document.querySelectorAll(".shape")[
                    parseInt(getRandom(0, document.querySelectorAll(".shape").length))
                    ]
            );
            fireworksExplosion.push(bigExplode);
        }
        lastTime = newTime;
    }
    sparks.foreach(function () {
        this.paint();
    });
    fireworksExplosion.foreach(function () {
        let that = this;
        if (!this.dead) {
            this._move();
            this._drawLight();
        } else {
            this.explodes.foreach(function (index) {
                if (!this.dead) {
                    this.moveTo();
                } else {
                    if (index === that.explodes.length - 1) {
                        fireworksExplosion[fireworksExplosion.indexOf(that)] = null;
                    }
                }
            });
        }
    });
    setTimeout(animationEffect, 18);
}

Array.prototype.foreach = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] !== null) {
            callback.apply(this[i], [i]);
        }
    }
};

fireworksCanvas.onclick = function (evt) {
    let x = evt.clientX;
    let y = evt.clientY;

    let explodeObj = new explode(
        getRandom(window.innerWidth / 3, (window.innerWidth * 2) / 3),
        2,
        "#FFF",
        { x: x, y: y }
    );

    fireworksExplosion.push(explodeObj);
};


let explode = function (x, r, c, explodeArea, shape) {
    this.explodes = [];
    this.x = x;
    this.y = window.innerHeight + r;
    this.r = r;
    this.c = c;
    this.shape = shape || false;
    this.explodeArea = explodeArea;
    this.dead = false;
    this.ba = parseInt(getRandom(80, 200));

    // 新增物理参数
    this.vx = (explodeArea.x - this.x) / 60;
    this.vy = (explodeArea.y - this.y) / 60;
    this.ay = 0.03;   // 重力
};



explode.prototype = {
    _paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        fireworksObject.fillStyle = this.c;
        fireworksObject.fill();
        fireworksObject.restore();
    },
	//火箭移动速度
    _move: function () {

    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;

    let dx = this.explodeArea.x - this.x;
    let dy = this.explodeArea.y - this.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 40) {
		this.x = this.explodeArea.x;
		this.y = this.explodeArea.y;
		
        if (this.shape) {
            this._shapeExplode();
        } else {
            this._explode();
        }
        this.dead = true;
        return;
    }

    this._paint();
	},
    _drawLight: function () {
        fireworksObject.save();


		fireworksObject.globalCompositeOperation = "lighter";
		fireworksObject.fillStyle = "rgba(255,255,255,0.15)";

        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r + 2 * Math.random() + 1, 0, 2 * Math.PI);
        fireworksObject.fill();
        fireworksObject.restore();
    },
_explode: function () {

    let embellishmentNum = getRandom(300, 600);

    // ===== 20种精选高级配色 =====
    const colorPalette = [

        { a: 80,  b: 180, c: 255 },  // 冰蓝
        { a: 120, b: 200, c: 255 },  // 天蓝
        { a: 50,  b: 220, c: 200 },  // 青色
        { a: 0,   b: 255, c: 200 },  // 湖绿
        { a: 255, b: 200, c: 80  },  // 金色
        { a: 255, b: 170, c: 60  },  // 暖橙
        { a: 255, b: 120, c: 60  },  // 烈焰橙
        { a: 255, b: 90,  c: 90  },  // 红焰
        { a: 255, b: 255, c: 255 },  // 纯白
        { a: 240, b: 240, c: 255 },  // 冷白
        { a: 200, b: 200, c: 255 },  // 银蓝
        { a: 180, b: 120, c: 255 },  // 紫蓝
        { a: 150, b: 80,  c: 255 },  // 深紫
        { a: 255, b: 100, c: 200 },  // 玫红
        { a: 255, b: 150, c: 220 },  // 粉紫
        { a: 120, b: 255, c: 150 },  // 嫩绿
        { a: 180, b: 255, c: 100 },  // 荧光绿
        { a: 255, b: 255, c: 120 },  // 柔黄
        { a: 255, b: 220, c: 180 },  // 香槟
        { a: 100, b: 255, c: 255 }   // 电光青
    ];

    // 随机选择一种颜色
    let color = colorPalette[
        Math.floor(Math.random() * colorPalette.length)
    ];

    let fullRange = parseInt(getRandom(600, 1800));

    for (let i = 0; i < embellishmentNum; i++) {

        let angle = getRandom(0, Math.PI * 2);
        let r = getRandom(0, fullRange);

        let x = r * Math.cos(angle) + this.x;
        let y = r * Math.sin(angle) + this.y;

        let radius = getRandom(2, 3);

        let embellishment = new newEmbellishment(
            this.x,
            this.y,
            radius,
            color,
            x,
            y
        );

        this.explodes.push(embellishment);
    }
},

    _shapeExplode: function () {
        let that = this;
		//YZX 渐变效果
        putValue(currentFireworks, currentObject, this.shape, 4, function (dots) {
			let dx = window.innerWidth / 2 - that.x;
			let dy = window.innerHeight / 2 - that.y;

            let color;
            for (let i = 0; i < dots.length; i++) {
                color = {
                    a: dots[i].a,
                    b: dots[i].b,
                    c: dots[i].c,
                };
                let x = dots[i].x;
                let y = dots[i].y;
                let radius = 1;
                let embellishment = new newEmbellishment(that.x, that.y, radius, color, x - dx, y - dy);
                that.explodes.push(embellishment);
            }
        });
    },
};

function putValue(fireworks, context, ele, dr, callback) {
    // 先清空
	context.clearRect(0, 0, currentFireworks.width, currentFireworks.height);


    let img = new Image();
    let dots;

    if (ele.innerHTML.indexOf("img") >= 0) {

        img.src = ele.getElementsByTagName("img")[0].src;

        implode(img, function () {

            context.drawImage(
                img,
                window.innerWidth / 2 - img.width / 2,
                window.innerHeight / 2 - img.height / 2
            );

            dots = gettingData(fireworks, context, dr);
            callback(dots);
        });

    } else {

        let text = ele.innerHTML;

        context.save();

        let fontSize = Math.floor(window.innerWidth / 10);


		context.font = "bold " + fontSize + "px Arial, Microsoft YaHei, sans-serif";

        context.textAlign = "center";
        context.textBaseline = "middle";

        // 固定高亮色，避免随机黑色消失
        context.fillStyle = "rgba(255,255,255,1)";

        context.fillText(
            text,
            window.innerWidth / 2,
            window.innerHeight / 2
        );

        context.lineWidth = 2;
        context.strokeStyle = "rgba(120,200,255,1)";

        context.strokeText(
            text,
            window.innerWidth / 2,
            window.innerHeight / 2
        );

        context.restore();

        dots = gettingData(fireworks, context, dr);
        callback(dots);
    }
}


function implode(img, callback) {
    if (img.complete) {
        callback.call(img);
    } else {
        img.onload = function () {
            callback.call(this);
        };
    }
}

function gettingData(fireworks, context, dr) {
    let imgData = context.getImageData(
        0,
        0,
        currentFireworks.width,
        currentFireworks.height
    );

    context.clearRect(
        0,
        0,
        currentFireworks.width,
        currentFireworks.height
    );

    let dots = [];

    for (let x = 0; x < imgData.width; x += dr) {
        for (let y = 0; y < imgData.height; y += dr) {
            let i = (y * imgData.width + x) * 4;

            if (imgData.data[i + 3] > 0) {
                dots.push({
                    x: x / dpr,
                    y: y / dpr,
                    a: imgData.data[i],
                    b: imgData.data[i + 1],
                    c: imgData.data[i + 2],
                });
            }
        }
    }

    return dots;
}


function getRandom(a, b) {
    return Math.random() * (b - a) + a;
}

let maxRadius = 1,
    sparks = [];

function drawFireworks() {
    for (let i = 0; i < 100; i++) {
        let spark = new newSpark();
        sparks.push(spark);
        spark.paint();
    }
}

// 新建星火位置
let newSpark = function () {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * 2 * window.innerHeight - window.innerHeight;
    this.r = Math.random() * maxRadius;
};


newSpark.prototype = {
    paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        fireworksObject.fillStyle = "rgba(255,255,255," + this.r + ")";
        fireworksObject.fill();
        fireworksObject.restore();
    },
};
// 烟花点缀生成
let newEmbellishment = function (centerX, centerY, radius, color, tx, ty) {

    this.x = centerX;
    this.y = centerY;

    let dx = tx - centerX;
    let dy = ty - centerY;

    // 计算距离
    let distance = Math.sqrt(dx * dx + dy * dy) + 60;

    // 固定飞行时间（帧数）
    let duration = 60;

    // 让粒子在 duration 帧内到达目标
    this.vx = dx / duration;
    this.vy = dy / duration;

    // 不要重力
    this.ay = 0.2;

    this.life = duration;
    this.dead = false;

    this.radius = radius || 1;
    this.color = color;
};




newEmbellishment.prototype = {
    paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        fireworksObject.fillStyle =
            "rgba(" + this.color.a + "," + this.color.b + "," + this.color.c + ",0.9)";
        fireworksObject.fill();
        fireworksObject.restore();
    },
	moveTo: function () {

    this.vy += this.ay / 3;   // 重力拉弯
    this.x += this.vx;
    this.y += this.vy;

    this.life--;
    this.alpha = this.life / 40;

    if (this.life <= 10) {
        this.dead = true;
        return;
    }

    fireworksObject.save();
    fireworksObject.globalAlpha = this.alpha;
    fireworksObject.beginPath();
    fireworksObject.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    fireworksObject.fillStyle =
        "rgba(" + this.color.a + "," + this.color.b + "," + this.color.c + ",1)";
    fireworksObject.fill();
    fireworksObject.restore();
},



};