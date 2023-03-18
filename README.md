# Kart Patcher

A modern client patcher and installer of KartRider.

<p align="center">
  <img
    src="https://user-images.githubusercontent.com/2935980/226101648-98b0d27a-221d-48b6-b19d-0b6da46fb663.gif"
    alt="Kart Patcher demo"
  />
</p>

## Highlights

 - **Cross region**
   - Support Taiwanese, Korean and Chinese server.
 - **Easy migration**
   - Detect existing installation path automatically.
 - **Seamless integration**
   - Support KartRider's native patching mechanism.
 - **Realtime update**
   - Sync with official patch server to get the latest update information.
 - **SPEED UP**
   - Download patch files in full speed by multi-threaded mode.
 - **Portable**
   - Single executable without installation needed.
 - **More than just a patcher**
   - Support fresh game client installation too.

## Core features

### Installation

Install the fresh game client in a specified path.

<img
  src="https://user-images.githubusercontent.com/2935980/223738975-e01af533-ba24-4c81-912f-32ee4d93379f.png"
  width="600"
  alt="Installation"
/>

### Update

Update existing game client to the latest version.

<img
  src="https://user-images.githubusercontent.com/2935980/223739487-4705c872-5826-42c0-9738-f0630b951029.png"
  width="600"
  alt="Update"
/>

### Repair

Repair the game client if it is damaged or missing some files.

<img
  src="https://user-images.githubusercontent.com/2935980/223739741-203c6b98-ed0c-46ee-8b1a-ebe93e491f3f.png"
  width="600"
  alt="Repair"
/>

### Registry fixing

Fix the registry entries if they are not set correctly or the game cannot be launched normally.

<img
  src="https://user-images.githubusercontent.com/2935980/223739957-ce38311f-1faf-4f29-9bd6-aecf286be56f.png"
  width="600"
  alt="Registry fixing"
/>

## Settings explanation

### Game Settings

Select the game client installed path of each region.

If there is an existing installation, the path will be detected automatically when you try to choose the path.

<img
  src="https://user-images.githubusercontent.com/2935980/223740303-e9669592-961c-4ec4-8e7d-491e63d4ec4b.png"
  width="600"
  alt="Game Settings"
/>

### Language Settings

Select the language of the application.

Currently only English and Traditional Chinese are supported.

<img
  src="https://user-images.githubusercontent.com/2935980/223740375-3e4f1710-81fd-4888-bd37-ca0f07202a4d.png"
  width="600"
  alt="Language Settings"
/>

### Download Settings

Select file downloading preferences.

**Max connections**

The maximum number of connections to the server, set a proper number to improve download speed.

If some files cannot be downloaded successfully, try to decrease this number, default to 8 connections.

**Smart patch**

Download only the necessary update bytes, follow the game's own mechanism (aka the delta files\*), it can speed up the update process.

If you cannot complete the update successfully, please turn off this option. Patch for Korean server does not support this feature yet.

\* The delta files will be merged with the original file by game's patcher to generate the final file.

<img
  src="https://user-images.githubusercontent.com/2935980/223740450-b3cb82f0-dae4-4b12-9e5d-8d4fcfa9cf1a.png"
  width="600"
  alt="Download Settings"
/>

## Supported platforms

Windows 10 or later

## Development

### Install the dependencies
```bash
yarn
```

### Start the app in development mode
```bash
yarn dev
```

### Lint the files
```bash
yarn lint:js # for .js, .ts and html/ts in .vue files
yarn lint:style # for css, scss and scss in .vue files
```

### Build the app for production
```bash
yarn build
```

## License

Licensed under the [MIT License](LICENSE).
