let currState = "EDITOR";
let isEmpty = true;
let scrollPos = 0;
let currSel = 0;
var maxScroll;
var editorSize, tPadding, tSize;
let testLevel;
let map;
let Font;
let Tileset;
let Spawns;
let scrollvy = 0;
let oldY;
let scrollable = false;

class Map {
  constructor(data) {
    this.levelData = data;
  }

  draw(size) {
    this.tileSize = size / (this.levelData.length - this.levelData[0]);
    for (let y = this.levelData[0]; y < this.levelData.length; y++) {
      for (let x = 0; x < this.levelData[y].length; x++) {
        image(Tileset, this.tileSize * x, this.tileSize * (y - this.levelData[0]), this.tileSize, this.tileSize, 0, 60 * this.levelData[y].charAt(x), 60, 60);
      }
    }
    this.drawBoxes();
  }

  drawBoxes() {
    for (let i = 1; i < this.levelData[0]; i += 2) {
      image(Spawns, this.tileSize * this.levelData[i], this.tileSize * this.levelData[i + 1], this.tileSize, this.tileSize, 0, 60 * ((i - 1) / 2), 60, 60);
    }
  }

  editPos(x, y, selection, exists) {
    if (selection <= 5) {
      let realY = y + Number(this.levelData[0])
      this.levelData[realY] = replaceChar(this.levelData[realY], selection, x);
    } else {
      if (exists) {
        if (this.levelData[(selection - 6) * 2 + 1] == x && this.levelData[(selection - 6) * 2 + 2] == y) {
          this.levelData[0] = Number(this.levelData[0]) - 2;
          this.levelData.splice([(selection - 6) * 2 + 1], 2);
        } else {
          let isNotUsed = 0;
          for (let i = 1; i < this.levelData[0]; i += 2) {
            isNotUsed += (this.levelData[i] == x && this.levelData[i + 1] == y);
          }
          console.log(isNotUsed);
          if (!isNotUsed) {
            this.levelData[(selection - 6) * 2 + 1] = x;
            this.levelData[(selection - 6) * 2 + 2] = y;
          }
        }
      } else {
        this.levelData.splice((selection - 6) * 2 + 1, 0, x);
        this.levelData.splice((selection - 6) * 2 + 2, 0, y);
        this.levelData[0] = Number(this.levelData[0]) + 2;
      }
    }
  }

}

function preload() {
  Font = loadFont("../assets/Avenir.otf");
  Tileset = loadImage("../assets/Tileset.png");
  Spawns = loadImage("../assets/Spawns.png");
}

function setup() {
  createCanvas(1000, 1000);
  noSmooth();
  textFont(Font);
  textAlign(CENTER, CENTER);
  let emptyMap = ["1"];
  for (let i = 0; i < 7; i++) {
    emptyMap.push('0'.repeat(7));
  }
  map = new Map(emptyMap);
}

function draw() {
  background("#ffffff");
  switch (currState) {
    case "MENU":
      drawMenu();
      break;
    case "EDITOR":
      drawEditor();
      break;
  }
}

function drawMenu() {
  let button1color = "#51a4f7";
  let button2color = "#51a4f7";
  cursor(ARROW);
  if (mouseX >= 150 && mouseX <= 450 && mouseY >= 450 && mouseY <= 550) {
    cursor(HAND);
    button1color = "#3875d8";
  }
  if (mouseX >= 550 && mouseX <= 850 && mouseY >= 450 && mouseY <= 550) {
    cursor(HAND);
    button2color = "#3875d8";
  }
  background(255);
  fill(button1color);
  rect(150, 450, 300, 100, 5);
  fill(button2color);
  rect(550, 450, 300, 100, 5);
  fill("#000000");
  textSize(50);
  text("Leveleditor", width / 2, height / 4);
  textSize(20);
  text("Bestehendes Level bearbeiten", 300, height / 2);
  text("Neues Level erstellen", 700, height / 2);
}


function drawEditor() {
  if (!mouseIsPressed) {
    scrollvy *= 0.8;
    scrollPos += scrollvy;
  }
  if (scrollPos <= 0) {
    scrollPos = 0;
  } else if (scrollPos >= maxScroll) {
    scrollPos = maxScroll;
  }
  editorSize = width * 0.75;
  textSize(50);
  if (isEmpty) {
    text("No map loaded yet!", editorSize / 2, editorSize / 2);
  } else {
    map.draw(editorSize);
  }
  tPadding = width * 0.05;
  tSize = width * 0.15;
  maxScroll = Tileset.height + Spawns.height + (Tileset.height / 60 + Spawns.height / 60 - 10) * tPadding;
  noFill();
  strokeWeight(4);
  stroke("#000000");
  for (let i = 0; i < Tileset.height / 60; i++) {
    if (i == currSel) {
      rect(editorSize + tPadding - 4, (tSize + tPadding) * i - scrollPos + tPadding - 4, tSize + 8, tSize + 8);
    }
    image(Tileset, editorSize + tPadding, (tSize + tPadding) * i - scrollPos + tPadding, tSize, tSize, 0, 60 * i, 60, 60);
  }
  for (let i = Tileset.height / 60; i < maxScroll / 60; i++) {
    if (i == currSel) {
      rect(editorSize + tPadding, (tSize + tPadding) * i - scrollPos + tPadding, tSize, tSize);
    }
    let extra = 0;
    if ((Number(map.levelData[0]) + 1) / 2 <= i - Tileset.height / 60) {
      extra = 4;
    }
    image(Spawns, editorSize + tPadding, (tSize + tPadding) * i - scrollPos + tPadding, tSize, tSize, 0, 60 * (extra + i - Tileset.height / 60), 60, 60);
  }
  strokeWeight(1);
  stroke("#000000");
  rect(editorSize + 5, 0, width - editorSize - 6, height - 1, 5, 5, 5, 0);
  rect(width - 20, scrollPos / maxScroll * (height - 200), 15, 200, 10);
  rect(0, editorSize + 5, editorSize + 5, width - editorSize - 6);
  cursor(ARROW);
  if (mouseIn("SELECTION")) {
    let bufY = (mouseY + scrollPos - tPadding) % (tSize + tPadding);
    if (bufY >= 0 && bufY <= tSize) {
      cursor(HAND);
    }
  }
  if (mouseIn("EDITOR")) {
    tint(255, 200);
    if (currSel < Tileset.height / 60) {
      image(Tileset, roundTo(mouseX, map.tileSize), roundTo(mouseY, map.tileSize), map.tileSize, map.tileSize, 0, 60 * currSel, 60, 60);
    } else {
      image(Spawns, roundTo(mouseX, map.tileSize), roundTo(mouseY, map.tileSize), map.tileSize, map.tileSize, 0, 60 * (currSel - Tileset.height / 60), 60, 60);
    }
  }
  if (mouseX >= 0 && mouseX <= editorSize - 5 && mouseY >= editorSize + 5 && mouseY <= height) {
    cursor(HAND);
  }
  noTint();
  textSize(40);
  fill("#000000");
  line((editorSize + 5) / 3, editorSize + 5, (editorSize + 5) / 3, height);
  line((editorSize + 5) / 3 * 2, editorSize + 5, (editorSize + 5) / 3 * 2, height);
  text("New level", (editorSize + 5) / 6, editorSize + width * 0.125);
  text("Save level", (editorSize + 5) / 6 * 3, editorSize + width * 0.125);
  text("Test level", (editorSize + 5) / 6 * 5, editorSize + width * 0.125);
}

function mousePressed() {
  oldY = mouseY;
  scrollable = mouseX >= editorSize + 5 && mouseX <= width - 20 && mouseY >= 0 && mouseY <= height;
  if (mouseIn("SELECTION")) {
    let bufY = (mouseY + scrollPos - tPadding) % (tSize + tPadding);
    if (bufY >= 0 && bufY <= tSize) {
      let bufCurrSel = parseInt((mouseY + scrollPos - tPadding) / (tSize + tPadding));
      if ((Number(map.levelData[0]) + 1) / 2 + 5 >= bufCurrSel) {
        currSel = parseInt((mouseY + scrollPos - tPadding) / (tSize + tPadding));
      }
    }
  }
  if (mouseIn("EDITOR")) {
    let currMax = (Number(map.levelData[0]) - 1) / 2 + 5;
    map.editPos(parseInt(roundTo(mouseX, map.tileSize) / map.tileSize), parseInt(roundTo(mouseY, map.tileSize) / map.tileSize), currSel, currMax !== currSel - 1);
  }
  if (mouseX >= 0 && mouseX <= editorSize - 5 && mouseY >= editorSize + 5 && mouseY <= height) {
    if (mouseX < (editorSize + 5) / 3) {
      let size = prompt("Please enter the size of the level:");
      let emptyMap = ["1"];
      for (let i = 0; i < size; i++) {
        emptyMap.push('0'.repeat(size));
      }
      map = new Map(emptyMap);
      isEmpty = false;
    } else if (mouseX < (editorSize + 5) / 3 * 2) {
      arrayToString(map.levelData);
    } else {
      window.open("testLevel/index.html?" + map.levelData);
    }
  }
  return false;
}

function mouseWheel(event) {
  if (mouseX >= editorSize + 5 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    scrollPos += event.delta / 2;
    if (scrollPos <= 0) {
      scrollPos = 0;
    } else if (scrollPos >= maxScroll) {
      scrollPos = maxScroll;
    }
  }
}

function mouseDragged() {
  if (scrollable) {
    scrollvy = (oldY - mouseY);
    scrollPos += scrollvy;
    if (scrollPos <= 0) {
      scrollPos = 0;
    } else if (scrollPos >= maxScroll) {
      scrollPos = maxScroll;
    }
    oldY = mouseY;
  }
  return false;
}

function roundTo(num, roundTo) {
  return num - parseInt(num % roundTo);
}

function mouseIn(where) {
  switch (where) {
    case "EDITOR":
      return mouseX >= 0 && mouseX <= editorSize - 5 && mouseY >= 0 && mouseY <= editorSize - 5;
    case "SELECTION":
      return mouseX >= editorSize + tPadding && mouseX <= width - tPadding;
  }
}

function replaceChar(original, char, pos) {
  let newString = "";
  for (let i = 0; i < original.length; i++) {
    if (i == pos) {
      newString = newString.concat(char);
    } else {
      newString = newString.concat(original[i]);
    }
  }
  return newString;
}

function arrayToString(array) {
  var writer = createWriter("level.txt");
  for (let i = 0; i < array.length; i++) {
    writer.print(array[i] + '\r');
  }
  writer.close();
  writer.flush();
}