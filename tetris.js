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

var freq = 1.;
var increase = 2.;
var tetris;
var matrix;
var points = 0;
var bag_counter = 0;
var current_bag = ["I", "T", "Z", "S", "J", "L", "O"];
var next_bag = ["I", "T", "Z", "S", "J", "L", "O"];
current_bag = shuffle(current_bag);
next_bag = shuffle(next_bag);
var next_tetris;
var total_cleared = 0;
var fps = 60.;
var fps_counter = 0;
var dropping = false;

window.onload = function() {
    init();
    canvas = document.getElementById("canvas");
    canvas.width = world.width*2;
    canvas.height = world.height;
    ctx = canvas.getContext("2d");


    setInterval(update, 1000./fps);
    //setInterval(heartbeat, 1000./freq);

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
  draw_grid();
  draw_next_tetris();
  //draw_grid();
  draw_points();
  if (fps_counter>=fps){
    heartbeat();
    fps_counter = 0;
  }
  //alert(fps_counter);
  fps_counter += freq;
}

function init(){
  new_tetris();
  matrix = zeros([blocks_y, blocks_x]);
  myAudio = new Audio('sounds/Tetristitle.m4a');
  myAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);
  myAudio.volume = 0.5;
  myAudio.play();
}

function draw_canvas(){
  ctx.lineWidth = '5';
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.fillRect(0, 0, canvas.width/2, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(canvas.width/2, 0, canvas.width, canvas.height);
}
function draw_tetris(){
  var c = tetris_color();
  ctx.fillStyle = c;
  var positions = tetris.pos;
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(tetris.x + pos[0], tetris.y + pos[1]);
  }
}

function draw_next_tetris(){
  var c = colors[tcolors[next_tetris.id]];
  ctx.fillStyle = c;
  var positions = next_tetris.pos;
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(14 + pos[0], 15 + pos[1]);
  }
}

function draw_points(){
  var p = points.toString();
  ctx.font = "20px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText("Points:",world.width + 100,50);
  ctx.fillText(p,world.width + 100,100);
  ctx.fillText("Cleared lines:",world.width + 100,200);
  ctx.fillText(total_cleared,world.width + 100,250);
  ctx.fillText("Level:",world.width + 100,300);
  ctx.fillText(freq,world.width + 100,350);
}

function draw_grid(){
  var grid_width = 4;
  ctx.fillStyle = "gray";
  for (var i=0;i<blocks_x; i++){
    ctx.fillRect(i * block_size, 0, grid_width, block_size * blocks_y);
  }
  for (var i=0;i<blocks_y; i++){
    ctx.fillRect(0, i*block_size, block_size * blocks_x, grid_width);
  }

}

function draw_block(x, y){
  ctx.fillRect(x * block_size, y * block_size, block_size, block_size);
}

function heartbeat(){
  if(dropping) {
      return;
  }
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
  add_points(completed_lines.length);
  total_cleared += completed_lines.length;
  freq = Math.floor(total_cleared/10) + increase;
  if (completed_lines.length == 4){
    var snd = new Audio("sounds/TetrisforJeff2.m4a");
    snd.volume=.6;
    snd.play();
  }
  if (completed_lines.length == 3){
    var snd = new Audio("sounds/Tetris2.m4a");
    snd.volume=1.;
    snd.play();
  }
  if (completed_lines.length == 1){
    var snd = new Audio("sounds/TetrisG.m4a");
    snd.volume=.6;
    snd.play();
  }
  if (completed_lines.length == 2){
    var snd = new Audio("sounds/TetrisG.m4a");
    snd.volume=.6;
    snd.play();
    snd.play();
  }
  //alert(freq);
}

function add_points(n_lines){
  points += n_lines * n_lines * 100 * freq;
}

function tetris_dies(){
  add_to_matrix();
  full_line_detection();
  new_tetris();
  var snd = new Audio("sounds/Tetris1.m4a");
  snd.volume=.5;
  snd.play();
}

function new_tetris(){
  if (bag_counter == 5){
    next_bag = shuffle(next_bag);
  }
  if (bag_counter == 7){
    //alert("switch to next bag");
    for (var i=0; i<7;i++){
      current_bag[i] = next_bag[i];
    }

    bag_counter = 0;
  }
  if (bag_counter < 6){
    nb = current_bag[bag_counter+1];
    var npos = tetrii[nb];
    next_tetris = {"id": nb, "x": 5, "y": -1, "pos": npos, "o": 0};
  } else {
    nb = next_bag[0];
    var npos = tetrii[nb];
    next_tetris = {"id": nb, "x": 5, "y": -1, "pos": npos, "o": 0};
  }

  b = current_bag[bag_counter];
  bag_counter += 1;
  var pos = tetrii[b];
  tetris = {"id": b, "x": 5, "y": -1, "pos": pos, "o": 0};
  console.log("New tetris", tetris);
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
  if (matrix_collision(x, y, positions_new)){
    return true;
  }
  return false;
}

function rotated(pos){
  //return pos;
  var tet;
  var new_pos;
  if (tetris.id=="O"){
    return pos;
  }
  if (tetris.id=="I"){
    if (pos[0][0] == 0 && pos[0][1] == 0){
      new_pos = [[-1, 1], [0, 1], [1, 1], [2, 1]];
    }
    else if (pos[0][0] == -1 && pos[0][1] == 1){
      new_pos = [[1, 0], [1, 1], [1, 2], [1, 3]];
    }
    else if (pos[0][0] == 1 && pos[0][1] ==  0){
      new_pos = [[-1, 2], [0, 2], [1, 2], [2, 2]];
    }
    else if (pos[0][0] == -1 && pos[0][1] == 2){
      new_pos = [[0, 0], [0, 1], [0, 2], [0, 3]];
    }
    return new_pos;
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
  var new_pos = rotated(tetris.pos);
  tetris.pos = new_pos;
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

      rot = true;
      //alert(tetris.o);
      break;
    case 32:
      console.log("dropping");
      dropping = true;
      drop_tetris();
      tetris_dies();
      dropping = false;
      console.log("dropping ended");
      return;

  }
  if (collision_detected(future_pos_x, future_pos_y, rot)){
    if (evt.keyCode == 40){
      tetris_dies();
    }
  } else {
    tetris.y = future_pos_y;
    tetris.x = future_pos_x;
    if (rot==true){
      rotate();
    }

  }
}

function drop_tetris() {
    var future_pos_x = tetris.x;
    var future_pos_y = tetris.y;
    while(!collision_detected(future_pos_x, future_pos_y, 0)){
        future_pos_y += 1;
        console.log(future_pos_y);
    }
    tetris.y = future_pos_y - 1;
    console.log("after collision checking in drop");
    console.log(tetris.y);
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

function matrix_collision(x, y, pos_new){
  var positions = pos_new;
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

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}
