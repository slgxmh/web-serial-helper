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
    port,
    isConnected,
    requestPort,
    open,
    close,
    write,
    writeHex,
    getPorts,
  } = useWebSerial({
    onData: (data) => {
      const textDecoder = new TextDecoder();
      setReceivedData(prev => [...prev, textDecoder.decode(data)]);
    },
    onError: (error) => {
      console.error('Serial error:', error);
    }
  });

  useEffect(() => {
    // You can get available ports and auto connect
    const autoConnect = async () => {
        const availablePorts = await getPorts();
        if (availablePorts.length > 0) {
            // open the first available port
            await open({ baudRate: 9600 });
        }
    }
    if(isSupported && !isConnected) {
        autoConnect();
    }
  }, [getPorts, isSupported, isConnected, open]);

  const handleConnect = async () => {
    await requestPort();
    if (port) {
      await open({ baudRate: 9600 });
    }
  };

  const handleSend = async () => {
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
            <button onClick={handleConnect}>Connect</button>
          )}
          <button onClick={handleSend} disabled={!isConnected}>Send "Hello"</button>
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

-   `onData?: (data: Uint8Array) => void`: Callback function to handle incoming data as a `Uint8Array`.
-   `onDataHex?: (data: string) => void`: Callback function to handle incoming data as a hex string.
-   `onError?: (error: any) => void`: Callback function to handle errors.

### Return Values

The hook returns an object with the following properties:

-   `isSupported: boolean`: A boolean indicating whether the Web Serial API is supported by the browser.
-   `port: SerialPort | null`: The currently selected `SerialPort` object.
-   `isConnected: boolean`: A boolean indicating whether a serial port is currently connected.
-   `requestPort: () => Promise<void>`: A function to request a serial port from the user.
-   `open: (options: SerialOptions) => Promise<void>`: A function to open the selected serial port.
-   `close: () => Promise<void>`: A function to close the serial port.
-   `write: (data: Uint8Array) => Promise<void>`: A function to write a `Uint8Array` to the serial port.
-   `writeHex: (hex: string) => Promise<void>`: A function to write a hex string to the serial port.
-   `getPorts: () => Promise<SerialPort[]>`: A function to get the list of available serial ports that have been previously granted permission.
