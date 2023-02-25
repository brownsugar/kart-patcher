import { useQuasar } from 'quasar'

export const useNotify = () => {
  const { notify } = useQuasar()

  return {
    success (message: string) {
      notify({
        classes: 'half-rounded-borders',
        message,
        color: 'positive',
        icon: 'fa-solid fa-circle-check',
        progress: true
      })
    },
    warning (message: string) {
      notify({
        classes: 'half-rounded-borders',
        message,
        color: 'warning',
        icon: 'fa-solid fa-triangle-exclamation',
        progress: true
      })
    }
  }
}
