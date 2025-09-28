import {
  projcetItemDeleteAtom,
  projectCurrentItemAtom,
  projectItemUpdateAtom,
} from "@/stores/project";
import type { ProjectItemT } from "@/types/project";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWebSerial } from "web-serial-helper/react";

export function ItemView() {
  const [currentItem] = useAtom(projectCurrentItemAtom);
  const [, update] = useAtom(projectItemUpdateAtom);
  const [, deleteItem] = useAtom(projcetItemDeleteAtom);

  const [itemName, setItemName] = useState(currentItem.name);
  const [baudRate, setBaudRate] = useState(currentItem.baudRate);
  const [sendMode, setSendMode] = useState(currentItem.sendMode);
  const [sendData, setSendData] = useState(currentItem.sendData);
  const [receiveMode, setReceiveMode] = useState(currentItem.receiveMode);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);

  const { t } = useTranslation();

  const onData = useCallback((data: Uint8Array) => {
    const textDecoder = new TextDecoder();
    setReceivedData((prev) => [...prev, textDecoder.decode(data)]);
  }, []);

  const onDataHex = useCallback((data: string) => {
    setReceivedData((prev) => [...prev, `[HEX] ${data}`]);
  }, []);

  const {
    isSupported,
    isConnected,
    requestPort,
    open,
    close,
    write,
    writeHex,
    getPorts,
  } = useWebSerial({
    onData: receiveMode === "text" ? onData : undefined,
    onDataHex: receiveMode === "hex" ? onDataHex : undefined,
    onError: (error) => {
      console.error("Serial error:", error);
    },
  });

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
    const fetchPorts = async () => {
      if (isSupported) {
        try {
          const ports = await getPorts();
          setAvailablePorts(ports);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchPorts();
  }, [isSupported, getPorts, isConnected]);

  const handleConnect = useCallback(async () => {
    try {
      await requestPort();
      await open({ baudRate });
    } catch (error) {
      console.error(error);
    }
  }, [baudRate, open, requestPort]);

  const handleAutoConnect = useCallback(async () => {
    if (availablePorts.length === 0) {
      return;
    }
    try {
      await open({ baudRate });
    } catch (error) {
      console.error(error);
    }
  }, [availablePorts.length, baudRate, open]);

  const handleDisconnect = useCallback(async () => {
    try {
      await close();
      setReceivedData([]); // Clear received data on disconnect
    } catch (error) {
      console.error(error);
    }
  }, [close]);

  const handleSendData = useCallback(async () => {
    if (!sendData) {
      return;
    }

    try {
      if (sendMode === "hex") {
        await writeHex(sendData);
      } else {
        const textEncoder = new TextEncoder();
        await write(textEncoder.encode(sendData));
      }
    } catch (error) {
      console.error(error);
      alert(String(error));
    }
  }, [sendData, sendMode, write, writeHex]);

  return (
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
              <button onClick={handleAutoConnect} className="btn btn-accent">
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
  );
}
