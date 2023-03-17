export default {
  lang: 'English',
  app: {
    name: 'Kart Patcher'
  },
  general: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK'
  },
  region: {
    tw: 'Taiwanese Server',
    kr: 'Korean Server',
    cn: 'Chinese Server',
    clickToRefresh: 'Click to refresh',
    clickToSet: 'Click to set',
    status: {
      0: 'Unknown',
      100: 'Latest version',
      200: 'Client outdated',
      201: 'Client damaged',
      300: 'Client not installed',
      301: 'Client path not set',
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
        browse: 'Browse...',
        selectDirectory: 'Please select the client installed path...',
        pathDetected: 'Client installed path detected, confirm to use this path?',
        openInExplorer: 'Open in Explorer',
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
          description: 'Download only the necessary update bytes, follow the game\'s own mechanism, it can speed up the update process. If you cannot complete the update successfully, please turn off this option.'
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
    done: 'Completed',
    waiting: 'Waiting for user action',
    busying: 'Please wait...',
    noLeaving: 'No leaving during the update process, please wait for the update to complete.',
    step: {
      processPatchInfo: 'Processing patch info',
      checkLocal: 'Checking local files',
      checkDisk: 'Checking disk space',
      download: 'Downloading files',
      extract: 'Extracting files',
      apply: 'Applying files',
      validate: 'Validating files'
    },
    registry: {
      missing: 'Missed registry entries detected, game starting might be affected, do you want to fix it now?',
      fixSuccess: 'Successfully fixed registry entries.',
      fixFailed: 'Failed to fix registry entries.',
      nothingToFix: 'Registry entries look good, nothing to fix.'
    },
    errorDialog: {
      title: 'An error occurred',
      description: 'There was an error during the update process, please try again later.',
      code: 'Error code: ',
      message: 'Error message: ',
      insufficientDiskSpace: 'Insufficient disk space, please free up enough space and try again. (Required space: {estimated}, remaining space: {free})',
      processRunning: 'Game process is running, please close it and try again.'
    }
  }
}
