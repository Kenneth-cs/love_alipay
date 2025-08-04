// pages/mirror/index.tsx
import Taro from "@tarojs/taro";
import { observer } from "mobx-react";
import { useState, useRef, useEffect } from "react";
import { View, Canvas, Camera, Text } from "@tarojs/components";
import { AtButton, AtActionSheet, AtActionSheetItem } from "taro-ui";
import { EFFECTS } from "../../config/effets";
import { useShare } from "../../utils/share-utils";
import { MirrorRenderer, RenderConfig } from "../../utils/mirror-renderer";
import "./index.scss";

const Mirror = observer(() => {
  const cameraCtxRef = useRef<any>(null);
  const canvasNodeRef = useRef<any>(null);
  const rendererRef = useRef<MirrorRenderer | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  const [currentEffect, setCurrentEffect] = useState("mirror");
  const [showEffectSheet, setShowEffectSheet] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [renderStatus, setRenderStatus] = useState({
    isRendering: false,
    hasError: false,
    errorMessage: "",
  });
  const [isCapturing, setIsCapturing] = useState(false);

  // 清理函数
  useEffect(() => {
    const cameraContext = Taro.createCameraContext();
    cameraCtxRef.current = cameraContext;

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  // 当摄像头和Canvas都准备好时，初始化渲染器
  useEffect(() => {
    if (cameraReady && canvasReady && !rendererRef.current) {
      initRenderer();
    }
  }, [cameraReady, canvasReady]);

  // 当效果改变时，更新渲染器
  useEffect(() => {
    if (rendererRef.current) {
      const success = rendererRef.current.changeEffect(currentEffect);
      if (success) {
        setRenderStatus((prev) => ({
          ...prev,
          hasError: false,
          errorMessage: "",
        }));
      }
    }
  }, [currentEffect]);

  useShare();

  const handleCameraError = (e: any) => {
    console.error("Camera error:", e.detail);
    const errorDetail = e.detail || {};
    const errorMsg = errorDetail.errMsg || "";

    // 检查是否是权限问题
    if (errorMsg.includes("auth deny") || errorMsg.includes("permission")) {
      Taro.showModal({
        title: "需要摄像头权限",
        content: "功能需要使用摄像头，请在设置中开启权限",
        showCancel: true,
        cancelText: "稍后再说",
        confirmText: "去开启",
        success: (res) => {
          if (res.confirm) {
            Taro.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting["scope.camera"]) {
                  Taro.showToast({
                    title: "权限已开启",
                    icon: "success",
                  });
                  // 重新加载页面
                  setTimeout(() => {
                    Taro.reLaunch({
                      url: "/pages/mirror/index",
                    });
                  }, 1000);
                }
              },
            });
          }
        },
      });
    } else {
      // 其他错误的通用处理
      Taro.showModal({
        title: "摄像头启动失败",
        content: "请检查设备摄像头是否正常，或尝试重新进入页面",
        showCancel: false,
        confirmText: "知道了",
      });
    }
  };

  const handleCameraReady = () => {
    console.log("handleCameraReady onInitDone");
    setCameraReady(true);
  };

  useEffect(() => {
    let mounted = true;

    const initializeCanvas = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!mounted) return;
      try {
        await initCanvas();
        console.log("Canvas初始化完成");
      } catch (error) {
        console.error("Canvas初始化失败:", error);
      }
    };

    initializeCanvas();

    return () => {
      mounted = false;
    };
  }, []);

  const resetCanvasInit = () => {
    setCanvasReady(false);
    setRenderStatus({
      isRendering: false,
      hasError: false,
      errorMessage: "",
    });
    canvasNodeRef.current = null;
    glRef.current = null;
  };

  const handleRetryRender = () => {
    if (rendererRef.current) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }

    if (!canvasReady || !glRef.current || !canvasNodeRef.current) {
      resetCanvasInit();
      setTimeout(() => {
        initCanvas();
      }, 500);
      return;
    }

    setRenderStatus({
      isRendering: false,
      hasError: false,
      errorMessage: "",
    });

    setTimeout(() => {
      if (cameraReady && canvasReady) {
        initRenderer();
      }
    }, 500);
  };

  const initCanvas = () => {
    console.log("开始初始化Canvas");

    const query = Taro.createSelectorQuery();
    query
      .select("#mirrorCanvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          console.error("Canvas查询失败:", res);
          setRenderStatus({
            isRendering: false,
            hasError: true,
            errorMessage: "Canvas节点查询失败",
          });
          setCanvasReady(true);
          return;
        }

        const canvas = res[0].node;
        const canvasInfo = res[0];

        canvasNodeRef.current = canvas;

        try {
          const gl = canvas.getContext("webgl", {
            preserveDrawingBuffer: true,
          });

          if (!gl) {
            console.error("WebGL not supported");
            setRenderStatus({
              isRendering: false,
              hasError: true,
              errorMessage: "WebGL不支持",
            });
            setCanvasReady(true);
            return;
          }

          const systemInfo = Taro.getSystemInfoSync();
          const dpr = systemInfo.pixelRatio || 1;

          const displayWidth = canvasInfo.width;
          const displayHeight = canvasInfo.height;

          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;

          canvas.displayWidth = displayWidth;
          canvas.displayHeight = displayHeight;
          canvas.pixelRatio = dpr;

          gl.viewport(0, 0, canvas.width, canvas.height);

          glRef.current = gl;

          console.log(
            `Canvas初始化成功: 显示尺寸 ${displayWidth}x${displayHeight}, 渲染尺寸 ${canvas.width}x${canvas.height}, DPR: ${dpr}`
          );
          setCanvasReady(true);

          setRenderStatus((prev) => ({
            ...prev,
            hasError: false,
            errorMessage: "",
          }));
        } catch (error) {
          console.error("Canvas配置过程中出错:", error);
          setRenderStatus({
            isRendering: false,
            hasError: true,
            errorMessage: `Canvas配置失败: ${error}`,
          });
          setCanvasReady(true);
        }
      });
  };

  const handleTakePhoto = async () => {
    if (!glRef.current || !rendererRef.current) {
      Taro.showToast({
        title: "Canvas未准备好",
        icon: "error",
      });
      return;
    }

    try {
      setIsCapturing(true);
      Taro.showLoading({
        title: "正在保存...",
      });

      const gl = glRef.current;
      await captureWebGLCanvas(gl);

      Taro.hideLoading();
      Taro.showToast({
        title: "保存成功",
        icon: "success",
      });
    } catch (err: any) {
      console.error("拍照或保存失败:", err);
      Taro.hideLoading();

      let errorMessage = "拍照失败";
      if (err.errMsg) {
        if (err.errMsg.includes("saveImageToPhotosAlbum:fail auth deny")) {
          errorMessage = "请授权访问相册";
        } else if (err.errMsg.includes("saveImageToPhotosAlbum:fail")) {
          errorMessage = "保存到相册失败";
        } else {
          errorMessage = err.errMsg;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      Taro.showModal({
        title: "拍照失败",
        content: errorMessage,
        showCancel: false,
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const captureWebGLCanvas = async (
    gl: WebGLRenderingContext
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        const flippedPixels = new Uint8Array(width * height * 4);
        const rowSize = width * 4;
        for (let y = 0; y < height; y++) {
          const srcOffset = (height - 1 - y) * rowSize;
          const dstOffset = y * rowSize;
          flippedPixels.set(
            pixels.subarray(srcOffset, srcOffset + rowSize),
            dstOffset
          );
        }

        const query = Taro.createSelectorQuery();
        query
          .select("#captureCanvas")
          .fields({ node: true, size: true })
          .exec((res) => {
            const canvas = res[0].node;
            const ctx = canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;

            const imageData = ctx.createImageData(width, height);
            imageData.data.set(flippedPixels);

            ctx.putImageData(imageData, 0, 0);

            Taro.canvasToTempFilePath({
              canvas: canvas,
              fileType: "jpg",
              quality: 0.8,
              success: (res) => {
                Taro.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: () => resolve(),
                  fail: (err) => reject(err),
                });
              },
              fail: (err) => reject(err),
            });
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const initRenderer = () => {
    if (!glRef.current || !cameraCtxRef.current || !canvasNodeRef.current) {
      console.error("Missing required references for renderer initialization");
      return;
    }

    try {
      const config: RenderConfig = {
        gl: glRef.current,
        canvas: canvasNodeRef.current,
        cameraContext: cameraCtxRef.current,
        effect: currentEffect,
        onError: handleRenderError,
      };

      rendererRef.current = new MirrorRenderer(config);

      const success = rendererRef.current.start();
      if (success) {
        setRenderStatus({
          isRendering: true,
          hasError: false,
          errorMessage: "",
        });
        console.log("Renderer initialized and started successfully");
      } else {
        setRenderStatus({
          isRendering: false,
          hasError: true,
          errorMessage: "Failed to start renderer",
        });
      }
    } catch (error) {
      console.error("Failed to initialize renderer:", error);
      setRenderStatus({
        isRendering: false,
        hasError: true,
        errorMessage: `Renderer initialization failed: ${error}`,
      });
    }
  };

  const handleRenderError = (error: string) => {
    console.error("Render error:", error);
    setRenderStatus({
      isRendering: false,
      hasError: true,
      errorMessage: error,
    });

    Taro.showToast({
      title: "渲染出错",
      icon: "error",
    });
  };

  const handleEffectChange = (effect: string) => {
    console.log("Changing effect to:", effect);

    setCurrentEffect(effect);
    setShowEffectSheet(false);

    const selectedEffect = EFFECTS.find((e) => e.value === effect);
    const effectName = selectedEffect ? selectedEffect.name : "未知效果";

    Taro.showToast({
      title: `切换到${effectName}`,
      icon: "success",
    });
  };

  const handleShowEffectSheet = () => {
    setShowEffectSheet(true);
  };

  const handleCloseEffectSheet = () => {
    setShowEffectSheet(false);
  };

  const isSystemReady = cameraReady && canvasReady;
  const canOperate =
    isSystemReady && renderStatus.isRendering && !renderStatus.hasError;

  // 创建摄像头属性配置
  const getCameraProps = () => {
    const baseProps = {
      id: "camera",
      className: "camera",
      devicePosition: "front" as const,
      flash: "off" as const,
      onError: handleCameraError,
    };

    const platform = process.env.TARO_ENV;

    // 根据平台添加对应的事件
    switch (platform) {
      case "weapp": // 微信小程序
      case "qq": // QQ小程序
        return {
          ...baseProps,
          onInitDone: handleCameraReady,
        };

      default:
        return {
          ...baseProps,
          onReady: handleCameraReady,
        };
    }
  };

  // 在 JSX 中使用
  const cameraProps = getCameraProps();

  return (
    <View className="mirror-page">
      {/* 全屏Canvas容器 */}
      <View className="canvas-container">
        <Camera {...cameraProps} />

        <Canvas
          type="webgl"
          id="mirrorCanvas"
          className="mirror-canvas"
          disableScroll={true}
        />

        {/* 2D Canvas用于截图中转 */}
        <Canvas
          type="2d"
          id="captureCanvas"
          canvasId="captureCanvas"
          className="capture-canvas"
        />
      </View>

      {/* 状态指示器 - 使用Flex布局居中 */}
      {(!cameraReady ||
        !canvasReady ||
        !renderStatus.isRendering ||
        renderStatus.hasError ||
        isCapturing) && (
        <View className="at-row at-row__align--center at-row__justify--center status-overlay">
          <View className="at-col at-col--auto">
            {!cameraReady && (
              <View className="status-card">
                <Text className="status-text">🎥 摄像头初始化中...</Text>
              </View>
            )}
            {!canvasReady && cameraReady && (
              <View className="status-card">
                <Text className="status-text">🎨 Canvas初始化中...</Text>
              </View>
            )}
            {isSystemReady &&
              !renderStatus.isRendering &&
              !renderStatus.hasError && (
                <View className="status-card">
                  <Text className="status-text">⚡ 渲染器初始化中...</Text>
                </View>
              )}
            {renderStatus.hasError && (
              <View className="status-card error-card">
                <Text className="error-title">渲染出错</Text>
                <Text className="error-message">
                  {renderStatus.errorMessage}
                </Text>
                <AtButton
                  size="small"
                  onClick={handleRetryRender}
                  className="retry-button"
                >
                  重试
                </AtButton>
              </View>
            )}
            {isCapturing && (
              <View className="status-card capture-card">
                <Text className="capture-text">📸 正在拍照保存...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 底部控制栏 - 添加动态类名 */}
      <View
        className={`bottom-controls ${showEffectSheet ? "sheet-opened" : ""}`}
      >
        {/* 效果选择按钮行 */}
        <View className="control-row">
          <AtButton
            size="normal"
            onClick={handleShowEffectSheet}
            className="effect-select-button"
            disabled={!canOperate || isCapturing}
          >
            🎭 选择效果
          </AtButton>
        </View>

        {/* 拍照按钮行 */}
        <View className="control-row">
          <AtButton
            type="primary"
            size="normal"
            onClick={handleTakePhoto}
            className="photo-button"
            disabled={!canOperate}
            loading={isCapturing}
          >
            {isCapturing ? "拍照中..." : "📷 拍照保存"}
          </AtButton>
        </View>
      </View>

      {/* 效果选择弹窗 - 添加容器包装 */}
      <View
        className={`action-sheet-container ${
          showEffectSheet ? "sheet-opened" : ""
        }`}
      >
        <AtActionSheet
          isOpened={showEffectSheet}
          cancelText="取消"
          onCancel={handleCloseEffectSheet}
          onClose={handleCloseEffectSheet}
          title="选择变形效果"
        >
          {EFFECTS.map((effect) => (
            <AtActionSheetItem
              key={effect.value}
              onClick={() => handleEffectChange(effect.value)}
            >
              {effect.name}
              {effect.value === currentEffect && " ✓"}
            </AtActionSheetItem>
          ))}
        </AtActionSheet>
      </View>
    </View>
  );
});

export default Mirror;
