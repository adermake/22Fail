import{D as _t,E as bt,G as St,J as Bt,K as At,L as T,M as O,N as It,a as dt,i as vt,l as yt,m as gt,n as wt}from"./chunk-5INFABMY.js";import{a as z}from"./chunk-DAQOROHW.js";var E=new Set,q=!1;function Q(e,r,t=2){let n=r&&r.length,i=n?r[0]*t:e.length;E.size&&E.clear();let o=zt(e,0,i,t,!0),s=[];if(!o||o.next===o.prev)return s;let u=0,a=0,l=0;if(n&&(o=ye(e,r,o,t)),e.length>80*t){u=e[0],a=e[1];let f=u,v=a;for(let p=t;p<i;p+=t){let h=e[p],x=e[p+1];h<u&&(u=h),x<a&&(a=x),h>f&&(f=h),x>v&&(v=x)}l=Math.max(f-u,v-a),l=l!==0?32767/l:0}return tt(o,s,u,a,l),s}function zt(e,r,t,n,i){let o=null;if(i===Te(e,r,t,n)>0)for(let s=r;s<t;s+=n)o=Pt(s/n|0,e[s],e[s+1],o);else for(let s=t-n;s>=r;s-=n)o=Pt(s/n|0,e[s],e[s+1],o);return o&&V(o,o.next)&&(R(o),o=o.next),o}function M(e,r=e){let t=r===e,n=e,i;do i=!1,n!==n.next&&(E.size===0||!E.has(n))&&(V(n,n.next)||w(n.prev,n,n.next)===0)?((t||n===r)&&(r=n.prev),q=!0,R(n),n=n.prev,i=!0):(t||n!==r)&&(n=n.next,i=!t);while(i||n!==r);return r}function tt(e,r,t,n,i){i&&Ae(e,t,n,i);let o=e,s=!1;for(;e.prev!==e.next;){let u=e.prev,a=e.next;if(w(u,e,a)<0&&(i?me(e,t,n,i):pe(e))){r.push(u.i,e.i,a.i),R(e),e=a,o=a;continue}if(e=a,e===o){if(q=!1,e=M(e),q){o=e;continue}if(!s){e=de(e,r),o=e,s=!0;continue}ve(e,r,t,n,i);break}}}function pe(e){let r=e.prev,t=e,n=e.next,i=r.x,o=t.x,s=n.x,u=r.y,a=t.y,l=n.y,f=Math.min(i,o,s),v=Math.min(u,a,l),p=Math.max(i,o,s),h=Math.max(u,a,l),x=n.next;for(;x!==r;){if(x.x>=f&&x.x<=p&&x.y>=v&&x.y<=h&&!(i===x.x&&u===x.y)&&K(i,u,o,a,s,l,x.x,x.y)&&w(x.prev,x,x.next)>=0)return!1;x=x.next}return!0}function me(e,r,t,n){let i=e.prev,o=e,s=e.next,u=i.x,a=o.x,l=s.x,f=i.y,v=o.y,p=s.y,h=Math.min(u,a,l),x=Math.min(f,v,p),y=Math.max(u,a,l),b=Math.max(f,v,p),_=it(h,x,r,t,n),c=it(y,b,r,t,n),d=e.prevZ;for(;d&&d.z>=_;){if(d.x>=h&&d.x<=y&&d.y>=x&&d.y<=b&&d!==s&&!(u===d.x&&f===d.y)&&K(u,f,a,v,l,p,d.x,d.y)&&w(d.prev,d,d.next)>=0)return!1;d=d.prevZ}let m=e.nextZ;for(;m&&m.z<=c;){if(m.x>=h&&m.x<=y&&m.y>=x&&m.y<=b&&m!==s&&!(u===m.x&&f===m.y)&&K(u,f,a,v,l,p,m.x,m.y)&&w(m.prev,m,m.next)>=0)return!1;m=m.nextZ}return!0}function de(e,r){let t=e,n=!1;do{let i=t.prev,o=t.next.next;kt(i,t,t.next,o,!1)&&D(i,o)&&D(o,i)&&(r.push(i.i,t.i,o.i),R(t),R(t.next),t=e=o,n=!0),t=t.next}while(t!==e);return n?M(t):t}function ve(e,r,t,n,i){let o=e;do{let s=o.next.next;for(;s!==o.prev;){if(o.i!==s.i&&Ue(o,s)){let u=Gt(o,s);o=M(o,o.next),u=M(u,u.next),tt(o,r,t,n,i),tt(u,r,t,n,i);return}s=s.next}o=o.next}while(o!==e)}var et=!1;function ye(e,r,t,n){let i=[];for(let o=0,s=r.length;o<s;o++){let u=r[o]*n,a=o<s-1?r[o+1]*n:e.length,l=zt(e,u,a,n,!1);l===l.next&&E.add(l),i.push(Me(l))}i.sort(ge),_e(e.length/n,r.length),Ct(t,t),et=!0;for(let o=0;o<i.length;o++)t=we(i[o],t);return et=!1,M(t)}function ge(e,r){return e.x-r.x||e.y-r.y||(e.next.y-e.y)/(e.next.x-e.x)-(r.next.y-r.y)/(r.next.x-r.x)}function we(e,r){let t=Se(e,r);if(!t)return r;let n=Gt(t,e),i=n.next;return Ct(t,i.next),M(n,n.next),M(t,t.next)}var Tt=16,g=new Float64Array(0),Y=0,rt=[],nt=[];function _e(e,r){let t=Math.ceil((e+2*r)/Tt)+r+2;g.length<t*4&&(g=new Float64Array(t*4)),Y=0}function Ct(e,r){let t=e;do{let n=Y++;rt[n]=t;let i=1/0,o=1/0,s=-1/0,u=-1/0,a=0;do{let f=t.next;t.z=n,t.x<i&&(i=t.x),t.x>s&&(s=t.x),t.y<o&&(o=t.y),t.y>u&&(u=t.y),f.x<i&&(i=f.x),f.x>s&&(s=f.x),f.y<o&&(o=f.y),f.y>u&&(u=f.y),t=f}while(++a<Tt&&t!==r);nt[n]=t;let l=n*4;g[l]=i,g[l+1]=o,g[l+2]=s,g[l+3]=u}while(t!==r)}function be(e,r){let t=e.z*4;r.x<g[t]&&(g[t]=r.x),r.y<g[t+1]&&(g[t+1]=r.y),r.x>g[t+2]&&(g[t+2]=r.x),r.y>g[t+3]&&(g[t+3]=r.y)}function Mt(e){let r=nt[e];for(;r.prev.next!==r;)r=r.next;return nt[e]=r,r}function Ut(e){let r=rt[e];for(;r.prev.next!==r;)r=r.next;return rt[e]=r,r}function Se(e,r){let t=r,n=e.x,i=e.y,o=-1/0,s;if(V(e,t))return t;for(let p=0,h=0;p<Y;p++,h+=4){if(i<g[h+1]||i>g[h+3]||g[h]>n||g[h+2]<=o)continue;let x=Mt(p);t=Ut(p);do{if(t.prev.next===t){if(V(e,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let y=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(y<=n&&y>o&&(o=y,s=t.x<t.next.x?t:t.next,y===n))return s}}t=t.next}while(t!==x)}if(!s)return null;let u=s.x,a=s.y,l=Math.min(i,a),f=Math.max(i,a),v=1/0;for(let p=0,h=0;p<Y;p++,h+=4){if(g[h+2]<u||g[h]>n||g[h+3]<l||g[h+1]>f)continue;let x=Mt(p);t=Ut(p);do{if(t.prev.next===t&&n>=t.x&&t.x>=u&&n!==t.x&&K(i<a?n:o,i,u,a,i<a?o:n,i,t.x,t.y)){let y=Math.abs(i-t.y)/(n-t.x);(D(t,e)||t.y===i&&t.next.y===i&&t.next.x>n)&&(y<v||y===v&&(t.x>s.x||t.x===s.x&&Be(s,t)))&&(s=t,v=y)}t=t.next}while(t!==x)}return s}function Be(e,r){return w(e.prev,e,r.prev)<0&&w(r.next,e,e.next)<0}var S=[],C=[],I=new Uint32Array(0),k=new Uint32Array(0),G=new Uint32Array(256);function Ae(e,r,t,n){let i=e,o=0;do i.z=it(i.x,i.y,r,t,n),S[o++]=i,i=i.next;while(i!==e);Ie(o);let s=null;for(let u=0;u<o;u++){let a=S[u];a.prevZ=s,s&&(s.nextZ=a),s=a}s.nextZ=null}function Ie(e){if(e<=32){for(let r=1;r<e;r++){let t=S[r],n=t.z,i=r-1;for(;i>=0&&S[i].z>n;)S[i+1]=S[i],i--;S[i+1]=t}return}I.length<e&&(I=new Uint32Array(e),k=new Uint32Array(e),C=new Array(e));for(let r=0;r<e;r++)I[r]=S[r].z;N(e,S,I,C,k,0),N(e,C,k,S,I,8),N(e,S,I,C,k,16),N(e,C,k,S,I,24)}function N(e,r,t,n,i,o){G.fill(0);for(let u=0;u<e;u++)G[t[u]>>>o&255]++;let s=0;for(let u=0;u<256;u++){let a=G[u];G[u]=s,s+=a}for(let u=0;u<e;u++){let a=t[u],l=G[a>>>o&255]++;n[l]=r[u],i[l]=a}}function it(e,r,t,n,i){return e=(e-t)*i|0,r=(r-n)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e|r<<1}function Me(e){let r=e,t=e;do(r.x<t.x||r.x===t.x&&r.y<t.y)&&(t=r),r=r.next;while(r!==e);return t}function K(e,r,t,n,i,o,s,u){return(i-s)*(r-u)>=(e-s)*(o-u)&&(e-s)*(n-u)>=(t-s)*(r-u)&&(t-s)*(o-u)>=(i-s)*(n-u)}function Ue(e,r){let t=V(e,r)&&w(e.prev,e,e.next)>0&&w(r.prev,r,r.next)>0;return e.next.i!==r.i&&(t||D(e,r)&&D(r,e)&&(w(e.prev,e,r.prev)!==0||w(e,r.prev,r)!==0))&&!Pe(e,r)&&(t||ze(e,r))}function w(e,r,t){return(r.y-e.y)*(t.x-r.x)-(r.x-e.x)*(t.y-r.y)}function V(e,r){return e.x===r.x&&e.y===r.y}function kt(e,r,t,n,i=!0){let o=w(e,r,t),s=w(e,r,n),u=w(t,n,e),a=w(t,n,r);return(o>0&&s<0||o<0&&s>0)&&(u>0&&a<0||u<0&&a>0)?!0:i?!!(o===0&&W(e,t,r)||s===0&&W(e,n,r)||u===0&&W(t,e,n)||a===0&&W(t,r,n)):!1}function W(e,r,t){return r.x<=Math.max(e.x,t.x)&&r.x>=Math.min(e.x,t.x)&&r.y<=Math.max(e.y,t.y)&&r.y>=Math.min(e.y,t.y)}function Pe(e,r){let t=Math.min(e.x,r.x),n=Math.max(e.x,r.x),i=Math.min(e.y,r.y),o=Math.max(e.y,r.y),s=e;do{let u=s.next;if(s.x>n&&u.x>n||s.x<t&&u.x<t||s.y>o&&u.y>o||s.y<i&&u.y<i){s=u;continue}if(s.i!==e.i&&u.i!==e.i&&s.i!==r.i&&u.i!==r.i&&kt(s,u,e,r))return!0;s=u}while(s!==e);return!1}function D(e,r){return w(e.prev,e,e.next)<0?w(e,r,e.next)>=0&&w(e,e.prev,r)>=0:w(e,r,e.prev)<0||w(e,e.next,r)<0}function ze(e,r){let t=e,n=!1,i=(e.x+r.x)/2,o=(e.y+r.y)/2;do{let s=t.next;t.y>o!=s.y>o&&i<(s.x-t.x)*(o-t.y)/(s.y-t.y)+t.x&&(n=!n),t=s}while(t!==e);return n}function Gt(e,r){let t=ot(e.i,e.x,e.y),n=ot(r.i,r.x,r.y),i=e.next,o=r.prev;return e.next=r,r.prev=e,t.next=i,i.prev=t,n.next=t,t.prev=n,o.next=n,n.prev=o,n}function Pt(e,r,t,n){let i=ot(e,r,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function R(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ),et&&be(e.prev,e.next)}function ot(e,r,t){return{i:e,x:r,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null}}function Te(e,r,t,n){let i=0;for(let o=r,s=t-n;o<t;o+=n)i+=(e[s]-e[o])*(e[o+1]+e[s+1]),s=o;return i}var Xe=Q.default||Q;function st(e,r,t){if(e)for(let n in e){let i=n.toLocaleLowerCase(),o=r[i];if(o){let s=e[n];n==="header"&&(s=s.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),t&&o.push(`//----${t}----//`),o.push(s)}else gt(`${n} placement hook does not exist in shader`)}}var Ce=/\{\{(.*?)\}\}/g;function ut(e){let r={};return(e.match(Ce)?.map(n=>n.replace(/[{()}]/g,""))??[]).forEach(n=>{r[n]=[]}),r}function Et(e,r){let t,n=/@in\s+([^;]+);/g;for(;(t=n.exec(e))!==null;)r.push(t[1])}function at(e,r,t=!1){let n=[];Et(r,n),e.forEach(u=>{u.header&&Et(u.header,n)});let i=n;t&&i.sort();let o=i.map((u,a)=>`       @location(${a}) ${u},`).join(`
`),s=r.replace(/@in\s+[^;]+;\s*/g,"");return s=s.replace("{{in}}",`
${o}
`),s}function Vt(e,r){let t,n=/@out\s+([^;]+);/g;for(;(t=n.exec(e))!==null;)r.push(t[1])}function ke(e){let t=/\b(\w+)\s*:/g.exec(e);return t?t[1]:""}function Ge(e){let r=/@.*?\s+/g;return e.replace(r,"")}function Dt(e,r){let t=[];Vt(r,t),e.forEach(a=>{a.header&&Vt(a.header,t)});let n=0,i=t.sort().map(a=>a.indexOf("builtin")>-1?a:`@location(${n++}) ${a}`).join(`,
`),o=t.sort().map(a=>`       var ${Ge(a)};`).join(`
`),s=`return VSOutput(
            ${t.sort().map(a=>` ${ke(a)}`).join(`,
`)});`,u=r.replace(/@out\s+[^;]+;\s*/g,"");return u=u.replace("{{struct}}",`
${i}
`),u=u.replace("{{start}}",`
${o}
`),u=u.replace("{{return}}",`
${s}
`),u}function lt(e,r){let t=e;for(let n in r){let i=r[n];i.join(`
`).length?t=t.replace(`{{${n}}}`,`//-----${n} START-----//
${i.join(`
`)}
//----${n} FINISH----//`):t=t.replace(`{{${n}}}`,"")}return t}var A=Object.create(null),ct=new Map,Ee=0;function Rt({template:e,bits:r}){let t=Ft(e,r);if(A[t])return A[t];let{vertex:n,fragment:i}=Ve(e,r);return A[t]=Ht(n,i,r),A[t]}function $t({template:e,bits:r}){let t=Ft(e,r);return A[t]||(A[t]=Ht(e.vertex,e.fragment,r)),A[t]}function Ve(e,r){let t=r.map(s=>s.vertex).filter(s=>!!s),n=r.map(s=>s.fragment).filter(s=>!!s),i=at(t,e.vertex,!0);i=Dt(t,i);let o=at(n,e.fragment,!0);return{vertex:i,fragment:o}}function Ft(e,r){return r.map(t=>(ct.has(t)||ct.set(t,Ee++),ct.get(t))).sort((t,n)=>t-n).join("-")+e.vertex+e.fragment}function Ht(e,r,t){let n=ut(e),i=ut(r);return t.forEach(o=>{st(o.vertex,n,o.name),st(o.fragment,i,o.name)}),{vertex:lt(e,n),fragment:lt(r,i)}}var jt=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,Zt=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,Nt=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,Wt=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`;var Yt={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}};var Kt={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};function Qt({bits:e,name:r}){let t=Rt({template:{fragment:Zt,vertex:jt},bits:[Yt,...e]});return St.from({name:r,vertex:{source:t.vertex,entryPoint:"main"},fragment:{source:t.fragment,entryPoint:"main"}})}function Xt({bits:e,name:r}){return new bt(z({name:r},$t({template:{vertex:Nt,fragment:Wt},bits:[Kt,...e]})))}var Lt={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},Jt={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}};var ft={};function De(e){let r=[];if(e===1)r.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),r.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let t=0;for(let n=0;n<e;n++)r.push(`@group(1) @binding(${t++}) var textureSource${n+1}: texture_2d<f32>;`),r.push(`@group(1) @binding(${t++}) var textureSampler${n+1}: sampler;`)}return r.join(`
`)}function Re(e){let r=[];if(e===1)r.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{r.push("switch vTextureId {");for(let t=0;t<e;t++)t===e-1?r.push("  default:{"):r.push(`  case ${t}:{`),r.push(`      outColor = textureSampleGrad(textureSource${t+1}, textureSampler${t+1}, vUV, uvDx, uvDy);`),r.push("      break;}");r.push("}")}return r.join(`
`)}function Ot(e){return ft[e]||(ft[e]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${De(e)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${Re(e)}
            `}}),ft[e]}var xt={};function $e(e){let r=[];for(let t=0;t<e;t++)t>0&&r.push("else"),t<e-1&&r.push(`if(vTextureId < ${t}.5)`),r.push("{"),r.push(`	outColor = texture(uTextures[${t}], vUV);`),r.push("}");return r.join(`
`)}function qt(e){return xt[e]||(xt[e]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${e}];

            `,main:`

                ${$e(e)}
            `}}),xt[e]}var te={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},ee={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};var $=class{constructor(r){typeof r=="number"?this.rawBinaryData=new ArrayBuffer(r):r instanceof Uint8Array?this.rawBinaryData=r.buffer:this.rawBinaryData=r,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(r){return this[`${r}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(r){switch(r){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw new Error(`${r} isn't a valid view type`)}}};function ht(e,r,t,n){if(t??(t=0),n??(n=Math.min(e.byteLength-t,r.byteLength)),!(t&7)&&!(n&7)){let i=n/8;new Float64Array(r,0,i).set(new Float64Array(e,t,i))}else if(!(t&3)&&!(n&3)){let i=n/4;new Float32Array(r,0,i).set(new Float32Array(e,t,i))}else new Uint8Array(r).set(new Uint8Array(e,t,n))}var re={normal:"normal-npm",add:"add-npm",screen:"screen-npm"},Fe=(e=>(e[e.DISABLED=0]="DISABLED",e[e.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",e[e.MASK_ACTIVE=2]="MASK_ACTIVE",e[e.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",e[e.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",e[e.NONE=5]="NONE",e))(Fe||{});function pt(e,r){return r.alphaMode==="no-premultiply-alpha"&&re[e]||e}var He=["precision mediump float;","void main(void){","float test = 0.1;","%forloop%","gl_FragColor = vec4(0.0);","}"].join(`
`);function je(e){let r="";for(let t=0;t<e;++t)t>0&&(r+=`
else `),t<e-1&&(r+=`if(test == ${t}.0){}`);return r}function ne(e,r){if(e===0)throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let t=r.createShader(r.FRAGMENT_SHADER);try{for(;;){let n=He.replace(/%forloop%/gi,je(e));if(r.shaderSource(t,n),r.compileShader(t),!r.getShaderParameter(t,r.COMPILE_STATUS))e=e/2|0;else break}}finally{r.deleteShader(t)}return e}var U=null;function ie(){if(U)return U;let e=_t();return U=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),U=ne(U,e),e.getExtension("WEBGL_lose_context")?.loseContext(),U}var X=class{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let r=0;r<this.count;r++){let t=this.textures[r];this.textures[r]=null,this.ids[t.uid]=null}this.count=0}};var mt=class{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new X,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}},H=[],L=0;wt.register({clear:()=>{if(H.length>0)for(let e of H)e&&e.destroy();H.length=0,L=0}});function oe(){return L>0?H[--L]:new mt}function se(e){e.elements=null,H[L++]=e}var F=0,Ze=(()=>{let e=class ue{constructor(t){this.uid=vt("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],t=z(z({},ue.defaultOptions),t),t.maxTextures||(yt("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),t.maxTextures=ie());let{maxTextures:n,attributesInitialSize:i,indicesInitialSize:o}=t;this.attributeBuffer=new $(i*4),this.indexBuffer=new Uint16Array(o),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let t=0;t<this.batchIndex;t++)se(this.batches[t]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(t){this._elements[this.elementSize++]=t,t._indexStart=this.indexSize,t._attributeStart=this.attributeSize,t._batcher=this,this.indexSize+=t.indexSize,this.attributeSize+=t.attributeSize*this.vertexSize}checkAndUpdateTexture(t,n){let i=t._batch.textures.ids[n._source.uid];return!i&&i!==0?!1:(t._textureId=i,t.texture=n,!0)}updateElement(t){this.dirty=!0;let n=this.attributeBuffer;t.packAsQuad?this.packQuadAttributes(t,n.float32View,n.uint32View,t._attributeStart,t._textureId):this.packAttributes(t,n.float32View,n.uint32View,t._attributeStart,t._textureId)}break(t){let n=this._elements;if(!n[this.elementStart])return;let i=oe(),o=i.textures;o.clear();let s=n[this.elementStart],u=pt(s.blendMode,s.texture._source),a=s.topology;this.attributeSize*4>this.attributeBuffer.size&&this._resizeAttributeBuffer(this.attributeSize*4),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let l=this.attributeBuffer.float32View,f=this.attributeBuffer.uint32View,v=this.indexBuffer,p=this._batchIndexSize,h=this._batchIndexStart,x="startBatch",y=[],b=this.maxTextures;for(let _=this.elementStart;_<this.elementSize;++_){let c=n[_];n[_]=null;let m=c.texture._source,B=pt(c.blendMode,m),P=u!==B||a!==c.topology;if(m._batchTick===F&&!P){c._textureId=m._textureBindLocation,p+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,l,f,c._attributeStart,c._textureId),this.packQuadIndex(v,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,l,f,c._attributeStart,c._textureId),this.packIndex(c,v,c._indexStart,c._attributeStart/this.vertexSize)),c._batch=i,y.push(c);continue}m._batchTick=F,(o.count>=b||P)&&(this._finishBatch(i,h,p-h,o,u,a,t,x,y),x="renderBatch",h=p,u=B,a=c.topology,i=oe(),o=i.textures,o.clear(),y=[],++F),c._textureId=m._textureBindLocation=o.count,o.ids[m.uid]=o.count,o.textures[o.count++]=m,c._batch=i,y.push(c),p+=c.indexSize,c.packAsQuad?(this.packQuadAttributes(c,l,f,c._attributeStart,c._textureId),this.packQuadIndex(v,c._indexStart,c._attributeStart/this.vertexSize)):(this.packAttributes(c,l,f,c._attributeStart,c._textureId),this.packIndex(c,v,c._indexStart,c._attributeStart/this.vertexSize))}o.count>0&&(this._finishBatch(i,h,p-h,o,u,a,t,x,y),h=p,++F),this.elementStart=this.elementSize,this._batchIndexStart=h,this._batchIndexSize=p}_finishBatch(t,n,i,o,s,u,a,l,f){t.gpuBindGroup=null,t.bindGroup=null,t.action=l,t.batcher=this,t.textures=o,t.blendMode=s,t.topology=u,t.start=n,t.size=i,t.elements=f,++F,this.batches[this.batchIndex++]=t,a.add(t)}finish(t){this.break(t)}ensureAttributeBuffer(t){t*4<=this.attributeBuffer.size||this._resizeAttributeBuffer(t*4)}ensureIndexBuffer(t){t<=this.indexBuffer.length||this._resizeIndexBuffer(t)}_resizeAttributeBuffer(t){let n=Math.max(t,this.attributeBuffer.size*2),i=new $(n);ht(this.attributeBuffer.rawBinaryData,i.rawBinaryData),this.attributeBuffer=i}_resizeIndexBuffer(t){let n=this.indexBuffer,i=Math.max(t,n.length*1.5);i+=i%2;let o=i>65535?new Uint32Array(i):new Uint16Array(i);if(o.BYTES_PER_ELEMENT!==n.BYTES_PER_ELEMENT)for(let s=0;s<n.length;s++)o[s]=n[s];else ht(n.buffer,o.buffer);this.indexBuffer=o}packQuadIndex(t,n,i){t[n]=i+0,t[n+1]=i+1,t[n+2]=i+2,t[n+3]=i+0,t[n+4]=i+2,t[n+5]=i+3}packIndex(t,n,i,o){let s=t.indices,u=t.indexSize,a=t.indexOffset,l=t.attributeOffset;for(let f=0;f<u;f++)n[i++]=o+s[f+a]-l}destroy(t={}){if(this.batches!==null){for(let n=0;n<this.batchIndex;n++)se(this.batches[n]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,t.shader&&(this.shader?.destroy(),this.shader=null);for(let n=0;n<this._elements.length;n++)this._elements[n]&&(this._elements[n]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};return e.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6},e})(),ae=Ze;var Ne=new Float32Array(1),We=new Uint32Array(1),J=class extends It{constructor(){let t=new O({data:Ne,label:"attribute-batch-buffer",usage:T.VERTEX|T.COPY_DST,shrinkToFit:!1}),n=new O({data:We,label:"index-batch-buffer",usage:T.INDEX|T.COPY_DST,shrinkToFit:!1}),i=24;super({attributes:{aPosition:{buffer:t,format:"float32x2",stride:i,offset:0},aUV:{buffer:t,format:"float32x2",stride:i,offset:8},aColor:{buffer:t,format:"unorm8x4",stride:i,offset:16},aTextureIdAndRound:{buffer:t,format:"uint16x2",stride:i,offset:20}},indexBuffer:n})}};var le={};function ce(e){let r=le[e];if(r)return r;let t=new Int32Array(e);for(let n=0;n<e;n++)t[n]=n;return r=le[e]=new Bt({uTextures:{value:t,type:"i32",size:e}},{isStatic:!0}),r}var j=class extends At{constructor(r){let t=Xt({name:"batch",bits:[Jt,qt(r),ee]}),n=Qt({name:"batch",bits:[Lt,Ot(r),te]});super({glProgram:t,gpuProgram:n,resources:{batchSamplers:ce(r)}}),this.maxTextures=r}};var Z=null,fe=class xe extends ae{constructor(r){super(r),this.geometry=new J,this.name=xe.extension.name,this.vertexSize=6,Z??(Z=new j(r.maxTextures)),this.shader=Z}packAttributes(r,t,n,i,o){let s=o<<16|r.roundPixels&65535,u=r.transform,a=u.a,l=u.b,f=u.c,v=u.d,p=u.tx,h=u.ty,{positions:x,uvs:y}=r,b=r.color,_=r.attributeOffset,c=_+r.attributeSize;for(let d=_;d<c;d++){let m=d*2,B=x[m],P=x[m+1];t[i++]=a*B+f*P+p,t[i++]=v*P+l*B+h,t[i++]=y[m],t[i++]=y[m+1],n[i++]=b,n[i++]=s}}packQuadAttributes(r,t,n,i,o){let s=r.texture,u=r.transform,a=u.a,l=u.b,f=u.c,v=u.d,p=u.tx,h=u.ty,x=r.bounds,y=x.maxX,b=x.minX,_=x.maxY,c=x.minY,d=s.uvs,m=r.color,B=o<<16|r.roundPixels&65535;t[i+0]=a*b+f*c+p,t[i+1]=v*c+l*b+h,t[i+2]=d.x0,t[i+3]=d.y0,n[i+4]=m,n[i+5]=B,t[i+6]=a*y+f*c+p,t[i+7]=v*c+l*y+h,t[i+8]=d.x1,t[i+9]=d.y1,n[i+10]=m,n[i+11]=B,t[i+12]=a*y+f*_+p,t[i+13]=v*_+l*y+h,t[i+14]=d.x2,t[i+15]=d.y2,n[i+16]=m,n[i+17]=B,t[i+18]=a*b+f*_+p,t[i+19]=v*_+l*b+h,t[i+20]=d.x3,t[i+21]=d.y3,n[i+22]=m,n[i+23]=B}_updateMaxTextures(r){this.shader.maxTextures!==r&&(Z=new j(r),this.shader=Z)}destroy(){this.shader=null,super.destroy()}};fe.extension={type:[dt.Batcher],name:"default"};var sn=fe;var he=class{constructor(r){this.items=Object.create(null);let{renderer:t,type:n,onUnload:i,priority:o,name:s}=r;this._renderer=t,t.gc.addResourceHash(this,"items",n,o??0),this._onUnload=i,this.name=s}add(r){return this.items[r.uid]?!1:(this.items[r.uid]=r,r.once("unload",this.remove,this),r._gcLastUsed=this._renderer.gc.now,!0)}remove(r,...t){if(!this.items[r.uid])return;let n=r._gpuData[this._renderer.uid];n&&(this._onUnload?.(r,...t),n.destroy(),r._gpuData[this._renderer.uid]=null,this.items[r.uid]=null)}removeAll(...r){Object.values(this.items).forEach(t=>t&&this.remove(t,...r))}destroy(...r){this.removeAll(...r),this.items=Object.create(null),this._renderer=null,this._onUnload=null}};export{Xe as a,Qt as b,Xt as c,Lt as d,Jt as e,Ot as f,qt as g,te as h,ee as i,ht as j,Fe as k,pt as l,ne as m,ce as n,sn as o,he as p};
