const mColors = ["#D31313", "#1665C4", "#0EAA43", "#D2D218"];
const dColors = ["#F51919", "#3487EA", "#0DDB53", "#E6E618"];
const oColors = ["#DCAA14", "#DCAA14", "#DCAA14", "#DC14AA"];
const numToColor = ['r', 'b', 'g', 'y'];

class Box {
  constructor(color, x, y, size, levelLength) {
    //constants
    this.BOX_3D_ASPECT = 12.5;
    this.BOX_MOVE_SPEED = 12.5;
    //initial values
    this.boxMoving = false;
    this.isClicked = false;
    this.xOffset = 0;
    this.yOffset = 0;
    this.direction = 0;
    //parameters
    this.mColor = mColors[color];
    this.dColor = dColors[color];
    this.oColor = oColors[color];
    this.color = color;
    this.x = x;
    this.y = y;
    this.boxSize = size;
    this.levelLength = levelLength;
  }

  draw() {
    if (this.isClicked) {
      strokeWeight(3);
      stroke(this.oColor);
    } else {
      noStroke();
    }
    if (this.boxMoving) {
      let speed = this.boxSize / this.BOX_MOVE_SPEED;
      switch (this.direction) {
        case 0:
          this.yOffset -= speed;
          break;
        case 1:
          this.xOffset += speed;
          break;
        case 2:
          this.yOffset += speed;
          break;
        case 3:
          this.xOffset -= speed;
          break;
      }
      if (this.yOffset >= (this.boxSize + this.boxSize / this.levelLength)) {
        this.yOffset = 0;
        this.y++;
        this.boxMoving = false;
      }
      if (this.yOffset <= -(this.boxSize + this.boxSize / this.levelLength)) {
        this.yOffset = 0;
        this.y--;
        this.boxMoving = false;
      }
      if (this.xOffset >= (this.boxSize + this.boxSize / this.levelLength)) {
        this.xOffset = 0;
        this.x++;
        this.boxMoving = false;
      }
      if (this.xOffset <= -(this.boxSize + this.boxSize / this.levelLength)) {
        this.xOffset = 0;
        this.x--;
        this.boxMoving = false;
      }
    }
    fill(this.mColor);
    let pixelX = this.x * (this.boxSize + this.boxSize / this.levelLength);
    let pixelY = this.y * (this.boxSize + this.boxSize / this.levelLength);
    rect(pixelX + this.xOffset, pixelY + this.yOffset, this.boxSize, this.boxSize, 0, 8, 5, 8);
    fill(this.dColor);
    rect(pixelX - this.boxSize / this.BOX_3D_ASPECT + this.xOffset, pixelY - this.boxSize / this.BOX_3D_ASPECT + this.yOffset, this.boxSize, this.boxSize, 5);
  }

  clickIfClicked(mX, mY) {
    this.isClicked = (this.x == Math.floor(mX / (this.boxSize + this.boxSize / this.levelLength)) && this.y == Math.floor(mY / (this.boxSize + this.boxSize / this.levelLength)));
  }

  moveIfSelected(direction, map, otherBoxes) {
    if (this.isClicked && !this.boxMoving) {
      let xPosition = this.x;
      let yPosition = this.y;
      switch (direction) {
        case 0:
          yPosition--;
          break;
        case 1:
          xPosition++;
          break;
        case 2:
          yPosition++;
          break;
        case 3:
          xPosition--;
          break;
      }
      let ok = true;
      for (let i = 0; i < otherBoxes.length; i++) {
        ok = ok && (xPosition !== otherBoxes[i].x || yPosition !== otherBoxes[i].y);
      }

      if (map.getBlock(xPosition, yPosition) !== '0' && ok == true) {
        this.direction = direction;
        this.boxMoving = true;
      }
    }
  }

  isCorrect(map) {
    return map.getBlock(this.x, this.y) == numToColor[this.color];
  }
}

class Map {
  constructor(currLevel, callback) {
    this.ready = false;
    this.level = loadStrings("data/Level_" + currLevel + ".txt", () => {
      callback();
      this.ready = true;
    });
  }

  draw() {
    this.tileSize = width / (this.level.length + 1);
    noStroke();
    for (let i = (this.level.length - this.level[0]); i < this.level.length; i++) {
      for (let j = 0; j < this.level[i].length; j++) {
        switch (this.level[i].charAt(j)) {
          case '0':
            fill(80);
            break;
          case '1':
            fill(200);
            break;
          case 'r':
            fill("#E56464");
            break;
          case 'g':
            fill("#47FC85");
            break;
          case 'b':
            fill("#6FB8FF");
            break;
          case 'y':
            fill("#FFF943");
            break;
        }
        rect(j * (this.tileSize + this.tileSize / this.level.length), (i - (this.level.length - this.level[0])) * (this.tileSize + this.tileSize / this.level.length), this.tileSize, this.tileSize, 5);
      }
    }
  }

  getBlock(x, y) {
    return this.level[parseInt(y) + (this.level.length - this.level[0])].charAt(x);
  }

  getTileSize() {
    return width / (this.level.length + 1);
  }

  getLevelLength() {
    return this.level.length;
  }

  getData() {
    return this.level;
  }
}

let boxes = [];
let map;
let start = false;
let currLevel;

function preload() {
  if (cookieIsValid(document.cookie)) {
    map = new Map(document.cookie, function() {});
  } else {
    document.cookie = "1_1"
    map = new Map("1_1", function() {});
  }
  currLevel = document.cookie;
}

function setup() {
  createCanvas(1000, 1000);
  setupBoxes(document.cookie);
}

function draw() {
  if (start && map.ready) {
    background(255);
    map.draw();
    let complete = true;
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].draw();
      complete = complete && boxes[i].isCorrect(map);
    }
    if (complete == true) {
      nextLevel();
    }
  }
}

function mouseClicked() {
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].clickIfClicked(mouseX, mouseY);
  }
}

function keyPressed() {
  let direction;
  switch (keyCode) {
    case 38:
      //UP
      direction = 0;
      break;
    case 37:
      //LEFT
      direction = 3;
      break;
    case 40:
      //DOWN
      direction = 2;
      break;
    case 39:
      //RIGHT
      direction = 1;
      break;
    default:
      direction = -1;
  }
  if (direction !== -1) {
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].moveIfSelected(direction, map, boxes.filter(function(obj) {
        return obj !== boxes[i];
      }));
    }
  }
}

function cookieIsValid(keks) {
  let cookie = keks.split('_');
  if (cookie.length == 2) {
    return (!isNaN(parseInt(cookie[0])) && !isNaN(parseInt(cookie[1])));
  }
  return false;
}

function setupBoxes(level) {
  boxes = [];
  let bufInfo = map.getData();
  for (let i = 1; i < bufInfo.length - parseInt(bufInfo[0]); i += 2) {
    boxes.push(new Box((i - 1) / 2, bufInfo[i], bufInfo[i + 1], map.getTileSize(), map.getLevelLength()));
  }
  start = true;
}

function nextLevel() {
  start = false;
  if (currLevel !== "1_10") {
    currLevel = currLevel.split('_')[0] + "_" + (parseInt(currLevel.split('_')[1]) + 1);
    document.cookie = currLevel;
    map = new Map(currLevel, () => {
      setupBoxes(document.cookie);
    });
  } else {
    currLevel = "1_1";
    document.cookie = currLevel;
    map = new Map(currLevel, () => {
      setupBoxes(document.cookie);
    });
  }
}

function getCurrLevel() {
  console.log(document.cookie);
}