import{S as b,P as M,a as v,M as C,D as U,G as z,b as f,V as u,A as D,c as L,O as A,W as F,L as _,g as I,C as W}from"./index-335a9734.js";var w=`varying vec2 vUv;\r
    void main() {\r
      vUv = uv;\r
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\r
}`,V=`uniform vec3      iResolution;           
uniform float     iTime;                 
uniform float     iTimeDelta;            
uniform float     iFrameRate;            
uniform int       iFrame;                
varying vec2 vUv;

#define time iTime

uniform float ratio;

#define PI2 6.28318530718\r
#define PI 3.1416

float vorocloud(vec2 p){\r
	float f = 0.0;\r
    vec2 pp = cos(vec2(p.x * 14.0, (16.0 * p.y + cos(floor(p.x * 30.0)) + time * PI2)) );\r
    p = cos(p * 12.1 + pp * 10.0 + 0.5 * cos(pp.x * 10.0));\r
    \r
    vec2 pts[4];\r
    \r
    pts[0] = vec2(0.5, 0.6);\r
    pts[1] = vec2(-0.4, 0.4);\r
    pts[2] = vec2(0.2, -0.7);\r
    pts[3] = vec2(-0.3, -0.4);\r
    \r
    float d = 5.0;\r
    \r
    for(int i = 0; i < 4; i++){\r
      	pts[i].x += 0.03 * cos(float(i)) + p.x;\r
      	pts[i].y += 0.03 * sin(float(i)) + p.y;\r
    	d = min(d, distance(pts[i], pp));\r
    }\r
    \r
    f = 2.0 * pow(1.0 - 0.3 * d, 13.0);\r
    \r
    f = min(f, 1.0);\r
    \r
	return f;\r
}

vec4 scene(vec2 UV){\r
    float x = UV.x;\r
    float y = UV.y;\r
    \r
    vec2 p = vec2(x, y) - vec2(0.5);\r
    \r
    vec4 col = vec4(0.0);\r
	col.g += 0.02;\r
    \r
    float v = vorocloud(p);\r
    v = 0.2 * floor(v * 5.0);\r
    \r
    col.r += 0.1 * v;\r
    col.g += 0.6 * v;\r
    col.b += 0.5 * pow(v, 5.0);\r
    \r
    \r
    v = vorocloud(p * 2.0);\r
    v = 0.2 * floor(v * 5.0);\r
    \r
    col.r += 0.1 * v;\r
    col.g += 0.2 * v;\r
    col.b += 0.01 * pow(v, 5.0);\r
    \r
    col.a = 1.0;\r
    \r
    return col;\r
}\r

void mainImage( out vec4 fragColor, in vec2 fragCoord )\r
{\r
	vec2 uv = fragCoord.xy / iResolution.xy;\r
	fragColor = scene(uv);\r
}\r
  void main() {\r
    mainImage(gl_FragColor, vUv * iResolution.xy);\r
  }`,G=`uniform vec3      iResolution;           
uniform float     iTime;                 
uniform float     iTimeDelta;            
uniform float     iFrameRate;            
uniform int       iFrame;                
varying vec2 vUv;

precision highp float;\r

mat2 rot(float a) {\r
    float c = cos(a), s = sin(a);\r
    return mat2(c,s,-s,c);\r
}

const float pi = acos(-1.0);\r
const float pi2 = pi*2.0;

vec2 pmod(vec2 p, float r) {\r
    float a = atan(p.x, p.y) + pi/r;\r
    float n = pi2 / r;\r
    a = floor(a/n)*n;\r
    return p*rot(-a);\r
}

float box( vec3 p, vec3 b ) {\r
    vec3 d = abs(p) - b;\r
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));\r
}

float ifsBox(vec3 p) {\r
    for (int i=0; i<5; i++) {\r
        p = abs(p) - 1.0;\r
        p.xy *= rot(iTime*0.3);\r
        p.xz *= rot(iTime*0.1);\r
    }\r
    p.xz *= rot(iTime);\r
    return box(p, vec3(0.4,0.8,0.3));\r
}

float map(vec3 p, vec3 cPos) {\r
    vec3 p1 = p;\r
    p1.x = mod(p1.x-5., 10.) - 5.;\r
    p1.y = mod(p1.y-5., 10.) - 5.;\r
    p1.z = mod(p1.z, 16.)-8.;\r
    p1.xy = pmod(p1.xy, 5.0);\r
    return ifsBox(p1);\r
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {\r
    vec2 p = (fragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec3 cPos = vec3(0.0,0.0, -3.0 * iTime);\r
    
    vec3 cDir = normalize(vec3(0.0, 0.0, -1.0));\r
    vec3 cUp  = vec3(sin(iTime), 1.0, 0.0);\r
    vec3 cSide = cross(cDir, cUp);

    vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir);

    
    float acc = 0.0;\r
    float acc2 = 0.0;\r
    float t = 0.0;\r
    for (int i = 0; i < 99; i++) {\r
        vec3 pos = cPos + ray * t;\r
        float dist = map(pos, cPos);\r
        dist = max(abs(dist), 0.02);\r
        float a = exp(-dist*3.0);\r
        if (mod(length(pos)+24.0*iTime, 30.0) < 3.0) {\r
            a *= 2.0;\r
            acc2 += a;\r
        }\r
        acc += a;\r
        t += dist * 0.5;\r
    }

    vec3 col = vec3(acc * 0.01, acc * 0.011 + acc2*0.002, acc * 0.012+ acc2*0.005);\r
    fragColor = vec4(col, 2.0 - t * 0.03);\r
}\r
  void main() {\r
    mainImage(gl_FragColor, vUv * iResolution.xy);\r
  }`;let g=!1;const m=document.querySelector(".loading-bar"),q=document.querySelector(".frame"),E=new _(()=>{window.setTimeout(()=>{I.to(x.uniforms.uAlpha,{duration:3,value:0}),m.classList.add("ended")},500),window.setTimeout(()=>{g=!0},1e3)},(n,o,s)=>{const l=o/s;m.style.transform=`scaleX(${l})`}),h=document.querySelector("canvas.webgl"),t=new b,H=new M(2,2,1,1),x=new v({transparent:!0,uniforms:{uAlpha:{value:1}},vertexShader:`
        void main(){
            gl_Position = vec4(position , 1.0);
        }
    `,fragmentShader:`
        uniform float uAlpha;

        void main(){
            gl_FragColor = vec4(0.0 , 0.0 , 0.0 ,uAlpha);
        }
    `}),O=new C(H,x);t.add(O);const y=new U;y.setDecoderPath("draco/");const T=new z(E);T.setDRACOLoader(y);const P=new v({side:f,uniforms:{iTime:{value:0},iResolution:{value:new u(window.innerWidth,window.innerHeight,1)}},vertexShader:w,fragmentShader:V}),R=new v({side:f,uniforms:{iTime:{value:0},iResolution:{value:new u(window.innerWidth,window.innerHeight,1)}},vertexShader:w,fragmentShader:G});let a=null;T.load("models/Japan-Shrine/shrine.glb",n=>{t.add(n.scene),a=new D(n.scene);const o=a.clipAction(n.animations[0]),s=n.scene.children.find(d=>d.name==="Portal"),l=n.scene.children.find(d=>d.name==="Portal-Top");s.material=P,l.material=R,o.play()});const e={width:window.innerWidth,height:window.innerHeight};window.addEventListener("resize",()=>{e.width=window.innerWidth,e.height=window.innerHeight,r.aspect=e.width/e.height,r.updateProjectionMatrix(),i.setSize(e.width,e.height),i.setPixelRatio(Math.min(window.devicePixelRatio,2))});const r=new L(45,e.width/e.height,.1,100);r.position.x=-2.7;r.position.y=2.2;r.position.z=2.4;t.add(r);const c=new A(r,h);c.enableDamping=!0;c.enablePan=!1;c.maxDistance=5;const i=new F({canvas:h,antialias:!0});i.setSize(e.width,e.height);i.setPixelRatio(Math.min(window.devicePixelRatio,2));const k=new W;let p=0;const S=()=>{const n=k.getElapsedTime(),o=n-p;p=n,R.uniforms.iTime.value=n,P.uniforms.iTime.value=n,a!==null&&a.update(o),g&&q.classList.add("visible"),c.update(),i.render(t,r),window.requestAnimationFrame(S)};S();
