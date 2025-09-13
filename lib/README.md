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
