# Installing Node.js and npm

To get started with the backend approach you've outlined, you need to install Node.js and npm (Node Package Manager) on your system. npm is included with Node.js, so you only need to install Node.js to get both. Here’s how you can do it:

## Preparing Your Project

### For Windows and macOS

1. **Download the Installer**:
   - Go to the [Node.js website](https://nodejs.org/).
   - Download the installer appropriate for your operating system (Windows or macOS). You can choose the LTS (Long Term Support) version for stability.
2. **Run the Installer**:
   - Open the downloaded file and follow the installation prompts.
   - Make sure to select the option to install npm and add Node.js to your PATH if prompted.
3. **Verify the Installation**:
   - Open a terminal or command prompt.
   - Run `node -v` and `npm -v` to check the installed versions of Node.js and npm, respectively. This ensures that Node.js and npm are correctly installed.

### For Linux

1. **Using a Package Manager**:
   - The installation process varies depending on the Linux distribution.
   - For Debian and Ubuntu-based distributions, you can use:

     ```bash
     sudo apt update
     sudo apt install nodejs
     sudo apt install npm
     ```

   - For other distributions, refer to the package manager or the official documentation for Node.js.
2. **Verify the Installation**:
   - After installation, open a terminal.
   - Check the installed versions by running `node -v` and `npm -v`.

### Setting Up Your Project

Once Node.js and npm are installed, navigate to your project directory in the terminal and follow these steps:

1. **Initialize Your Project** (if you haven’t already):

   ```bash
   npm init -y
   ```

   This command creates a `package.json` file in your project directory.

2. **Install Dependencies**:

   ```bash
   npm install express node-fetch dotenv
   ```

   These commands install Express, node-fetch, and dotenv, which are required for your server.

3. **Run Your Server**:

   ```bash
   node server.js
   ```

   This starts your Node.js server. Your application should now be accessible at `http://localhost:3000` (or the port number you specified).

With these steps, you should have a running backend server that can handle API requests securely, keeping your API key hidden from the client side.
