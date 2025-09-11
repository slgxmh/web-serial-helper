// Check for Web Serial API support
if (!("serial" in navigator)) {
  console.error("Web Serial API not supported in this browser.");
}

export class WebSerial {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  /**
   * Checks if the Web Serial API is supported by the browser.
   * @returns {boolean} True if supported, false otherwise.
   */
  public static isSupported(): boolean {
    return "serial" in navigator;
  }

  constructor() {}

  /**
   * Requests a serial port from the user.
   * @returns {Promise<void>}
   */
  public async requestPort(): Promise<void> {
    if (!WebSerial.isSupported()) {
      throw new Error("Web Serial API not supported.");
    }
    try {
      this.port = await (navigator as any).serial.requestPort();
    } catch (error) {
      console.error("User did not select a port.", error);
      throw new Error("User did not select a port.");
    }
  }

  /**
   * Opens the selected serial port.
   * @param {SerialOptions} options - The options for opening the serial port.
   * @returns {Promise<void>}
   */
  public async open(options: SerialOptions): Promise<void> {
    if (!this.port) {
      throw new Error("No port selected. Call requestPort() first.");
    }

    try {
      await this.port.open(options);
      if (this.port.readable) {
        this.reader = this.port.readable.getReader();
      }
      if (this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }
    } catch (error) {
      console.error("Error opening serial port:", error);
      throw error;
    }
  }

  /**
   * Closes the serial port.
   * @returns {Promise<void>}
   */
  public async close(): Promise<void> {
    if (!this.port) {
      return;
    }

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        // Ignore cancel error
      } finally {
        this.reader.releaseLock();
        this.reader = null;
      }
    }

    if (this.writer) {
      try {
        await this.writer.close();
      } catch (error) {
        // Ignore close error
      } finally {
        this.writer.releaseLock();
        this.writer = null;
      }
    }

    try {
      await this.port.close();
      this.port = null;
    } catch (error) {
      console.error("Error closing serial port:", error);
      throw error;
    }
  }

  /**
   * Stops the ongoing reading loop.
   */
  public async stopReading(): Promise<void> {
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        // Ignore cancel error, it may be already closing
      }
    }
  }

  /**
   * Starts reading data from the port and calls the callback with the data.
   * @param {(data: Uint8Array) => void} onData - Callback function to handle incoming data.
   * @param {(error: any) => void} onError - Callback function to handle errors.
   */
  public async startReading(
    onData: (data: Uint8Array) => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    if (!this.port) {
      throw new Error("Port is not open.");
    }
    if (!this.reader) {
      if (this.port.readable) {
        this.reader = this.port.readable.getReader();
      } else {
        throw new Error("Port is not readable.");
      }
    }

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          // The reader is automatically released when the stream is cancelled or closed.
          this.reader = null;
          break;
        }
        if (value) {
          onData(value);
        }
      }
    } catch (error) {
      // The read() promise rejects if the reader is cancelled.
      this.reader = null;
      // Don't log cancellation errors
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Error while reading from serial port:", error);
        if (onError) {
          onError(error);
        }
      }
    }
  }

  /**
   * Starts reading data from the port and calls the callback with the data as a hex string.
   * @param {(data: string) => void} onData - Callback function to handle incoming hex string data.
   * @param {(error: any) => void} onError - Callback function to handle errors.
   */
  public async startReadingHex(
    onData: (data: string) => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    const onDataBytes = (data: Uint8Array) => {
      const hex = Array.from(data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      onData(hex);
    };
    return this.startReading(onDataBytes, onError);
  }

  /**
   * Writes data to the serial port.
   * @param {Uint8Array} data - The data to write.
   * @returns {Promise<void>}
   */
  public async write(data: Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new Error("Port is not open for writing.");
    }
    try {
      await this.writer.write(data);
    } catch (error) {
      console.error("Error writing to serial port:", error);
      throw error;
    }
  }

  /**
   * Writes a hex string to the serial port.
   * @param {string} hex - The hex string to write. It must be a valid hex string with an even number of characters.
   * @returns {Promise<void>}
   */
  public async writeHex(hex: string): Promise<void> {
    const sanitizedHex = hex.replace(/\s/g, ""); // remove whitespace
    if (sanitizedHex.length % 2 !== 0) {
      throw new Error(
        "Invalid hex string: must have an even number of characters.",
      );
    }
    if (!/^[0-9a-fA-F]*$/.test(sanitizedHex)) {
      throw new Error("Invalid hex string: contains non-hex characters.");
    }

    const hexPairs = sanitizedHex.match(/.{1,2}/g);
    if (!hexPairs) {
      return; // Should not happen with the length check
    }
    const byteArray = new Uint8Array(
      hexPairs.map((byte) => parseInt(byte, 16)),
    );
    return this.write(byteArray);
  }

  /**
   * Gets the currently selected port.
   * @returns {SerialPort | null}
   */
  public getPort(): SerialPort | null {
    return this.port;
  }
}
