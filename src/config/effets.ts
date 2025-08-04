interface MirrorEffect {
  name: string;
  value: string;
  shader: string;
}

const EFFECTS: MirrorEffect[] = [
  { name: "水平镜像", value: "mirror", shader: "mirror" },
  { name: "垂直镜像", value: "vmirror", shader: "vmirror" },
  { name: "凸镜效果", value: "convex", shader: "convex" },
  { name: "凹镜效果", value: "concave", shader: "concave" },
  { name: "波浪效果", value: "wave", shader: "wave" },
  { name: "彩虹扭曲", value: "rainbow", shader: "rainbow" },
  { name: "鱼眼效果", value: "fisheye", shader: "fisheye" },
  { name: "万花筒", value: "kaleidoscope", shader: "kaleidoscope" },
  { name: "像素风", value: "pixelate", shader: "pixelate" },
  { name: "油画效果", value: "oilpainting", shader: "oilpainting" },
  { name: "霓虹边缘", value: "neon", shader: "neon" },
  { name: "漩涡效果", value: "swirl", shader: "swirl" },
];

export { EFFECTS };
