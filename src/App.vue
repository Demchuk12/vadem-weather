<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
import FavoriteLimitModal from '@/components/weather/FavoriteLimitModal.vue'
import { useDocumentSettings } from '@/composables/useDocumentSettings'

useDocumentSettings()
</script>

<template>
  <AppHeader />
  <main class="container main">
    <AppTabs class="main__tabs" />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <KeepAlive include="HomeView">
          <component :is="Component" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <FavoriteLimitModal />
</template>

<style scoped>
.main {
  display: grid;
  gap: var(--space-5);
  padding-bottom: var(--space-10);
}

.main__tabs {
  justify-self: start;
}
</style>
