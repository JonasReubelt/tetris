var canvas;
var ctx;
var block_size = 30;
var blocks_x = 10;
var blocks_y = 20;
var world = {"width": blocks_x * block_size, "height": blocks_y * block_size};
var tetrii = {"I": [[0, 0], [0, 1],[0, 2],[0, 3]],
              "T": [[0, 0], [-1, 0], [1, 0], [0, -1]],
              "Z": [[0, 0], [1, 0], [1, 1], [2, 1]],
              "S": [[0, 0], [1, 0], [1, -1], [2, -1]],
              "J": [[0, 0], [0, 1], [0, 2], [-1, 2]],
              "L": [[0, 0], [0, 1], [0, 2], [1, 2]],
              "O": [[0, 0], [0, 1], [1, 0], [1, 1]]};
var tcolors = {"I": 1, "T": 2, "Z": 3, "S": 4, "J": 5, "L": 6, "O": 7};
var colors = {1: "cyan", 2: "violet", 3: "red", 4: "green", 5: "blue",
              6: "orange", 7: "yellow"};
var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
var sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];

var freq = 1;
var tetris = {"id": "Z", "x": 5, "y": -1, "o": 0};
var matrix;

window.onload = function() {
    init();
    canvas = document.getElementById("canvas");
    canvas.width = world.width;
    canvas.height = world.height;
    ctx = canvas.getContext("2d");

    var fps = 30.;
    setInterval(update, 1000./fps);
    setInterval(heartbeat, 1000./freq);

    document.addEventListener("keydown", keyDown);
}

function update(){
  draw_canvas();
  draw_matrix();

  var positions = tetrii[tetris.id];
  for (var i=0; i<4; i++){
    var pos = positions[i];
    if (tetris.y + pos[1] + 1 > blocks_y){
      tetris.y -= 1;
    }
  }

  draw_tetris(tetris, 5, 5, 0);

}

function init(){
  new_tetris();
  matrix = zeros([blocks_y, blocks_x]);
}

function draw_canvas(){
  ctx.lineWidth = '5';
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function draw_tetris(tetris){
  ctx.fillStyle = tetris_color();
  var positions = tetrii[tetris.id];
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(tetris.x + pos[0], tetris.y + pos[1]);
  }
}

function draw_block(x, y){
  ctx.fillRect(x * block_size, y * block_size, block_size, block_size);
}

function heartbeat(){
  var future_pos_y = tetris.y + 1;
  if (collision_detected(tetris.x, future_pos_y, tetris.o)){
    tetris_dies();
  } else {
    tetris.y = future_pos_y;
  }

}

function full_line_detection(){
  var completed_lines = [];
  for (var i=0; i<blocks_y; i++){
    var complete = true;
    for (var j=0; j<blocks_x; j++){
      if (matrix[i][j] == 0){
        complete = false;
        break;
      }
    }
    if (complete){
      completed_lines.push(i);
    }
  }

  var new_matrix = [];
  for (var i=0;i<completed_lines.length; i++){
    new_matrix.push(zeros([blocks_x]));
  }
  for (var i=0; i<blocks_y; i++){
    if (completed_lines.indexOf(i) == -1){
      new_matrix.push(matrix[i]);
    }
  }
  matrix = new_matrix;
}

function tetris_dies(){
  add_to_matrix();
  full_line_detection();
  new_tetris();

}

function new_tetris(){
  var keys = Object.keys(tetrii);
  var new_id = keys[Math.floor(Math.random() * keys.length)];
  tetris = {"id": new_id, "x": 5, "y": -1, "o": 0};
}

function collision_detected(x, y, o){
  var positions = tetrii[tetris.id];
  positions = rotated(positions, tetris.id);
  for (var i=0; i<4; i++){
    var pos = positions[i];
    if (y + pos[1] + 1 > blocks_y){
      return true;
    }
    if (x + pos[0] + 1 > blocks_x || x + pos[0] < 0){
      return true;
    }
  }
  if (matrix_collision(x, y)){
    return true;
  }
  return false;
}

function rotated(positions){
  for (var i=1; i<4; i++){
    for (var j=0; j<4; j++){
      if (positions[i] == sides[j]){
        positions[i] = sides[(j+1)%4];
      }
      if (positions[i] == corners[j]){
        positions[i] = corners[(j+1)%4];
      }
    }
  }
  return positions;
}

function keyDown(evt){
  var future_pos_x = tetris.x;
  var future_pos_y = tetris.y;
  var future_o = tetris.o;

  switch (evt.keyCode) {
    case 37:
      future_pos_x = tetris.x - 1;
      break;
    case 39:
      future_pos_x = tetris.x + 1;
      break;
    case 40:
      future_pos_y = tetris.y + 1;
      break;
    case 38:
      future_o = (tetris.o + 1)%4;
      break;

  }
  if (collision_detected(future_pos_x, future_pos_y, future_o)){
    if (evt.keyCode == 40){
      tetris_dies();
    }
  } else {
    tetris.y = future_pos_y;
    tetris.x = future_pos_x;
    tetris.o = future_o;
  }
}

function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}

function add_to_matrix(){
  var positions = tetrii[tetris.id];
  for (var i=0; i<4; i++){
    var pos = positions[i];
    matrix[tetris.y + pos[1]][tetris.x + pos[0]] = tcolors[tetris.id];
  }
}

function tetris_color(){
  return colors[tcolors[tetris.id]];
}

function draw_matrix(){
  for (var i=0; i<blocks_y; i++){
    for (var j=0; j<blocks_x; j++){
      if (matrix[i][j] > 0){
        ctx.fillStyle = colors[matrix[i][j]];
        draw_block(j, i);
      }
    }
  }
}

function matrix_collision(x, y){
  var positions = tetrii[tetris.id];
  for (var i=0; i<4; i++){
    var pos = positions[i];
    var ix = x + pos[0];
    var iy = y + pos[1];
    if (iy < blocks_y && ix < blocks_x && ix >= 0 && iy >= 0){
      if (matrix[iy][ix] > 0){
        return true;
      }
    }
  }
  return false;
}
