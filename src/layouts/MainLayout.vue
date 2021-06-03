<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          {{ $t("appname") }}
        </q-toolbar-title>

        <q-select
          v-model="lang"
          :options="langOptions"
          :label="$t('language')"
          dense
          outlined
          emit-value
          bg-color="light-blue-1"
          map-options
          style="min-width: 150px"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from "@vue/composition-api"
  import { Cookies, Quasar } from "quasar"
  import { i18n } from "boot/i18n"

  export default defineComponent({
    name: "MainLayout",
    setup() {

      const lang = ref(Cookies.has("locale") ? Cookies.get("locale") : Quasar.lang.getLocale())
      i18n.locale = lang.value
      watch(lang, current => {
        // @ts-ignore
        i18n.locale = current
        // @ts-ignore
        Cookies.set("locale", current)
      })

      const langOptions = [
        { value: "en-us", label: "English" },
        { value: "ru-ru", label: "Русский" }
      ]
      return { lang, langOptions }
    }
  })
</script>
