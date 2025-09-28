# web-serial-helper

A helper library to simplify the use of the Web Serial API.

## Installation

```bash
pnpm install web-serial-helper
```

## Usage

### Example 1: Connect and read/write

```typescript
import { WebSerial } from 'web-serial-helper';

const serial = new WebSerial();

async function connect() {
  if (!WebSerial.isSupported()) {
    alert('Web Serial API not supported in this browser.');
    return;
  }

  try {
    await serial.requestPort();
    await serial.open({ baudRate: 9600 });
    console.log('Serial port opened');

    // Start reading data
    serial.startReading(
      (data) => {
        const textDecoder = new TextDecoder();
        console.log('Received:', textDecoder.decode(data));
      },
      (error) => {
        console.error('Read error:', error);
      }
    );

  } catch (error) {
    console.error('Error:', error);
  }
}

async function sendData() {
  try {
    const data = new TextEncoder().encode("Hello");
    await serial.write(data);
    console.log('Data sent');
  } catch (error) {
    console.error('Write error:', error);
  }
}

async function disconnect() {
  await serial.close();
  console.log('Serial port closed');
}
```

### Example 2: Reconnect to a previously permitted port

```typescript
import { WebSerial } from 'web-serial-helper';

const serial = new WebSerial();

async function reconnect() {
    if (!WebSerial.isSupported()) {
        alert('Web Serial API not supported in this browser.');
        return;
    }

    // Get previously permitted ports
    const availablePorts = await WebSerial.getPorts();
    if (availablePorts.length > 0) {
        try {
            // Set the first available port
            serial.setPort(availablePorts[0]);
            await serial.open({ baudRate: 115200 });
            console.log('Serial port reconnected');
        } catch(err) {
            console.error(err);
        }
    } else {
        // Or request a new one if no ports were available
        await serial.requestPort();
    }
}
```

## API

### `WebSerial.isSupported(): boolean`
Checks if the Web Serial API is supported by the browser.

### `WebSerial.getPorts(): Promise<SerialPort[]>`
Gets the list of available serial ports that have been previously granted permission.

### `constructor()`
Creates a new `WebSerial` instance.

### `setPort(port: SerialPort): void`
Sets a serial port to be used. This can be used with a `SerialPort` object from `WebSerial.getPorts()`.

### `async requestPort(): Promise<void>`
Requests a serial port from the user via a browser prompt.

### `async open(options: SerialOptions): Promise<void>`
Opens the selected serial port with the given options (e.g., `baudRate`).

### `async close(): Promise<void>`
Closes the serial port.

### `async startReading(onData: (data: Uint8Array) => void, onError?: (error: any) => void): Promise<void>`
Starts reading data from the port. The `onData` callback is called with the incoming data as a `Uint8Array`.

### `async startReadingHex(onData: (data: string) => void, onError?: (error: any) => void): Promise<void>`
Starts reading data from the port and provides it as a hex string to the `onData` callback.

### `async stopReading(): Promise<void>`
Stops the ongoing reading loop.

### `async write(data: Uint8Array): Promise<void>`
Writes a `Uint8Array` to the serial port.

### `async writeHex(hex: string): Promise<void>`
Writes a hex string to the serial port.

### `getPort(): SerialPort | null`
Gets the currently selected `SerialPort` object.

## React Hook Usage

This library also provides a React hook `useWebSerial` for easy integration with React applications.

### Installation

You need to have `react` installed in your project.

### Example

```jsx
import { useWebSerial } from 'web-serial-helper/react';
import { useState, useEffect } from 'react';

function SerialComponent() {
  const [receivedData, setReceivedData] = useState([]);
  const {
    isSupported,
    isConnected,
    port,
    requestPort,
    open,
    close,
    write,
    getPorts,
    setPort,
  } = useWebSerial({
    onData: (data) => {
      const textDecoder = new TextDecoder();
      setReceivedData(prev => [...prev, textDecoder.decode(data)]);
    },
  });

  useEffect(() => {
    const autoConnect = async () => {
      const ports = await getPorts();
      if (ports.length > 0) {
        setPort(ports[0]);
        await open({ baudRate: 9600 });
      }
    };
    if (isSupported && !isConnected) {
      autoConnect();
    }
  }, [isSupported, isConnected, getPorts, setPort, open]);

  const handleConnectClick = async () => {
    await requestPort();
    if (port) {
      await open({ baudRate: 9600 });
    }
  };

  const handleSendData = async () => {
    const textEncoder = new TextEncoder();
    await write(textEncoder.encode("Hello from React!"));
  };

  return (
    <div>
      <h1>Web Serial with React</h1>
      {isSupported ? (
        <div>
          {isConnected ? (
            <button onClick={close}>Disconnect</button>
          ) : (
            <button onClick={handleConnectClick}>Connect</button>
          )}
          <button onClick={handleSendData} disabled={!isConnected}>Send "Hello"</button>
          <div>
            <h2>Received Data:</h2>
            <ul>
              {receivedData.map((data, index) => (
                <li key={index}>{data}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Web Serial API is not supported in this browser.</p>
      )}
    </div>
  );
}
```

### `useWebSerial(options?: UseWebSerialOptions)`

The hook takes an optional `options` object with the following properties:

-   `onData?: (data: Uint8Array) => void`: Callback for handling incoming data as a `Uint8Array`.
-   `onDataHex?: (data: string) => void`: Callback for handling incoming data as a hex string.
-   `onError?: (error: any) => void`: Callback for handling errors.

### Return Values

The hook returns an object with the following properties:

-   `isSupported: boolean`: Indicates if the Web Serial API is supported.
-   `port: SerialPort | null`: The current `SerialPort` object.
-   `isConnected: boolean`: Indicates if a serial port is connected.
-   `requestPort: () => Promise<void>`: Function to request a serial port from the user.
-   `open: (options: SerialOptions) => Promise<void>`: Function to open the selected serial port.
-   `close: () => Promise<void>`: Function to close the serial port.
-   `write: (data: Uint8Array) => Promise<void>`: Function to write a `Uint8Array` to the port.
-   `writeHex: (hex: string) => Promise<void>`: Function to write a hex string to the port.
-   `getPorts: () => Promise<SerialPort[]>`: Function to get previously permitted serial ports.
-   `setPort: (port: SerialPort) => void`: Function to manually set the serial port.
