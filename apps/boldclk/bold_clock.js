var hour_hand = {
  width : 61, height : 8, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////////////w=="))
};
var minute_hand = {
  width : 110, height : 4, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////w=="))
};

//g.fillRect(0,24,239,239); // Apps area
let intervalRef = null;
let digitalRef = null;
let enableSeconds = true;
const p180 = Math.PI/180;
const clock_center = {x:Math.floor((240-1)/2), y:24+Math.floor((239-24)/2)};
// ={ x: 119, y: 131 }
const radius = Math.floor((239-24+1)/2); // =108

let tick0 = Graphics.createArrayBuffer(30,8,1,{msb:true});
tick0.fillRect(0,0,tick0.getWidth()-1, tick0.getHeight()-1);
let tick5 = Graphics.createArrayBuffer(20,6,1,{msb:true});
tick5.fillRect(0,0,tick5.getWidth()-1, tick5.getHeight()-1);
let tick1 = Graphics.createArrayBuffer(8,4,1,{msb:true});
tick1.fillRect(0,0,tick1.getWidth()-1, tick1.getHeight()-1);

function big_wheel_x(angle){
  return clock_center.x + radius * Math.cos(angle*p180);
}
function big_wheel_y(angle){
  return clock_center.y + radius * Math.sin(angle*p180);
}
function rotate_around_x(center_x, angle, tick){
  return center_x + Math.cos(angle*p180) * tick.getWidth()/2;
}
function rotate_around_y(center_y, angle, tick){
  return center_y + Math.sin(angle*p180) * tick.getWidth()/2;
}
function hour_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * hour_hand.width/2;
}
function hour_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * hour_hand.width/2;
}
function minute_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * minute_hand.width/2;
}
function minute_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * minute_hand.width/2;
}
function minute_angle(date){
  //let minutes = date.getMinutes() + date.getSeconds()/60;
  let minutes = date.getMinutes();
  return 6*minutes - 90;
}
function hour_angle(date){
  let hours= date.getHours() + date.getMinutes()/60;
  return 30*hours - 90;
}

function draw_clock(){
  //console.log("draw_clock");
  let date = new Date();
  //g.clear();
  g.setBgColor(0,0,0);
  g.setColor(0,0,0);
  g.fillRect(0,24,239,239); // clear app area
  g.setColor(1,1,1);

  // draw cross lines for testing
  // g.setColor(1,0,0);
  // g.drawLine(clock_center.x - radius, clock_center.y, clock_center.x + radius, clock_center.y);
  // g.drawLine(clock_center.x, clock_center.y - radius, clock_center.x, clock_center.y + radius);

  g.setColor(1,1,1);
  let ticks = [0, 90, 180, 270];
  ticks.forEach((item)=>{
    let agl = item+180;
    g.drawImage(tick0.asImage(), rotate_around_x(big_wheel_x(item), agl, tick0), rotate_around_y(big_wheel_y(item), agl, tick0), {rotate:agl*p180});
  });
  ticks = [30, 60, 120, 150, 210, 240, 300, 330];
  ticks.forEach((item)=>{
    let agl = item+180;
    g.drawImage(tick5.asImage(), rotate_around_x(big_wheel_x(item), agl, tick5), rotate_around_y(big_wheel_y(item), agl, tick5), {rotate:agl*p180});
  });

  let hour_agl = hour_angle(date);
  let minute_agl = minute_angle(date);
  g.drawImage(hour_hand, hour_pos_x(hour_agl), hour_pos_y(hour_agl), {rotate:hour_agl*p180}); //
  g.drawImage(minute_hand, minute_pos_x(minute_agl), minute_pos_y(minute_agl), {rotate:minute_agl*p180}); //
  g.setColor(1,1,1);
  g.fillCircle(clock_center.x, clock_center.y, 6);
  g.setColor(0,0,0);
  g.fillCircle(clock_center.x, clock_center.y, 3);

  // draw minute ticks. Takes long time to draw!
  g.setColor(1,1,1);
  for (var i=0; i<60; i++){
    let agl = i*6+180;
    g.drawImage(tick1.asImage(), rotate_around_x(big_wheel_x(i*6), agl, tick1), rotate_around_y(big_wheel_y(i*6), agl, tick1), {rotate:agl*p180});
  }

  g.flip();
  //console.log(date);
}
function clearTimers(){
  //console.log("clearTimers");
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    //console.log("interval is cleared");
  }
  if(digitalRef) {
    clearInterval(digitalRef);
    digitalRef = null;
  }
}
function startTimers(){
  //console.log("startTimers");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 60*1000);
  if(enableSeconds) {
  digitalRef = setInterval(draw_digital,1000);
  } else {
    if(digitalRef) {
      clearInterval(digitalRef);
      digitalRef = null;
    }
  }
  //console.log("interval is set");
  draw_clock();
  draw_digital();
}

function draw_digital() {
  let date = new Date();
  g.drawString(date.toString().substr(16, 8),10,g.getHeight()-10, true);
  g.flip();
  if(!enableSeconds) {
    g.drawString("        ",10,g.getHeight()-10, true);
    if(digitalRef) {
      clearInterval(digitalRef);
      digitalRef = null;
    }
  }
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    //console.log("lcdPower: on");
    Bangle.drawWidgets();
    startTimers();
  } else {
    //console.log("lcdPower: off");
    clearTimers();
  }
});
Bangle.on('faceUp',function(up){
  //console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
  if (up && !Bangle.isLCDOn()) {
    //console.log("faceUp and LCD off");
    clearTimers();
    Bangle.setLCDPower(true);
  }
});

Bangle.on('accel', function(acc) {
  // acc = {x,y,z,diff,mag}
  if(enableSeconds) {
  g.setColor(0,0,0);
  g.drawCircle(100,100,(acc.z*20)+20);
  g.drawLine(clock_center.x, clock_center.y,clock_center.x-50,clock_center.y);
  g.drawLine(clock_center.x, clock_center.y,clock_center.x+50,clock_center.y);
  g.drawLine(clock_center.x, clock_center.y,clock_center.x,(clock_center.y-50));
  g.drawLine(clock_center.x, clock_center.y,clock_center.x,(clock_center.y+50));
  g.setColor(1,1,1,);
  g.drawCircle(100,100,(acc.z*20)+20);
  g.drawLine(clock_center.x, clock_center.y,(clock_center.x-(acc.x*50)),clock_center.y);
  g.drawLine(clock_center.x, clock_center.y,clock_center.x,(clock_center.y-(acc.y*50)));

  g.drawString("x="+acc.x.toFixed(1)+"y="+acc.y.toFixed(1)+"z="+acc.z.toFixed(1),50,g.getHeight()-80, true);
  g.flip();
  }
});


g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
setWatch(function() {enableSeconds = !enableSeconds; if(enableSeconds) { startTimers(); } },BTN3,true);