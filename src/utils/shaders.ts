// shaders.ts - 性能优化版本
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const getFragmentShader = (effect: string): string => {
  const baseShader = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    // 优化的HSV到RGB转换 - 减少计算量
    vec3 hsv2rgb(vec3 c) {
      vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
      return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
    }
    
    // 优化的亮度计算 - 使用更快的近似
    float luminance(vec3 color) {
      return dot(color, vec3(0.299, 0.587, 0.114));
    }
    
    // 优化的噪声函数 - 减少计算复杂度
    float random(vec2 st) {
      return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }
  `;

  switch (effect) {
    case "mirror":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord;
          coord.x = coord.x > 0.5 ? 1.0 - coord.x : coord.x;
          gl_FragColor = texture2D(u_texture, coord);
        }
      `
      );

    case "vmirror":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord;
          coord.y = coord.y > 0.5 ? 1.0 - coord.y : coord.y;
          gl_FragColor = texture2D(u_texture, coord);
        }
      `
      );

    case "convex":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float dist2 = dot(coord, coord); // 使用距离平方避免sqrt
          float factor = 1.0 - smoothstep(0.0, 0.36, dist2) * 0.3; // 0.6^2 = 0.36
          gl_FragColor = texture2D(u_texture, coord * factor + 0.5);
        }
      `
      );

    case "concave":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float dist2 = dot(coord, coord);
          float factor = 1.0 + smoothstep(0.0, 0.16, dist2) * 0.6; // 0.4^2 = 0.16
          vec2 newCoord = coord * factor + 0.5;
          
          if (any(lessThan(newCoord, vec2(0.0))) || any(greaterThan(newCoord, vec2(1.0)))) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          } else {
            gl_FragColor = texture2D(u_texture, newCoord);
          }
        }
      `
      );

    case "wave":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord;
          float timeOffset = u_time * 3.0;
          
          coord.x += sin(coord.y * 15.0 + timeOffset) * 0.02;
          coord.y += cos(coord.x * 15.0 + timeOffset) * 0.02;
          
          gl_FragColor = texture2D(u_texture, clamp(coord, 0.0, 1.0));
        }
      `
      );

    case "swirl":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float dist = length(coord);
          float angle = atan(coord.y, coord.x) + dist * 5.0 + u_time;
          
          vec2 newCoord = vec2(cos(angle), sin(angle)) * dist + 0.5;
          gl_FragColor = texture2D(u_texture, newCoord);
        }
      `
      );

    case "fisheye":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float dist = length(coord);
          float factor = mix(1.0, 1.0 / (1.0 + dist), smoothstep(0.0, 0.5, dist));
          
          gl_FragColor = texture2D(u_texture, coord * factor + 0.5);
        }
      `
      );

    case "kaleidoscope":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float angle = atan(coord.y, coord.x);
          float radius = length(coord);
          
          const float segment = 1.047197551; // PI/3
          angle = mod(angle, segment);
          if (mod(floor(atan(coord.y, coord.x) / segment), 2.0) == 1.0) {
            angle = segment - angle;
          }
          
          vec2 newCoord = vec2(cos(angle), sin(angle)) * radius + 0.5;
          gl_FragColor = texture2D(u_texture, newCoord);
        }
      `
      );

    case "rgbshift":
      return (
        baseShader +
        `
        void main() {
          float offset = 0.01 * sin(u_time * 2.0);
          vec2 coord = v_texCoord;
          
          float r = texture2D(u_texture, coord + vec2(offset, 0.0)).r;
          float g = texture2D(u_texture, coord).g;
          float b = texture2D(u_texture, coord - vec2(offset, 0.0)).b;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `
      );

    case "pixelate":
      return (
        baseShader +
        `
        void main() {
          float pixelSize = 20.0 + sin(u_time) * 10.0;
          vec2 coord = floor(v_texCoord * pixelSize) / pixelSize;
          
          vec3 color = texture2D(u_texture, coord).rgb;
          color = pow(color, vec3(1.2));
          
          float gray = luminance(color);
          color = mix(vec3(gray), color, 1.5);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
      );

    case "oilpainting":
      // 减少采样次数从8次到4次
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord;
          vec3 color = texture2D(u_texture, coord).rgb;
          
          // 4次采样而不是8次
          color += texture2D(u_texture, coord + vec2(0.01, 0.0)).rgb;
          color += texture2D(u_texture, coord + vec2(0.0, 0.01)).rgb;
          color += texture2D(u_texture, coord + vec2(-0.01, 0.0)).rgb;
          color += texture2D(u_texture, coord + vec2(0.0, -0.01)).rgb;
          
          color *= 0.2; // 1/5
          
          color = pow(color, vec3(0.8));
          float lum = luminance(color);
          color = mix(vec3(lum), color, 1.8);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
      );

    case "neon":
      // 简化边缘检测
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord;
          vec3 color = texture2D(u_texture, coord).rgb;
          
          vec2 texelSize = 2.0 / u_resolution;
          
          // 简化的边缘检测 - 只检测4个方向
          vec3 edge = abs(color - texture2D(u_texture, coord + vec2(texelSize.x, 0.0)).rgb);
          edge += abs(color - texture2D(u_texture, coord + vec2(-texelSize.x, 0.0)).rgb);
          edge += abs(color - texture2D(u_texture, coord + vec2(0.0, texelSize.y)).rgb);
          edge += abs(color - texture2D(u_texture, coord + vec2(0.0, -texelSize.y)).rgb);
          
          float edgeStrength = length(edge) * 0.25;
          
          vec3 neonColor = hsv2rgb(vec3(u_time * 0.1 + edgeStrength, 1.0, 1.0));
          color = mix(color * 0.3, neonColor, edgeStrength * 3.0);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
      );

    case "rainbow":
      return (
        baseShader +
        `
        void main() {
          vec2 coord = v_texCoord - 0.5;
          float dist = length(coord);
          float angle = atan(coord.y, coord.x) + sin(dist * 10.0 + u_time * 2.0) * 0.5;
          
          coord = vec2(cos(angle), sin(angle)) * dist + 0.5;
          vec3 color = texture2D(u_texture, coord).rgb;
          
          float hue = dist * 2.0 + u_time * 0.5;
          vec3 rainbow = hsv2rgb(vec3(hue, 0.8, 1.0));
          
          gl_FragColor = vec4(mix(color, color * rainbow, 0.4), 1.0);
        }
      `
      );

    default:
      return (
        baseShader +
        `
        void main() {
          gl_FragColor = texture2D(u_texture, v_texCoord);
        }
      `
      );
  }
};
