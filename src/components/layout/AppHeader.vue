<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import AppLogo from './AppLogo.vue'
import IconButton from '@/components/ui/IconButton.vue'
import SegmentedControl, { type SegmentOption } from '@/components/ui/SegmentedControl.vue'
import { useI18n } from '@/composables/useI18n'
import { useThemeTransition } from '@/composables/useThemeTransition'
import { useSettingsStore } from '@/stores/settings.store'
import type { Locale } from '@/types'

const settings = useSettingsStore()
const { locale, resolvedTheme } = storeToRefs(settings)
const { t } = useI18n()
const toggleTheme = useThemeTransition()

const localeOptions: SegmentOption<Locale>[] = [
  { value: 'uk', label: 'UA' },
  { value: 'en', label: 'EN' },
]

const isDark = computed(() => resolvedTheme.value === 'dark')
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <AppLogo />
      <div class="header__controls">
        <SegmentedControl
          :model-value="locale"
          :options="localeOptions"
          :label="t('settings.language')"
          @update:model-value="settings.setLocale"
        />
        <IconButton
          :icon="isDark ? 'sun' : 'moon'"
          :label="isDark ? t('settings.light') : t('settings.dark')"
          @click="toggleTheme"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding-block: var(--space-5);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.header__controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header__controls :deep(.segmented__item) {
  padding-inline: var(--space-3);
}
</style>
