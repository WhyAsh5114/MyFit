# Setup for development on Android platform with WSL and Windows

## Prerequisites

- Enable USB debugging and WiFi debugging on your physical device OR run an emulator under WSL's Android Studio (needs a lot of RAM)

## Install Android studio under WSL

1. Go to [`Android Studio download page`](https://developer.android.com/studio)
2. Get the linux `.tar.gz` download link
3. Open WSL, in the shell
4. `wget "latest linux package link"`
5. Follow this: [https://developer.android.com/studio/install#linux](https://developer.android.com/studio/install#linux)
6. Set it up with the wizard inside WSL2

## Deploy app to device

### Emulator

1. Run the development **OR** preview server

   ```bash
   # Development
   pnpm dev

   # Preview
   pnpm build && pnpm preview
   ```

2. Set the `PUBLIC_BETTER_AUTH_URL` env var to the Android emulator's loopback address

   ```env
   # Development
   PUBLIC_BETTER_AUTH_URL="http://10.0.2.2:5173"

   # Preview
   PUBLIC_BETTER_AUTH_URL="http://10.0.2.2:4173"
   ```

3. Sync configuration with android project allowing cleartext for development

   ```bash
   pnpm sync:dev
   ```

4. Open the android folder of this project inside Android Studio, build, and deploy to the emulator

### Physical device

#### Connect via WiFi debugging

1. Install [`platform-tools`](https://dl.google.com/android/repository/platform-tools-latest-windows.zip) on Windows
2. In powershell, run the adb server

   ```powershell
   adb start-server
   ```

3. In powershell, connect using a TCP connection, this will prompt a request in your Phone, accept it

   ```powershell
   adb tcpip 5555
   ```

4. Get your phone's IP address from WiFi settings

5. Inside WSL, connect to the device

   ```bash
   adb connect <phone-ip-address>:5555
   ```

6. To check if connection successful

   ```bash
   adb devices

   List of devices attached
   192.168.0.15:5555       device
   ```

#### Deploy to physical device

1. Run the development **OR** preview server

   ```bash
   # Development
   pnpm dev

   # Preview
   pnpm build && pnpm preview
   ```

2. Reverse the exposed port for the running server

   ```bash
   # Development
   adb reverse tcp:5173 tcp:5173

   # Preview
   adb reverse tcp:4173 tcp:4173
   ```

3. Set the `PUBLIC_BETTER_AUTH_URL` env var to the running server's address

   ```env
   # Development
   PUBLIC_BETTER_AUTH_URL="http://localhost:5173"

   # Preview
   PUBLIC_BETTER_AUTH_URL="http://localhost:4173"
   ```

4. Sync configuration with android project allowing cleartext for development

   ```bash
   pnpm sync:dev
   ```

5. Open the android folder of this project inside Android Studio, build, and deploy to the physical device
