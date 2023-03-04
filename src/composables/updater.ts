import { ref } from 'vue'
import { validate, compare } from 'compare-versions'

interface IGitHubTagApi {
  name: string
  zipball_url: string
  tarball_url: string
  commit: {
    sha: string
    url: string
  }
  node_id: string
}

export const useUpdater = (repo: string, localVersion: string) => {
  const updateAvailable = ref(false)

  const check = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=1`)
      const data = await response.json() as IGitHubTagApi[]
      const latestVersion = (data[0]?.name ?? '').slice(1)
      if (validate(latestVersion))
        updateAvailable.value = compare(latestVersion, localVersion, '>')
      else
        updateAvailable.value = false
    } catch (e) {
      updateAvailable.value = false
    }
  }

  return {
    updateAvailable,
    check
  }
}
