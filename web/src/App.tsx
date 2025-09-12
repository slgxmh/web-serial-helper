import "./i18n";
import { WebSerial } from "lib";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  const webSerial = useRef<WebSerial | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [sendMode, setSendMode] = useState<"text" | "hex">("text");
  const [receiveMode, setReceiveMode] = useState<"text" | "hex">("text");
  const [inputText, setInputText] = useState("");
  const [baudRate, setBaudRate] = useState(115200);

  useEffect(() => {
    webSerial.current = new WebSerial();
  }, []);

  const startReading = useCallback(async () => {
    if (!webSerial.current) return;

    const onDataHex = (data: string) => {
      setReceivedData((prev) => [...prev, `[HEX] ${data}`]);
    };

    const onDataBytes = (data: Uint8Array) => {
      const textDecoder = new TextDecoder();
      setReceivedData((prev) => [...prev, textDecoder.decode(data)]);
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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>{t("appName")}</h1>
      {!isConnected ? (
        <div>
          <label>
            {t("baudRate")}:
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
            >
              <option value="9600">9600</option>
              <option value="19200">19200</option>
              <option value="38400">38400</option>
              <option value="57600">57600</option>
              <option value="115200">115200</option>
            </select>
          </label>
          <button onClick={handleConnect} style={{ marginLeft: "10px" }}>
            {t("connect")}
          </button>
        </div>
      ) : (
        <button onClick={handleDisconnect}>Disconnect</button>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>{t("receive")}</h2>
        <div>
          <label>
            <input
              type="radio"
              name="receiveMode"
              value="text"
              checked={receiveMode === "text"}
              onChange={() => setReceiveMode("text")}
            />
            {t("text")}
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              name="receiveMode"
              value="hex"
              checked={receiveMode === "hex"}
              onChange={() => setReceiveMode("hex")}
            />
            {t("hex")}
          </label>
        </div>
        <textarea
          readOnly
          value={receivedData.join("\n")}
          rows={10}
          style={{ width: "100%", marginTop: "10px", whiteSpace: "pre-wrap" }}
        />
        <button
          onClick={() => setReceivedData([])}
          style={{ marginTop: "10px" }}
        >
          {t("clear")}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>{t("send")}</h2>
        <div>
          <label>
            <input
              type="radio"
              name="sendMode"
              value="text"
              checked={sendMode === "text"}
              onChange={() => setSendMode("text")}
            />
            {t("text")}
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              name="sendMode"
              value="hex"
              checked={sendMode === "hex"}
              onChange={() => setSendMode("hex")}
            />
            {t("hex")}
          </label>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          style={{ width: "100%", marginTop: "10px" }}
        />
        <button onClick={handleSendData} style={{ marginTop: "10px" }}>
          {t("send")}
        </button>
      </div>
    </div>
  );
}

export default App;
