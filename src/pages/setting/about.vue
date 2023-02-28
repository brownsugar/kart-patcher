<template>
  <q-list class="list-about">
    <q-item>
      <q-item-section>
        <q-item-label>{{ $t('setting.about.content.version') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label>
          {{ version }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item>
      <q-item-section>
        <q-item-label>{{ $t('setting.about.content.developer') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label>
          <a
            href="https://github.com/brownsugar"
            target="_blank"
          >Brownsugar</a>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item>
      <q-item-section>
        <q-item-label>{{ $t('setting.about.content.repository') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label>
          <a
            href="https://github.com/brownsugar/kart-patcher"
            target="_blank"
          >
            <q-icon
              name="fa-brands fa-github"
              size="xs"
            />
            brownsugar/kart-patcher</a>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item>
      <q-item-section>
        <q-item-label>{{ $t('setting.about.content.license') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label class="text-right">
          <a
            href="https://www.flaticon.com/free-icons/taiwan"
            title="taiwan icons"
            target="_blank"
          >Taiwan icons created by Freepik - Flaticon</a>
          <br>
          <a
            href="https://www.flaticon.com/free-icons/korea"
            title="korea icons"
            target="_blank"
          >Korea icons created by Freepik - Flaticon</a>
          <br>
          <a
            href="https://www.flaticon.com/free-icons/china"
            title="china icons"
            target="_blank"
          >China icons created by Freepik - Flaticon</a>
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'

const version = window.__KP_APP__.version
</script>
<script lang="ts">
export default defineComponent({
  name: 'SettingAbout'
})
</script>

<style lang="scss" scoped>
.list-about {

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
