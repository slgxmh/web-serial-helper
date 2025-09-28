import Layout from "./components/layout";
import "./i18n";
import {
  deleteProjectItem,
  loadProject,
  projectCurrentItemAtom,
  updateProjectCurrentItem,
} from "./stores/project";
import { type ProjectItemT } from "./types/project";
import { useAtom } from "jotai";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WebSerial } from "web-serial-helper";

const MAX_RECEIVE_LENGTH = 100;

function App() {
  const [currentItem] = useAtom(projectCurrentItemAtom);
  const [, update] = useAtom(updateProjectCurrentItem);
  const [, load] = useAtom(loadProject);
  const [, deleteItem] = useAtom(deleteProjectItem);

  useEffect(() => {
    load();
  }, [load]);

  const { t } = useTranslation();
  const webSerial = useRef<WebSerial | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [itemName, setItemName] = useState(currentItem.name);
  const [sendMode, setSendMode] = useState<"text" | "hex">(
    currentItem.sendMode,
  );
  const [receiveMode, setReceiveMode] = useState<"text" | "hex">(
    currentItem.receiveMode,
  );
  const [sendData, setSendData] = useState(currentItem.sendData);
  const [baudRate, setBaudRate] = useState(currentItem.baudRate);
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);

  useEffect(() => {
    setItemName(currentItem.name);
    setSendMode(currentItem.sendMode);
    setReceiveMode(currentItem.receiveMode);
    setSendData(currentItem.sendData);
    setBaudRate(currentItem.baudRate);
  }, [currentItem]);

  const handleSave = useCallback(() => {
    const item: Partial<ProjectItemT> = {
      name: itemName,
      sendMode,
      receiveMode,
      sendData,
      baudRate,
    };
    update(item);
  }, [baudRate, itemName, receiveMode, sendData, sendMode, update]);

  const handleDelete = useCallback(() => {
    try {
      deleteItem();
    } catch (e) {
      const err = e as Error;
      alert(t(err.message));
    }
  }, [deleteItem, t]);

  useEffect(() => {
    webSerial.current = new WebSerial();
    const getPorts = async () => {
      if (WebSerial.isSupported()) {
        try {
          const ports = await WebSerial.getPorts();
          setAvailablePorts(ports);
        } catch (e) {
          console.error(e);
        }
      }
    };
    getPorts();
  }, []);

  const startReading = useCallback(async () => {
    if (!webSerial.current) return;

    const onDataHex = (data: string) => {
      setReceivedData((prev) =>
        [...prev, `[HEX] ${data}`].slice(-MAX_RECEIVE_LENGTH),
      );
    };

    const onDataBytes = (data: Uint8Array) => {
      const textDecoder = new TextDecoder();
      setReceivedData((prev) =>
        [...prev, textDecoder.decode(data)].slice(-MAX_RECEIVE_LENGTH),
      );
    };

    if (receiveMode === "hex") {
      await webSerial.current.startReadingHex(onDataHex);
    } else {
      await webSerial.current.startReading(onDataBytes);
    }
  }, [receiveMode]);

  const handleConnect = useCallback(async () => {
    if (!webSerial.current) return;

    try {
      await webSerial.current.requestPort();
      await webSerial.current.open({ baudRate });
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  }, [baudRate]);

  const handleAutoConnect = useCallback(async () => {
    if (!webSerial.current || availablePorts.length === 0) return;

    try {
      // Use the first available port
      webSerial.current.setPort(availablePorts[0]);
      await webSerial.current.open({ baudRate });
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  }, [availablePorts, baudRate]);

  const handleDisconnect = useCallback(async () => {
    if (!webSerial.current) return;

    try {
      await webSerial.current.close();
      setIsConnected(false);
      setReceivedData([]); // Clear received data on disconnect
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSendData = useCallback(async () => {
    if (!webSerial.current || !sendData) return;

    try {
      if (sendMode === "hex") {
        await webSerial.current.writeHex(sendData);
      } else {
        const textEncoder = new TextEncoder();
        await webSerial.current.write(textEncoder.encode(sendData));
      }
      // Don't clear input text for easier re-sending
    } catch (error) {
      console.error(error);
      alert(String(error));
    }
  }, [sendData, sendMode]);

  useEffect(() => {
    if (isConnected) {
      const readingLoop = async () => {
        if (webSerial.current) {
          await webSerial.current.stopReading();
          await startReading();
        }
      };
      readingLoop();
    }

    // Cleanup function to stop reading when component unmounts or dependencies change.
    return () => {
      if (isConnected) {
        webSerial.current?.stopReading();
      }
    };
  }, [isConnected, startReading]);

  return (
    <>
      <Layout>
        <div className="container mx-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="label">{t("projectItemName")}:</span>
            <input
              className="input flex"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <div className="flex-1"></div>
            <button className="btn btn-secondary" onClick={handleSave}>
              {t("save")}
            </button>
          </div>
          <div className="flex justify-between items-center">
            {!isConnected ? (
              <div className="flex items-center gap-2">
                <span className="label">{t("baudRate")}:</span>
                <input
                  type="number"
                  value={baudRate}
                  onChange={(e) => setBaudRate(Number(e.target.value))}
                  className="input"
                />
                <button onClick={handleConnect} className="btn btn-primary">
                  {t("connect")}
                </button>
                {availablePorts.length > 0 && (
                  <button
                    onClick={handleAutoConnect}
                    className="btn btn-accent"
                  >
                    {t("reconnect")}
                  </button>
                )}
              </div>
            ) : (
              <button onClick={handleDisconnect} className="btn btn-secondary">
                {t("disconnect")}
              </button>
            )}
            <button className="btn btn-error" onClick={() => handleDelete()}>
              {t("delete")}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{t("receive")}</h2>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t("text")}</span>
                    <input
                      type="radio"
                      name="receiveMode"
                      value="text"
                      className="radio"
                      checked={receiveMode === "text"}
                      onChange={() => setReceiveMode("text")}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t("hex")}</span>
                    <input
                      type="radio"
                      name="receiveMode"
                      value="hex"
                      className="radio"
                      checked={receiveMode === "hex"}
                      onChange={() => setReceiveMode("hex")}
                    />
                  </label>
                </div>
                <textarea
                  readOnly
                  value={receivedData.join("\n")}
                  rows={10}
                  className="textarea textarea-bordered w-full mt-2"
                />
                <div className="card-actions justify-end">
                  <button
                    onClick={() => setReceivedData([])}
                    className="btn btn-ghost"
                  >
                    {t("clear")}
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{t("send")}</h2>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t("text")}</span>
                    <input
                      type="radio"
                      name="sendMode"
                      value="text"
                      className="radio"
                      checked={sendMode === "text"}
                      onChange={() => setSendMode("text")}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t("hex")}</span>
                    <input
                      type="radio"
                      name="sendMode"
                      value="hex"
                      className="radio"
                      checked={sendMode === "hex"}
                      onChange={() => setSendMode("hex")}
                    />
                  </label>
                </div>
                <textarea
                  value={sendData}
                  onChange={(e) => setSendData(e.target.value)}
                  rows={4}
                  className="textarea textarea-bordered w-full mt-2"
                />
                <div className="card-actions justify-end">
                  <button onClick={handleSendData} className="btn btn-primary">
                    {t("send")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default App;
