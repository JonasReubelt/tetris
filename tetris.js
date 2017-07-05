var canvas;
var ctx;
var block_size = 30;
var blocks_x = 10;
var blocks_y = 20;
var world = {"width": blocks_x * block_size, "height": blocks_y * block_size};
var tetrii = {"I": [[0, 0], [0, 1], [0, 2], [0, 3]],
              "T": [[0, 0], [-1, 0], [1, 0], [0, -1]],
              "Z": [[0, 0], [-1, -1], [0, -1], [1, 0]],
              "S": [[0, 0], [-1, 0], [0, -1], [1, -1]],
              "J": [[0, 0], [-1, -1], [-1, 0], [1, 0]],
              "L": [[0, 0], [-1, 0], [1, 0], [1, -1]],
              "O": [[0, 0], [0, 1], [1, 0], [1, 1]]};
var tcolors = {"I": 1, "T": 2, "Z": 3, "S": 4, "J": 5, "L": 6, "O": 7};
var colors = {1: "#12c6bb", 2: "#63009b", 3: "#aa0f11", 4: "green", 5: "#0d37e5",
              6: "#e9850e", 7: "#d5cf12"};
var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
var sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];

var freq = 0.1;
var tetris;
var matrix;

window.onload = function() {
    init();
    canvas = document.getElementById("canvas");
    canvas.width = world.width;
    canvas.height = world.height;
    ctx = canvas.getContext("2d");

    var fps = 60.;
    setInterval(update, 1000./fps);
    setInterval(heartbeat, 1000./freq);

    document.addEventListener("keydown", keyDown);

}

function update(){
  draw_canvas();

  draw_matrix();

  var positions = tetris.pos;
  for (var i=0; i<4; i++){
    var pos = positions[i];
    if (tetris.y + pos[1] + 1 > blocks_y){
      tetris.y -= 1;
    }
  }

  draw_tetris();
  //draw_grid();
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
function draw_tetris(){
  var c = tetris_color();
  ctx.fillStyle = c;
  var positions = tetris.pos;
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(tetris.x + pos[0], tetris.y + pos[1], c);
  }
}

function draw_grid(){
  ctx.strokeStyle = '#4c4a4a';
  ctx.lineWidth=2;
  ctx.moveTo(0,0);
  ctx.lineTo(world.width,0);
  ctx.moveTo(1,0);
  ctx.lineTo(1,world.height);
  ctx.moveTo(0,world.height-1);
  ctx.lineTo(world.width,world.height-1);
  ctx.moveTo(world.width-1,0);
  ctx.lineTo(world.width-1,world.height);
  for (var i=0; i<blocks_x; i++){
    ctx.moveTo(i * block_size,0);
    ctx.lineTo(i * block_size,world.height);
  }
  for (var i=0; i<blocks_y; i++){
    ctx.moveTo(0, i * block_size);
    ctx.lineTo(world.width, i * block_size);
  }
  ctx.stroke();
}

function draw_block(x, y, c){
  ctx.fillStyle = c;
  ctx.fillRect(x * block_size, y * block_size, block_size, block_size);
}

function heartbeat(){
  var future_pos_y = tetris.y + 1;
  if (collision_detected(tetris.x, future_pos_y)){
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
  var pos = tetrii["I"];
  tetris = {"id": "I", "x": 5, "y": -1, "pos": pos, "o": 0};
}

function collision_detected(x, y, rot){
  //var positions = tetris.pos;
  var positions_new;
  var positions_rot;
  if (rot){
    positions_new = rotated(tetris.pos);
  } else{
    positions_new = tetris.pos;
  }
  for (var i=0; i<4; i++){
    var pos_new = positions_new[i];
    if (y + pos_new[1] >= blocks_y){
      return true;
    }
    if (x + pos_new[0] >= blocks_x || x + pos_new[0] < 0){
      return true;
    }
  }
  if (matrix_collision(x, y)){
    return true;
  }
  return false;
}

function rotated(pos){
  //return pos;
  if (tetris.id=="O"){
    return pos;
  }
  if (tetris.id=="I"){
    if (tetris.o == 0){
      tetris["o"] = 1;
      return [[-1, 1], [0, 1], [1, 1], [2, 1]];
    }
    if (tetris.o == 1){
      tetris["o"] = 2;
      return [[1, 0], [1, 1], [1, 2], [1, 3]];
    }
    if (tetris.o == 2){
      tetris["o"] = 3;
      return [[-1, 2], [0, 2], [1, 2], [2, 2]];
    }
    if (tetris.o == 3){
      tetris["o"] = 0;
      return [[0, 0], [0, 1], [0, 2], [0, 3]];
    }

  }
  var pos_new = zeros([4, 2]);
  for (var i=1; i<4; i++){
    for (var j=0; j<4; j++){
      if (pos[i][0] == sides[j][0] && pos[i][1] == sides[j][1]){
        pos_new[i] = sides[(j+1)%4];
      }
      if (pos[i][0] == corners[j][0] && pos[i][1] == corners[j][1]){
        pos_new[i] = corners[(j+1)%4];
      }
    }
  }
  return pos_new;
}

function rotate(){
  //alert(tetris.pos);
  tetris.pos = rotated(tetris.pos);
  //alert(tetris.pos);
}

function keyDown(evt){
  var future_pos_x = tetris.x;
  var future_pos_y = tetris.y;
  var rot = false;
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
      rotate();
      rot = true;
      alert(tetris.o);
      break;

  }
  if (collision_detected(future_pos_x, future_pos_y, rot)){
    if (evt.keyCode == 40){
      tetris_dies();
    }
  } else {
    tetris.y = future_pos_y;
    tetris.x = future_pos_x;
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
  var positions = tetris.pos;
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
  var positions = tetris.pos;
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
