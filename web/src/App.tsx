import Layout from "./components/layout";
import "./i18n";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WebSerial } from "web-serial-helper";

const MAX_RECEIVE_LENGTH = 100;

function App() {
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState(t("defaultProjectName"));
  const webSerial = useRef<WebSerial | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [sendMode, setSendMode] = useState<"text" | "hex">("text");
  const [receiveMode, setReceiveMode] = useState<"text" | "hex">("text");
  const [inputText, setInputText] = useState("");
  const [baudRate, setBaudRate] = useState(115200);
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);

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
    if (!webSerial.current || !inputText) return;

    try {
      if (sendMode === "hex") {
        await webSerial.current.writeHex(inputText);
      } else {
        const textEncoder = new TextEncoder();
        await webSerial.current.write(textEncoder.encode(inputText));
      }
      // Don't clear input text for easier re-sending
    } catch (error) {
      console.error(error);
      alert(String(error));
    }
  }, [inputText, sendMode]);

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
        <div className="container mx-auto p-4">
          <div className="form-control w-full max-w-xs mx-auto my-4">
            <label className="label">
              <span className="label-text">{t("projectName")}</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <div className="flex justify-center items-center my-4">
            {!isConnected ? (
              <div className="flex items-center gap-2">
                <label className="input input-bordered flex items-center gap-2">
                  {t("baudRate")}:
                  <input
                    type="number"
                    value={baudRate}
                    onChange={(e) => setBaudRate(Number(e.target.value))}
                    className="grow"
                  />
                </label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
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
