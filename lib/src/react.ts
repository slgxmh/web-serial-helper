import { WebSerial } from "./index";
import { useState, useEffect, useRef, useCallback } from "react";

interface UseWebSerialOptions {
  onData?: (data: Uint8Array) => void;
  onDataHex?: (data: string) => void;
  onError?: (error: any) => void;
}

export function useWebSerial(options?: UseWebSerialOptions) {
  const webSerial = useRef<WebSerial | null>(null);
  const [port, setPortState] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { onData, onDataHex, onError } = options || {};

  /** 初始化实例并监听设备断开 */
  useEffect(() => {
    if (WebSerial.isSupported()) {
      webSerial.current = new WebSerial();

      // 监听设备拔出
      (navigator as any).serial.addEventListener(
        "disconnect",
        async (event: any) => {
          if (event.target === webSerial.current?.getPort()) {
            await close();
          }
        },
      );
    }
  }, []);

  /** 手动设置端口 */
  const setPort = useCallback((port: SerialPort) => {
    if (webSerial.current) {
      webSerial.current.setPort(port);
      setPortState(port);
    }
  }, []);

  /** 请求用户选择端口 */
  const requestPort = useCallback(async () => {
    if (webSerial.current) {
      await webSerial.current.requestPort();
      setPortState(webSerial.current.getPort());
    }
  }, []);

  /** 获取已有授权的端口 */
  const getPorts = useCallback(async () => {
    const ports = await WebSerial.getPorts();
    if (ports.length > 0 && webSerial.current) {
      webSerial.current.setPort(ports[0]);
      setPortState(ports[0]);
    }
    return ports;
  }, []);

  /** 打开端口并开始读取 */
  const open = useCallback(
    async (options: SerialOptions) => {
      if (webSerial.current && webSerial.current.getPort()) {
        await webSerial.current.open(options);
        setIsConnected(true);

        // 自动开始读取
        if (onData) {
          webSerial.current.startReading(onData, onError);
        } else if (onDataHex) {
          webSerial.current.startReadingHex(onDataHex, onError);
        }
      }
    },
    [onData, onDataHex, onError],
  );

  /** 关闭端口 */
  const close = useCallback(async () => {
    if (webSerial.current) {
      await webSerial.current.close();
      setIsConnected(false);
      setPortState(null);
    }
  }, []);

  /** 写入二进制 */
  const write = useCallback(async (data: Uint8Array) => {
    if (webSerial.current) {
      await webSerial.current.write(data);
    }
  }, []);

  /** 写入 hex 字符串 */
  const writeHex = useCallback(async (hex: string) => {
    if (webSerial.current) {
      await webSerial.current.writeHex(hex);
    }
  }, []);

  return {
    isSupported: WebSerial.isSupported(),
    port,
    isConnected,
    requestPort,
    open,
    close,
    write,
    writeHex,
    getPorts,
    setPort,
  };
}
