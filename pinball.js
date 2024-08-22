document
  .getElementById("drawButton")
  .addEventListener("click", drawPinballMachine);
document.getElementById("runButton").addEventListener("click", startSimulation);
document.getElementById("reset").addEventListener("click", drawPinballMachine);

let pocketColors = [];
let pocketLabels = [];
let pockets = [];
let dividers = [];
let deletedPocketes = [];

function drawPinballMachine() {
  const canvas = document.getElementById("pinballCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  let pocketCount =
    parseInt(document.getElementById("pocketCount").value) -
    deletedPocketes.length;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 10, height);
  ctx.fillRect(width - 10, 0, width, height);

  const pins = [];
  const rows = 9;
  const pinRadius = 4;

  for (let row = 0; row < rows; row++) {
    const cols = row + 1;
    for (let col = 0; col < cols; col++) {
      const xOffset = width / (rows + 1);
      const yOffset = height / (rows + 6);
      const pinX = xOffset * (col + 1) + (xOffset / 2) * (rows - cols);
      const pinY = yOffset * (row + 3);
      pins.push({ x: pinX, y: pinY });
    }
  }

  ctx.fillStyle = "white";
  pins.forEach((pin) => {
    ctx.beginPath();
    ctx.arc(pin.x, pin.y, pinRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  pockets = [];
  dividers = [];
  let pocketWidth = (width - 20) / pocketCount;

  pocketColors = [];
  pocketLabels = [];
  deletedPocketes = [];

  for (let i = 0; i < pocketCount; i++) {
    const color = `hsl(${Math.random() * 360}, 100%, 80%)`; // 隨機淺色
    pocketColors.push(color);
    pockets.push({
      x: 10 + i * pocketWidth,
      width: pocketWidth,
    });
  }

  pockets.forEach((pocket, index) => {
    ctx.fillStyle = pocketColors[index];
    ctx.fillRect(pocket.x, height - 20, pocket.width, 20);

    // 加上編號在球袋中心
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(index + 1, pocket.x + pocket.width / 2, height - 10);
    pocketLabels.push(index + 1);
  });

  // 繪製分隔板
  const dividerHeight = 60; // 適當高度
  pockets.forEach((pocket, index) => {
    if (index < pocketCount - 1) {
      const nextPocket = pockets[index + 1];
      const dividerX = pocket.x + pocket.width;
      ctx.fillStyle = "gray";
      ctx.fillRect(dividerX, height - 20 - dividerHeight, 2, dividerHeight); // 分隔板
      dividers.push({
        x: dividerX,
        y: height - 20 - dividerHeight,
        width: 2,
        height: dividerHeight,
      });
    }
  });

  document.getElementById("runButton").disabled = false; // 禁用繪製按鈕
  document.getElementById("reset").disabled = true;
}

function startSimulation() {
  const canvas = document.getElementById("pinballCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const bounceRate = 0.6;
  const friction = 0.95;
  let ballxRecord = [];
  let ballyRecord = [];

  document.getElementById("drawButton").disabled = true;
  document.getElementById("runButton").disabled = true;
  document.getElementById("reset").disabled = true;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 10, height);
  ctx.fillRect(width - 10, 0, width, height);

  const pins = [];
  const rows = 9;
  const pinRadius = 4;

  for (let row = 0; row < rows; row++) {
    const cols = row + 1;
    for (let col = 0; col < cols; col++) {
      const xOffset = width / (rows + 1);
      const yOffset = height / (rows + 6);
      const pinX = xOffset * (col + 1) + (xOffset / 2) * (rows - cols);
      const pinY = yOffset * (row + 3);
      pins.push({ x: pinX, y: pinY });
    }
  }

  let ballX = width * (Math.random() * 0.002 + 0.499);
  let ballY = Math.random() * 10 + 60;
  const ballRadius = 8;
  const gravity = 0.5;
  const tailLength = 20;
  let speedY = 0;
  let speedX = 0;

  function update() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 10, height);
    ctx.fillRect(width - 10, 0, width, height);

    //繪製殘影
    ballxRecord.push(ballX);
    ballyRecord.push(ballY);
    if (ballxRecord.length > tailLength) {
      ballxRecord.reverse();
      ballxRecord.pop();
      ballxRecord.reverse();
      ballyRecord.reverse();
      ballyRecord.pop();
      ballyRecord.reverse();
    }

    ballxRecord.forEach((x, y) => {
      ctx.beginPath();
      ctx.arc(x, ballyRecord[y], ballRadius / tailLength * y, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(128,255,255,0.3)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.closePath();
    });

    // 繪製球袋
    pockets.forEach((pocket, index) => {
      if (!deletedPocketes.includes(index)) {
        ctx.fillStyle = pocketColors[index];
        ctx.fillRect(pocket.x, height - 20, pocket.width, 20);
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          pocketLabels[index],
          pocket.x + pocket.width / 2,
          height - 10
        );
      } else {
        ctx.fillStyle = "lightgray";
        ctx.fillRect(pocket.x, height - 20, pocket.width, 20);
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("☉", pocket.x + pocket.width / 2, height - 10);
      }
    });

    // 繪製圖釘
    ctx.fillStyle = "white";
    pins.forEach((pin) => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, pinRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });

    // 繪製分隔板
    ctx.fillStyle = "gray";
    dividers.forEach((divider) => {
      ctx.fillRect(divider.x, divider.y, divider.width, divider.height);
    });

    // 更新彈珠位置
    speedY += gravity;
    ballY += speedY;
    ballX += speedX;

    // 防止彈珠落入球袋
    let pocketIndex = -1;
    if (ballY + ballRadius > height - 20) {
      pockets.forEach((pocket, index) => {
        if (ballX > pocket.x && ballX < pocket.x + pocket.width) {
          if (!deletedPocketes.includes(index)) {
            ballY = height - 20 - ballRadius;
            speedY *= -bounceRate; // 反彈係數
            speedX *= friction; // 摩擦
            if (Math.sqrt(speedX ** 2 + speedY ** 2) <= gravity + 0.01) {
              pocketIndex = index;
              ballxRecord = [];
              ballyRecord = [];
            }
          } else {
            //球落入已經刪除的球袋
            ballY = height - 20 - ballRadius;
            speedY *= -(bounceRate ** 2 + 1); // 反彈係數
            speedX *= friction + (Math.random() * 0.1 - 0.05); // 摩擦
          }
        }
      });

      if (pocketIndex !== -1) {
        setTimeout(() => {
          // 顯示結果
          displayPocketNumber(pocketLabels[pocketIndex]);
          document.getElementById("drawButton").disabled = false; // 重新啟用按鈕
          document.getElementById("reset").disabled = false;
          document.getElementById("runButton").disabled = false;
        }, 2000); // 2秒後清除畫布並顯示結果

        return; // 停止更新以避免球繼續移動
      }
    }

    if (ballX + ballRadius > width - 20 || ballX - ballRadius < 20) {
      speedX *= -bounceRate;
    }

    // 碰撞檢測與分隔板
    dividers.forEach((divider) => {
      if (
        ballX + ballRadius > divider.x &&
        ballX - ballRadius < divider.x + divider.width &&
        ballY + ballRadius > divider.y &&
        ballY - ballRadius < divider.y + divider.height
      ) {
        // 計算分隔板的反彈方向
        const ballCenterX = ballX;
        const ballCenterY = ballY;

        // 根據分隔板的方向決定反彈
        if (ballX < divider.x || ballX > divider.x + divider.width) {
          speedX *= -bounceRate; // 垂直反彈
        } else {
          speedY *= -bounceRate; // 水平反彈
        }

        // 確保球位於分隔板的外部
        if (ballX < divider.x) {
          ballX = divider.x - ballRadius;
        } else if (ballX > divider.x + divider.width) {
          ballX = divider.x + divider.width + ballRadius;
        }

        if (ballY < divider.y) {
          ballY = divider.y - ballRadius;
        } else if (ballY > divider.y + divider.height) {
          ballY = divider.y + divider.height + ballRadius;
        }
      }
    });

    // 邊界碰撞檢查（左右邊界）
    if (ballX + ballRadius > width - 20) {
      ballX = width - 20 - ballRadius;
      speedX = -bounceRate * Math.abs(speedX);
    }
    if (ballX - ballRadius < 20) {
      ballX = 20 + ballRadius;
      speedX = bounceRate * Math.abs(speedX);
    }

    // 碰撞檢測與圖釘
    pins.forEach((pin) => {
      const dx = ballX - pin.x;
      const dy = ballY - pin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ballRadius + pinRadius) {
        const angle = Math.atan2(dy, dx);
        const totalSpeed = Math.sqrt(speedX * speedX + speedY * speedY);

        speedX = totalSpeed * Math.cos(angle) * bounceRate;
        speedY = totalSpeed * Math.sin(angle) * bounceRate;

        ballX = pin.x + (ballRadius + pinRadius) * Math.cos(angle);
        ballY = pin.y + (ballRadius + pinRadius) * Math.sin(angle);
      }
    });

    // 繪製彈珠
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "lightblue";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.closePath();

    // 確保彈珠繼續更新
    requestAnimationFrame(update);
  }
  update();
}

function displayPocketNumber(number) {
  const canvas = document.getElementById("pinballCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 120, 0, Math.PI * 2);
  ctx.fillStyle = "lightyellow";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 5;
  ctx.fill();
  ctx.closePath();

  //ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "black";
  ctx.font = "bold 144px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(number, width / 2, height / 2 + 6);
  deletedPocketes.push(number - 1);
}
