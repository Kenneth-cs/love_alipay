import Taro from "@tarojs/taro";

interface Star {
  x: number;
  y: number;
  size: number;
}

interface Feature {
  icon: string;
  text: string;
}

const QRCode =
  "https://yuga-1323085362.cos.ap-guangzhou.myqcloud.com/gh_586f54730bc1_430.jpg";

export class PosterGenerator {
  private canvasId: string;
  private canvasWidth: number;
  private canvasHeight: number;
  private qrCodePath: string | null = null; // 缓存二维码路径

  constructor() {
    this.canvasId = "posterCanvas";
    // 获取屏幕尺寸并设置画布大小
    const systemInfo = Taro.getSystemInfoSync();
    this.canvasWidth = Math.floor(systemInfo.screenWidth * 0.9);
    this.canvasHeight = Math.floor(systemInfo.screenHeight * 0.9);
    this.preloadQRCode();
  }

  // 预加载二维码图片
  private preloadQRCode(): void {
    if (!this.qrCodePath) {
      Taro.getImageInfo({
        src: QRCode,
        success: (res) => {
          this.qrCodePath = res.path;
        },
        fail: (error) => {
          console.warn("预加载二维码图片失败:", error);
        },
      });
    }
  }

  // 主要生成海报方法
  async generatePoster(): Promise<string> {
    try {
      Taro.showLoading({
        title: "生成海报中...",
        mask: true,
      });

      const posterPath = await this.createPoster();

      Taro.hideLoading();

      // 预览海报
      Taro.previewImage({
        urls: [posterPath],
        current: posterPath,
        success: () => {},
      });

      return posterPath;
    } catch (error) {
      Taro.hideLoading();
      console.error("生成海报失败:", error);
      Taro.showToast({
        title: "生成失败，请重试",
        icon: "none",
      });
      throw error;
    }
  }

  // 创建海报
  private createPoster(): Promise<string> {
    return new Promise((resolve, reject) => {
      const ctx = Taro.createCanvasContext(this.canvasId);

      // 绘制渐变背景
      this.drawBackground(ctx);

      // 绘制装饰元素
      this.drawDecorations(ctx);

      // 绘制主标题区域（参考intro-card样式）
      this.drawIntroSection(ctx);

      // 绘制功能特点区域（参考section-card样式）
      this.drawFeaturesSection(ctx);

      // 绘制二维码区域（参考actions-card样式）
      this.drawQRCodeSection(ctx, () => {
        // 绘制底部信息
        this.drawFooter(ctx);

        // 绘制完成，导出图片
        ctx.draw(false, () => {
          setTimeout(() => {
            Taro.canvasToTempFilePath({
              canvasId: this.canvasId,
              width: this.canvasWidth,
              height: this.canvasHeight,
              destWidth: this.canvasWidth * 2, // 提高输出质量
              destHeight: this.canvasHeight * 2,
              fileType: "png",
              quality: 1,
              success: (res) => {
                resolve(res.tempFilePath);
              },
              fail: (error) => {
                console.error("导出图片失败:", error);
                reject(error);
              },
            });
          }, 1000);
        });
      });
    });
  }

  // 绘制渐变背景（参考about-page背景）
  private drawBackground(ctx: Taro.CanvasContext): void {
    // 主背景渐变 - 参考About页面的渐变色
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");

    ctx.setFillStyle(gradient);
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // 绘制装饰元素
  private drawDecorations(ctx: Taro.CanvasContext): void {
    // 绘制半透明装饰圆圈
    ctx.setFillStyle("rgba(255, 255, 255, 0.08)");

    // 顶部装饰
    ctx.beginPath();
    ctx.arc(
      this.canvasWidth * 0.2,
      this.canvasHeight * 0.1,
      this.canvasWidth * 0.1,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.canvasWidth * 0.8,
      this.canvasHeight * 0.15,
      this.canvasWidth * 0.08,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // 底部装饰
    ctx.beginPath();
    ctx.arc(
      this.canvasWidth * 0.15,
      this.canvasHeight * 0.85,
      this.canvasWidth * 0.12,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.canvasWidth * 0.85,
      this.canvasHeight * 0.8,
      this.canvasWidth * 0.09,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // 绘制星星装饰
    this.drawStars(ctx);
  }

  // 绘制星星装饰
  private drawStars(ctx: Taro.CanvasContext): void {
    const stars: Star[] = [
      {
        x: this.canvasWidth * 0.3,
        y: this.canvasHeight * 0.2,
        size: this.canvasWidth * 0.015,
      },
      {
        x: this.canvasWidth * 0.7,
        y: this.canvasHeight * 0.25,
        size: this.canvasWidth * 0.012,
      },
      {
        x: this.canvasWidth * 0.15,
        y: this.canvasHeight * 0.4,
        size: this.canvasWidth * 0.018,
      },
      {
        x: this.canvasWidth * 0.85,
        y: this.canvasHeight * 0.45,
        size: this.canvasWidth * 0.014,
      },
      {
        x: this.canvasWidth * 0.4,
        y: this.canvasHeight * 0.7,
        size: this.canvasWidth * 0.016,
      },
    ];

    ctx.setFillStyle("rgba(255, 255, 255, 0.6)");
    stars.forEach((star) => {
      this.drawStar(ctx, star.x, star.y, star.size);
    });
  }

  // 绘制单个星星
  private drawStar(
    ctx: Taro.CanvasContext,
    x: number,
    y: number,
    size: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();

    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 绘制介绍区域（参考intro-card样式）
  private drawIntroSection(ctx: Taro.CanvasContext): void {
    const padding = this.canvasWidth * 0.08;
    const cardY = this.canvasHeight * 0.08;
    const cardHeight = this.canvasHeight * 0.25;
    const radius = this.canvasWidth * 0.03; // 圆角半径

    // 绘制卡片背景（参考intro-card样式）
    this.drawCard(
      ctx,
      padding,
      cardY,
      this.canvasWidth - padding * 2,
      cardHeight,
      radius
    );

    // 主标题 - 向上移动
    ctx.setFillStyle("#ffffff");
    ctx.setFontSize(this.canvasWidth * 0.08);
    ctx.setTextAlign("center");
    ctx.fillText(
      "🎭 神奇哈哈镜",
      this.canvasWidth / 2,
      cardY + this.canvasHeight * 0.08 // 从0.12改为0.08，向上移动
    );

    // 描述文字 - 向上移动
    ctx.setFillStyle("#ffffff");
    ctx.setFontSize(this.canvasWidth * 0.04);
    ctx.setTextAlign("center");

    // 分行显示描述文字
    const descriptions = [
      "一键解锁12种奇幻特效",
      "让每一张照片都充满魔法",
      "成为朋友圈的焦点",
    ];

    descriptions.forEach((desc, index) => {
      ctx.fillText(
        desc,
        this.canvasWidth / 2,
        cardY + this.canvasHeight * 0.12 + index * this.canvasHeight * 0.035 // 从0.16改为0.12，向上移动
      );
    });
  }

  // 绘制功能特点区域（参考section-card样式）
  private drawFeaturesSection(ctx: Taro.CanvasContext): void {
    const padding = this.canvasWidth * 0.08;
    const cardY = this.canvasHeight * 0.38;
    const cardHeight = this.canvasHeight * 0.32;

    // 绘制卡片背景
    this.drawCard(
      ctx,
      padding,
      cardY,
      this.canvasWidth - padding * 2,
      cardHeight
    );

    // 标题区域
    const headerY = cardY + this.canvasHeight * 0.04;
    ctx.setFillStyle("#ffffff");
    ctx.setFontSize(this.canvasWidth * 0.045);
    ctx.setTextAlign("left");
    ctx.fillText("✨", padding + this.canvasWidth * 0.04, headerY);
    ctx.fillText("主要功能", padding + this.canvasWidth * 0.08, headerY);

    // 分割线
    ctx.setStrokeStyle("rgba(255, 255, 255, 0.2)");
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(
      padding + this.canvasWidth * 0.04,
      headerY + this.canvasHeight * 0.02
    );
    ctx.lineTo(
      this.canvasWidth - padding - this.canvasWidth * 0.04,
      headerY + this.canvasHeight * 0.02
    );
    ctx.stroke();

    // 功能列表
    const features: Feature[] = [
      { icon: "📱", text: "实时摄像头预览" },
      { icon: "🎯", text: "12+种精美特效，持续更新" },
      { icon: "📸", text: "高清拍照保存，画质无损" },
      { icon: "⚡", text: "极速处理，流畅体验" },
      { icon: "🎨", text: "简单易用，一键分享" },
      { icon: "✨", text: "创意无限，魔法体验" },
    ];

    const startY = headerY + this.canvasHeight * 0.05;
    const itemHeight = this.canvasHeight * 0.045; // 增加行间距
    const cols = 2;

    // 计算每列的宽度，留出更多边距
    const colWidth =
      (this.canvasWidth - padding * 2 - this.canvasWidth * 0.12) / cols;

    // 左侧列的起始X坐标
    const leftColX = padding + this.canvasWidth * 0.04;
    // 右侧列的起始X坐标，确保两列有明确的分隔
    const rightColX =
      padding + this.canvasWidth * 0.04 + colWidth + this.canvasWidth * 0.04;

    features.forEach((feature, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // 根据列选择X坐标
      const x = col === 0 ? leftColX : rightColX;
      const y = startY + row * itemHeight;

      // 绘制功能点
      ctx.setFillStyle("rgba(255, 255, 255, 0.8)");
      ctx.setFontSize(this.canvasWidth * 0.035);
      ctx.setTextAlign("left");

      // 绘制图标
      ctx.setFillStyle("#ffffff");
      ctx.setFontSize(this.canvasWidth * 0.032);
      ctx.fillText(feature.icon, x, y);

      // 绘制文字，与图标保持一定距离
      ctx.setFontSize(this.canvasWidth * 0.028);
      ctx.fillText(feature.text, x + this.canvasWidth * 0.035, y);
    });
  }

  // 绘制二维码区域（参考actions-card样式）
  private drawQRCodeSection(
    ctx: Taro.CanvasContext,
    callback: () => void
  ): void {
    const padding = this.canvasWidth * 0.08;
    const cardY = this.canvasHeight * 0.75;
    const cardHeight = this.canvasHeight * 0.18;
    const radius = this.canvasWidth * 0.03; // 圆角半径

    // 使用 drawCard 方法绘制卡片背景，传入白色样式
    this.drawCard(
      ctx,
      padding,
      cardY,
      this.canvasWidth - padding * 2,
      cardHeight,
      radius
    );

    // 二维码区域
    const qrSize = this.canvasHeight * 0.12;
    const qrX = this.canvasWidth / 2 - qrSize / 2;
    const qrY = cardY + this.canvasHeight * 0.02;

    // 加载二维码图片
    this.loadQRCodeImage(ctx, qrX, qrY, qrSize, () => {
      // 二维码说明文字
      ctx.setFillStyle("rgba(255, 255, 255, 0.5)");
      ctx.setFontSize(this.canvasWidth * 0.025);
      ctx.setTextAlign("center");
      ctx.fillText(
        "长按识别小程序码",
        this.canvasWidth / 2,
        cardY + cardHeight - this.canvasHeight * 0.025 + 12
      );

      callback();
    });
  }

  // 绘制底部信息
  private drawFooter(ctx: Taro.CanvasContext): void {
    const footerY = this.canvasHeight * 0.95;
    ctx.setFillStyle("rgba(255, 255, 255, 0.75)");
    ctx.setFontSize(this.canvasWidth * 0.025);
    ctx.fillText(
      "让创意无限可能",
      this.canvasWidth / 2,
      footerY + this.canvasHeight * 0.025
    );
  }

  // 绘制卡片背景（参考About页面卡片样式）- 添加圆角
  private drawCard(
    ctx: Taro.CanvasContext,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number = 12 // 默认圆角半径
  ): void {
    // 绘制圆角矩形背景
    this.drawRoundedRect(ctx, x, y, width, height, radius);

    // 主背景
    ctx.setFillStyle("rgba(255, 255, 255, 0.15)");
    ctx.fill();

    // 边框
    this.drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.setStrokeStyle("rgba(255, 255, 255, 0.2)");
    ctx.setLineWidth(1);
    ctx.stroke();

    // 模拟backdrop-filter效果 - 添加额外的半透明层
    this.drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.setFillStyle("rgba(255, 255, 255, 0.05)");
    ctx.fill();
  }

  // 添加绘制圆角矩形的辅助方法
  private drawRoundedRect(
    ctx: Taro.CanvasContext,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 加载二维码图片
  private loadQRCodeImage(
    ctx: Taro.CanvasContext,
    x: number,
    y: number,
    size: number,
    callback: () => void
  ): void {
    // 如果已经有缓存的二维码路径，直接使用
    if (this.qrCodePath) {
      try {
        ctx.drawImage(this.qrCodePath, x, y, size, size);
        callback();
      } catch (error) {
        console.warn("绘制二维码失败:", error);
        this.drawQRCodePlaceholder(ctx, x, y, size);
        callback();
      }
      return;
    }

    // 没有缓存时才请求网络
    Taro.getImageInfo({
      src: "https://yuga-1323085362.cos.ap-guangzhou.myqcloud.com/qrcode.png",
      success: (res) => {
        try {
          this.qrCodePath = res.path; // 缓存路径
          ctx.drawImage(res.path, x, y, size, size);
          callback();
        } catch (error) {
          console.warn("绘制二维码失败:", error);
          this.drawQRCodePlaceholder(ctx, x, y, size);
          callback();
        }
      },
      fail: (error) => {
        console.warn("二维码图片加载失败:", error);
        this.drawQRCodePlaceholder(ctx, x, y, size);
        callback();
      },
    });
  }

  // 绘制二维码占位符
  private drawQRCodePlaceholder(
    ctx: Taro.CanvasContext,
    x: number,
    y: number,
    size: number
  ): void {
    // 绘制占位符背景
    ctx.setFillStyle("rgba(200, 200, 200, 0.8)");
    ctx.fillRect(x, y, size, size);

    // 绘制占位文字
    ctx.setFillStyle("#666666");
    ctx.setFontSize(this.canvasWidth * 0.04);
    ctx.setTextAlign("center");
    ctx.fillText("二维码", x + size / 2, y + size / 2);

    // 绘制边框
    ctx.setStrokeStyle("#999999");
    ctx.setLineWidth(2);
    ctx.strokeRect(x, y, size, size);
  }
}
