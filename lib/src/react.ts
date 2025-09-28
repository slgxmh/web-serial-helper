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

  useEffect(() => {
    if (WebSerial.isSupported()) {
      webSerial.current = new WebSerial();
    }
  }, []);

  const setPort = useCallback((port: SerialPort) => {
    if (webSerial.current) {
      webSerial.current.setPort(port);
      setPortState(port);
    }
  }, []);

  const requestPort = useCallback(async () => {
    if (webSerial.current) {
      await webSerial.current.requestPort();
      setPortState(webSerial.current.getPort());
    }
  }, []);

  const open = useCallback(async (options: SerialOptions) => {
    if (webSerial.current && webSerial.current.getPort()) {
      await webSerial.current.open(options);
      setIsConnected(true);
    }
  }, []);

  const close = useCallback(async () => {
    if (webSerial.current) {
      await webSerial.current.close();
      setIsConnected(false);
      setPortState(null);
    }
  }, []);

  const write = useCallback(async (data: Uint8Array) => {
    if (webSerial.current) {
      await webSerial.current.write(data);
    }
  }, []);

  const writeHex = useCallback(async (hex: string) => {
    if (webSerial.current) {
      await webSerial.current.writeHex(hex);
    }
  }, []);

  const startReading = useCallback(() => {
    if (webSerial.current && onData) {
      webSerial.current.startReading(onData, onError);
    }
  }, [onData, onError]);

  const startReadingHex = useCallback(() => {
    if (webSerial.current && onDataHex) {
      webSerial.current.startReadingHex(onDataHex, onError);
    }
  }, [onDataHex, onError]);

  const stopReading = useCallback(async () => {
    if (webSerial.current) {
      await webSerial.current.stopReading();
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      if (onData) {
        startReading();
      } else if (onDataHex) {
        startReadingHex();
      }
    }

    return () => {
      if (isConnected) {
        stopReading();
      }
    };
  }, [isConnected, startReading, startReadingHex, stopReading]);

  return {
    isSupported: WebSerial.isSupported(),
    port,
    isConnected,
    requestPort,
    open,
    close,
    write,
    writeHex,
    getPorts: WebSerial.getPorts,
    setPort,
  };
}
