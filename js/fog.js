/* ════════════════════════════════════════════════════════════════════
   FOG — shader de niebla, rayos de luna y aurora
   ════════════════════════════════════════════════════════════════════ */
function initFog() {
  const canvas = $('#fog');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) { document.body.classList.add('no-gl'); canvas.remove(); return; }

  const vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const frag = `
  precision mediump float;
  uniform vec2 uRes; uniform float uTime, uScroll; uniform vec2 uMouse;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/uRes; vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y; float t=uTime;
    vec3 col=mix(vec3(.015,.025,.055),vec3(.05,.08,.15),uv.y);
    /* luz de luna desde arriba */
    vec2 L=vec2(0.,.85); float d=length(p-L);
    col+=vec3(.45,.58,.82)*.30/(1.+d*d*4.);
    float ang=atan(p.x-L.x,L.y-p.y);
    float rays=fbm(vec2(ang*5.,t*.07))*fbm(vec2(ang*12.+3.,t*.05+5.));
    col+=vec3(.5,.66,1.)*pow(rays,1.4)*.8*smoothstep(1.9,.1,d);
    /* niebla que se mueve */
    vec2 q=p*1.4+vec2(t*.03,uScroll*.6);
    float f=fbm(q+1.6*fbm(q*1.3+vec2(t*.035,-t*.02)));
    float f2=fbm(p*3.2+vec2(-t*.05,uScroll*1.1));
    vec3 fogc=mix(vec3(.18,.3,.48),vec3(.38,.5,.72),f2);
    col+=fogc*smoothstep(.36,.95,f)*(.6+.55*(1.-uv.y));
    /* aurora violeta-turquesa */
    float y0=.8+.06*sin(p.x*2.2+t*.25)+.03*sin(p.x*5.-t*.4);
    float band=exp(-pow((uv.y-y0)*8.,2.));
    float an=fbm(vec2(p.x*3.+t*.08,t*.05));
    col+=mix(vec3(.12,.6,.62),vec3(.5,.32,.9),an)*band*an*.7;
    /* bruma baja */
    col+=vec3(.2,.3,.46)*smoothstep(.4,0.,uv.y)*(.55+.5*fbm(vec2(p.x*2.+t*.05,t*.03)));
    /* linterna que sigue el dedo / ratón */
    float md=length(p-uMouse); col+=vec3(.4,.6,1.)*.014/(md*md*7.+.06);
    col*=1.-.32*pow(length(uv-.5)*1.3,2.);
    gl_FragColor=vec4(col,1.);
  }`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { document.body.classList.add('no-gl'); canvas.remove(); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uScroll = U('uScroll'), uMouse = U('uMouse');

  const SCALE = MOBILE ? .45 : .6;
  let mouse = [0, -.3], target = [0, -.3];
  const resize = () => {
    canvas.width = Math.round(innerWidth * SCALE); canvas.height = Math.round(innerHeight * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', e => {
    target = [(e.clientX - innerWidth / 2) / innerHeight, (innerHeight / 2 - e.clientY) / innerHeight];
  }, { passive: true });

  const t0 = performance.now();
  (function frame() {
    mouse[0] += (target[0] - mouse[0]) * .06; mouse[1] += (target[1] - mouse[1]) * .06;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform1f(uScroll, DECK.pos * .25);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  })();
}
