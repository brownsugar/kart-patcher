import { useQuasar } from 'quasar'

export const useNotify = () => {
  const { notify } = useQuasar()
  const sharedOptions = {
    classes: 'half-rounded-borders',
    progress: true,
    actions: [{
      icon: 'fa-solid fa-xmark',
      color: 'light',
      size: 'sm',
      dense: true,
      round: true
    }]
  }

  return {
    success (message: string) {
      notify({
        ...sharedOptions,
        message,
        color: 'positive',
        icon: 'fa-solid fa-circle-check'
      })
    },
    warning (message: string) {
      notify({
        ...sharedOptions,
        message,
        color: 'warning',
        icon: 'fa-solid fa-triangle-exclamation'
      })
    },
    error (message: string) {
      notify({
        ...sharedOptions,
        message,
        color: 'negative',
        icon: 'fa-solid fa-circle-exclamation'
      })
    }
  }
}
