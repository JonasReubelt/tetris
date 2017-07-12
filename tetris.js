var canvas;
var ctx;
var block_size = 30;
var blocks_x = 10;
var blocks_y = 20;
var grid_width = 2;
var world = {"width": blocks_x * block_size + grid_width, "height": blocks_y * block_size + grid_width};
var tetrii = {"I": [[0, -2], [0, -1], [0, 0], [0, 1]],
              "T": [[0, 0], [-1, 0], [1, 0], [0, -1]],
              "Z": [[0, 0], [-1, -1], [0, -1], [1, 0]],
              "S": [[0, 0], [-1, 0], [0, -1], [1, -1]],
              "J": [[0, 0], [-1, -1], [-1, 0], [1, 0]],
              "L": [[0, 0], [-1, 0], [1, 0], [1, -1]],
              "O": [[0, -1], [0, 0], [1, -1], [1, 0]]};
var tcolors = {"I": 1, "T": 2, "Z": 3, "S": 4, "J": 5, "L": 6, "O": 7};
var colors = {1: "#12c6bb", 2: "#63009b", 3: "#aa0f11", 4: "#15aa10", 5: "#0d37e5",
              6: "#e9850e", 7: "#d5cf12"};
var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
var drop_color = "#333333"
var sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];
var N_parts = [0, 0, 0, 0, 0, 0, 0];
var freq = 1.;
var level = 1;
var increase = 1.;
var mercy_delay = 1000;
var mercy = false;
var tetris;
var matrix;
var points = 0;
var bag_counter = 0;
var n_set_in_bag = 3;
var current_bag = [];
var next_bag = [];
var tetris_set = ["I", "T", "Z", "S", "J", "L", "O"];
var next_tetris;
var total_cleared = 0;
var fps = 60.;
var fps_counter = 0;
var dropping = false;
var disco = false;
var show_stats = false;
var drought = 0;
var min_show_drought = 10;
var pause = false;
var game_over_theme;
var tetris_theme;
game_is_over = false;

function reset() {
    level = 1;
    freq = 1;
    total_cleared = 0; 
    drought = 0;
    current_bag = [];
    next_bag = [];
    disco = false;
    pause = false;
    points = 0;
    game_is_over = false;
    game_over_theme.pause();
    tetris_theme.play();
}

window.onload = function() {
    init();
    canvas = document.getElementById("canvas");
    canvas.width = world.width*2 ;
    canvas.height = world.height;
    ctx = canvas.getContext("2d");
    setInterval(update, 1000./fps);
    //setInterval(heartbeat, 1000./freq);
    document.addEventListener("keydown", keyDown);
    setup_music();
    tetris_theme.play();
}

function setup_music() {
    tetris_theme = new Audio('sounds/Tetristitle.m4a');
    tetris_theme.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
    }, false);
    tetris_theme.volume = 0.5;

    game_over_theme = new Audio('sounds/gameover.m4a');
    game_over_theme.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    game_over_theme.volume = 1.0;
}

function update(){

  draw_canvas();
  draw_matrix();
  draw_tetris();
  draw_grid();
  draw_next_tetris();
  draw_points();
  if(show_stats){
    draw_stats();
  }
  if (drought >= min_show_drought){
    draw_drought();
  }
  if(game_is_over) {
    ctx.font = "40px Courier";
    ctx.fillStyle = 'pink';
    ctx.fillText("GAME OVER", world.width/2 - 110, world.height/2 - 3);
  }
  if (fps_counter>=fps){
    heartbeat();
    fps_counter = 0;
  }
  fps_counter += freq;
}

function init(){
  create_bags();
  new_tetris();
  matrix = zeros([blocks_y, blocks_x]);

}

function create_bags(){
  for(var i=0; i<n_set_in_bag;i++){
    current_bag.push.apply(current_bag, tetris_set);
    next_bag.push.apply(next_bag, tetris_set);
  }
  current_bag = shuffle(current_bag);
  next_bag = shuffle(next_bag);

}

function draw_canvas(){
  ctx.lineWidth = '5';
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.fillRect(0, 0, canvas.width/2 + grid_width, canvas.height + grid_width);
  ctx.fillStyle = 'white';
  ctx.fillRect(canvas.width/2, 0, canvas.width + grid_width, canvas.height + grid_width);
}

function draw_tetris(){
  var positions = tetris.pos;
  var future_pos_x = tetris.x;
  var future_pos_y = tetris.y;
  while(!collision_detected(future_pos_x, future_pos_y, 0)) {
      future_pos_y += 1;
  }
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(future_pos_x + pos[0], future_pos_y - 1 + pos[1], block_size, drop_color);
  }
  var c = tetris_color();
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(tetris.x + pos[0], tetris.y + pos[1], block_size, c);
  }
}

function draw_stats(){
  draw_pos = [0, 1, 2, 3, 4, 5, 6];
  x_offset = 10.8;
  for (var t=0;t<7;t++){
    var id = tetris_set[t];
    var c = colors[tcolors[id]];
    ctx.fillStyle = c;
    var positions = tetrii[id];
    for (var i=0; i<4; i++){
      var pos = positions[i];
      ctx.fillRect((draw_pos[t] + x_offset + pos[0]/3 + t/3) * block_size, (18 + pos[1]/3) * block_size, block_size/3, block_size/3);

    }
    ctx.font = "20px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText(N_parts[t],(draw_pos[t] + x_offset + t/3)* block_size,(19.7 ) * block_size);
  }
  ctx.fillStyle = "gray";
  ctx.fillRect(world.width, world.height - grid_width - 100, world.width*2, grid_width);
}

function draw_drought(){
  ctx.font = "20px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText("Long bar drought:",world.width + 50 ,480);
  ctx.fillText(drought ,world.width + 230 ,480);
}

function draw_next_tetris(){
  var c = colors[tcolors[next_tetris.id]];
  var positions = next_tetris.pos;
  for (var i=0; i<4; i++){
    var pos = positions[i];
    draw_block(14 + pos[0], 13 + pos[1], block_size, c);
  }
}

function draw_points(){
  var p = points.toString();
  var x_offset = 70;
  ctx.font = "20px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText("Points:",world.width + x_offset,50);
  ctx.fillText(p,world.width + x_offset,100);
  ctx.fillText("Cleared lines:",world.width + x_offset,150);
  ctx.fillText(total_cleared,world.width + x_offset,200);
  ctx.fillText("Level:",world.width + x_offset,250);
  ctx.fillText(level,world.width + x_offset,300);
}

function draw_grid(){
  ctx.fillStyle = "gray";
  for (var i=0;i<blocks_x+1; i++){
    ctx.fillRect(i * block_size, 0, grid_width, block_size * blocks_y + grid_width);
  }
  for (var i=0;i<blocks_y+1; i++){
    ctx.fillRect(0, i*block_size, block_size * blocks_x + grid_width, grid_width);
  }
  ctx.fillRect(world.width, 0, world.width*2, grid_width);
  ctx.fillRect(world.width*2 - grid_width, 0, grid_width, world.height);
  ctx.fillRect(world.width, world.height - grid_width, world.width*2, grid_width);
}

function draw_block(x, y, bs, color){
  if(disco) {
      color = '#'+Math.floor(Math.random()*16777215).toString(16);
  }
  if(pause) {
     color = shadeBlend(-0.5, color);
  }
  ctx.fillStyle = color;
  ctx.fillRect(x * bs, y * bs, bs, bs);
}

function heartbeat(){
  if(dropping || pause) {
      return;
  }
  var future_pos_y = tetris.y + 1;
  if (collision_detected(tetris.x, future_pos_y)){
    tetris_dies();

    // mercy = true;
    // setTimeout(function() {
    //     tetris_dies();
    //     mercy = false;
    // }, mercy_delay);

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
  if(Math.floor(total_cleared/10) - level >= 0) {
      level_up();
  }

  freq = Math.floor(total_cleared/10) + increase;
  if (completed_lines.length == 4){
    play_sound("sounds/TetrisforJeff2.m4a", .6);
  }
  if (completed_lines.length == 3){
    play_sound("sounds/Tetris2.m4a", 1.);
  }
  if (completed_lines.length == 1){
    play_sound("sounds/TetrisG.m4a", .6);
  }
  if (completed_lines.length == 2){
    play_sound("sounds/Tetrisggwp.m4a", .8);
  }
  //alert(freq);
}

function play_sound(filename, volume){
  var snd = new Audio(filename);
  snd.volume=volume;
  snd.play();
}

function level_up() {
    level += 1;
    play_sound("sounds/levelup.m4a", .8);
}

function add_points(n_lines){
  points += n_lines * n_lines * 100 * freq;
}

function tetris_dies(){
  if(tetris.y <= 0) {
  // if(tetris.y <= 0 && !mercy) {
      game_over();
      return;
  }
  add_to_matrix();
  full_line_detection();
  new_tetris();
  play_sound("sounds/Tetris1.m4a", .5);
}

function new_tetris(){
  if (bag_counter == 5){
    next_bag = shuffle(next_bag);
  }
  if (bag_counter == n_set_in_bag * 7){
    //alert("switch to next bag");
    for (var i=0; i<n_set_in_bag * 7;i++){
      current_bag[i] = next_bag[i];
    }

    bag_counter = 0;
  }
  if (bag_counter < n_set_in_bag * 7 - 1){
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
  if (b != "I"){
    drought += 1;
  }
  if (b == "I"){
    drought =0;
  }
  tetris = {"id": b, "x": 5, "y": -1, "pos": pos, "o": 0};
  N_parts[tcolors[b]-1] += 1;
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
    if (pos[0][0] == 0 && pos[0][1] == -2){
      new_pos = [[-1, -1], [0, -1], [1, -1], [2, -1]];
    }
    else if (pos[0][0] == -1 && pos[0][1] == -1){
      new_pos = [[1, -2], [1, -1], [1, 0], [1, 1]];
    }
    else if (pos[0][0] == 1 && pos[0][1] ==  -2){
      new_pos = [[-1, 0], [0, 0], [1, 0], [2, 0]];
    }
    else if (pos[0][0] == -1 && pos[0][1] == 0){
      new_pos = [[0, -2], [0, -1], [0, 0], [0, 1]];
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
  if(pause && evt.keyCode != 80) {
      return;
  }
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
    case 68: // d
      disco = !disco;
      break;
    case 80:
      toggle_pause();
      return;
    case 82: // r
      reset();
      init();
      return;
    case 83: // s
      show_stats = !show_stats;
      break;

    case 49: // 1
      load_scenario(1);
      return

    case 50: // 2
      load_scenario(2);
      return

  }
  if (collision_detected(future_pos_x, future_pos_y, rot)){
    if(rot) {
        left = tetris.x - 1;
        more_left = tetris.x - 2;
        right = tetris.x + 1;
        more_right = tetris.x + 2;
        if(!collision_detected(left, future_pos_y, rot)) {
            tetris.y = future_pos_y;
            tetris.x = left;
            rotate();
            play_sound("sounds/Shift.m4a", 0.3);
            return;
        }
        if(!collision_detected(right, future_pos_y, rot)) {
            tetris.y = future_pos_y;
            tetris.x = right;
            rotate();
            play_sound("sounds/Shift.m4a", 0.3);
            return;
        }
        if(tetris.id == "I") {
            if(!collision_detected(more_left, future_pos_y, rot)) {
                tetris.y = future_pos_y;
                tetris.x = more_left;
                rotate();
                play_sound("sounds/Shift.m4a", 0.3);
                return;
            }
            if(!collision_detected(more_right, future_pos_y, rot)) {
                tetris.y = future_pos_y;
                tetris.x = more_right;
                rotate();
                play_sound("sounds/Shift.m4a", 0.3);
                return;
            }
        }
    }

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
    play_sound("sounds/Tetrisdrop.m4a", .35);
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
        var c = shadeBlend(0.62, colors[matrix[i][j]]);
        draw_block(j, i, block_size, c);
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

function toggle_pause() {
    pause = !pause;
}

function game_over() {
    tetris_theme.pause();
    game_over_theme.play();

    game_is_over = true;

    disco = true;
    freq = 0;
}

function load_scenario(n) {
    reset();
    init();
    matrix = scenarios[1];
}

function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
}

