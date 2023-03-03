export default {
  lang: '中文（繁體）',
  app: {
    name: 'Kart Patcher'
  },
  general: {
    yes: '是',
    no: '否'
  },
  region: {
    tw: '台服',
    kr: '韓服',
    cn: '國服',
    clickToRefresh: '點擊以刷新',
    clickToSet: '點擊以設定',
    status: {
      0: '未知',
      100: '最新版本',
      200: '客戶端需更新',
      300: '未安裝客戶端',
      301: '未指定客戶端路徑',
      400: '伺服器維護中',
      401: '找不到伺服器'
    }
  },
  client: {
    localVersion: '本機版本',
    serverVersion: '線上版本'
  },
  menu: {
    home: '首頁',
    settings: '設定',
    updateAvailable: '發現新版本！',
    minimize: '縮小',
    exit: '離開'
  },
  action: {
    viewDetails: '查看詳情',
    viewPatchNews: '最新更新資訊',
    backToHome: '回首頁'
  },
  setting: {
    message: {
      updateSuccess: '設定已成功更新。'
    },
    game: {
      name: '遊戲設定',
      description: '選擇各伺服器遊戲主程式安裝路徑。',
      content: {
        browse: '瀏覽...',
        selectDirectory: '請選擇遊戲主程式安裝路徑...',
        pathDetected: '已自動偵測到您的遊戲安裝路徑，是否要使用此路徑？',
        openInExplorer: '在檔案總管中開啟',
        pathSelected: '已選擇遊戲主程式安裝路徑。',
        emptyPathSelected: '選擇的路徑不包含遊戲主程式，將執行完整安裝。'
      }
    },
    language: {
      name: '語言設定',
      description: '選擇更新器界面顯示語言。',
      content: {
        locale: '顯示語言'
      }
    },
    download: {
      name: '下載設定',
      description: '選擇檔案下載偏好設定。',
      content: {
        connections: {
          name: '最大連線數',
          description: '設置適當的連線數有助於提升下載速度。'
        },
        deltaMode: {
          name: '智慧更新模式',
          description: '僅下載必要的更新檔片段（跟隨遊戲本身機制），可加快下載速度。若無法順利完成更新時請關閉此選項。'
        }
      }
    },
    about: {
      name: '關於',
      description: '查看程式作者及版本資訊。',
      content: {
        version: '程式版本',
        developer: '開發人員',
        repository: '專案原始碼',
        license: '授權聲明'
      }
    },
    back: {
      name: '返回',
      description: '返回上一個頁面。'
    }
  },
  patcher: {
    updateNow: '立即更新',
    installNow: '立即安裝',
    repair: '修復安裝',
    fixRegistry: '修復註冊表',
    ready: '就緒',
    inProgress: '更新進行中',
    done: '更新完成',
    waiting: '等候操作',
    busying: '請稍候...',
    registry: {
      missing: '偵測到註冊表設定缺失，可能影響到遊戲啓動，是否要立即修復設定？',
      fixSuccess: '註冊表修復成功。',
      fixFailed: '註冊表修復失敗。',
      nothingToFix: '註冊表設定正常，無需修復。'
    },
    step: {
      processPatchInfo: '獲取更新資訊中',
      checkLocal: '檢查本機檔案中',
      download: '下載檔案中',
      extract: '解壓縮檔案中',
      apply: '套用檔案中',
      validate: '驗證檔案中'
    }
  }
}
