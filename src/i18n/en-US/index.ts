export default {
  lang: 'English',
  app: {
    name: 'Kart Patcher'
  },
  region: {
    tw: 'Taiwanese Server',
    kr: 'Korean Server',
    cn: 'Chinese Server',
    clickToRefresh: 'Click to refresh',
    status: {
      0: 'Unknown',
      100: 'Latest version',
      200: 'Client outdated',
      300: 'Client not installed',
      400: 'Server under maintenance',
      401: 'Server not found'
    }
  },
  client: {
    localVersion: 'Local version',
    serverVersion: 'Server version'
  },
  menu: {
    home: 'Home',
    settings: 'Settings',
    updateAvailable: 'New version found!',
    minimize: 'Minimize',
    exit: 'Exit'
  },
  action: {
    viewDetails: 'View Details',
    viewPatchNews: 'Latest Patch News',
    backToHome: 'Back to Home'
  },
  setting: {
    message: {
      updateSuccess: 'Settings successfully updated.'
    },
    game: {
      name: 'Game Settings',
      description: 'Select the game client path of each region.',
      content: {
        selectDirectory: 'Please select the client install path',
        pathSelected: 'Client path successfully selected.',
        emptyPathSelected: 'The selected path does not contain the client, a full installation will be performed.'
      }
    },
    language: {
      name: 'Language Settings',
      description: 'Select the language of the application.',
      content: {
        locale: 'Display language'
      }
    },
    download: {
      name: 'Download Settings',
      description: 'Select file downloading preferences.',
      content: {
        connections: {
          name: 'Max Connections',
          description: 'Set a proper number of connections to improve download speed.'
        },
        deltaMode: {
          name: 'Smart Patch',
          description: 'Download only the necessary update bytes (follow the game\'s own mechanism), it can increase the download speed. If you cannot complete the update successfully, please turn off this option.'
        }
      }
    },
    about: {
      name: 'About',
      description: 'View the author and version info.',
      content: {
        version: 'App version',
        developer: 'Developer',
        repository: 'Source code',
        license: 'License notice'
      }
    },
    back: {
      name: 'Back',
      description: 'Back to previous page.'
    }
  },
  patcher: {
    updateNow: 'Update now',
    installNow: 'Install now',
    repair: 'Repair installation',
    fixRegistry: 'Fix registry',
    ready: 'Ready',
    inProgress: 'Update in progress',
    done: 'Update completed',
    waiting: 'Waiting for user action',
    busying: 'Please wait...',
    step: {
      processPatchInfo: 'Processing patch info',
      checkLocal: 'Checking local files',
      download: 'Downloading files',
      extract: 'Extracting files',
      apply: 'Applying files',
      validate: 'Validating files'
    }
  }
}
