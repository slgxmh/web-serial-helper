# web-serial-helper

A helper library to simplify the use of the Web Serial API.

## Installation

```bash
pnpm install web-serial-helper
```

## Usage

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
        console.log('Received:', data);
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
    const data = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
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

## API

### `WebSerial.isSupported(): boolean`
Checks if the Web Serial API is supported by the browser.

### `constructor()`
Creates a new `WebSerial` instance.

### `async requestPort(): Promise<void>`
Requests a serial port from the user.

### `async open(options: SerialOptions): Promise<void>`
Opens the selected serial port with the given options.

### `async close(): Promise<void>`
Closes the serial port.

### `async startReading(onData: (data: Uint8Array) => void, onError?: (error: any) => void): Promise<void>`
Starts reading data from the port. The `onData` callback is called with the incoming data.

### `async startReadingHex(onData: (data: string) => void, onError?: (error: any) => void): Promise<void>`
Starts reading data from the port and provides it as a hex string to the `onData` callback.

### `async stopReading(): Promise<void>`
Stops the ongoing reading loop.

### `async write(data: Uint8Array): Promise<void>`
Writes data to the serial port.

### `async writeHex(hex: string): Promise<void>`
Writes a hex string to the serial port.

### `getPort(): SerialPort | null`
Gets the currently selected `SerialPort` object.
