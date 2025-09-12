# Serial

A web-based serial port debugging tool, built with the Web Serial API.

This project provides a user-friendly interface for connecting to, reading from, and writing to serial devices directly in your browser.

## ✨ Features

- **Connect/Disconnect:** Easily connect to available serial ports.
- **Baud Rate Selection:** Choose from common baud rates (9600, 19200, 38400, 57600, 115200).
- **Send Data:** Send data to the connected device in either `Text` or `Hex` format.
- **Receive Data:** View incoming data in either `Text` or `Hex` format.
- **Clear Output:** Clear the received data log.
- **Localization:** Supports English and Chinese.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, daisyUI
- **Serial Communication:** Web Serial API
- **Core Logic:** A custom helper library for the Web Serial API.
- **Monorepo:** Managed with pnpm workspaces.

## 📦 Packages

This monorepo contains two main packages:

- `lib/`: A helper library (`web-serial-helper`) that wraps the Web Serial API for easier use.
- `web/`: The React web application that provides the UI for the serial debugging tool.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd serial
    ```

2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```

### Running the Application

To start the development server for the web application, run:

```bash
pnpm --filter web dev
```

This will start the Vite development server, and you can access the application at `http://localhost:5173` (or another port if 5173 is in use).

## 🌐 Browser Support

This tool relies on the **Web Serial API**, which is not supported by all browsers. Please use a compatible browser like:

- Google Chrome (version 78 or later)
- Microsoft Edge (version 78 or later)
- Opera (version 65 or later)

You can check the latest browser compatibility on [caniuse.com](https://caniuse.com/web-serial).

## 📄 License

See the [LICENSE](LICENCE) file for details.
