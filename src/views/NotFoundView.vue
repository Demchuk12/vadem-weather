<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <section class="not-found">
    <p class="not-found__code">404</p>
    <h1>{{ t('notFound.title') }}</h1>
    <RouterLink v-slot="{ navigate }" to="/" custom>
      <BaseButton variant="primary" icon="home" @click="navigate">{{
        t('notFound.back')
      }}</BaseButton>
    </RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-10);
  text-align: center;
}

.not-found__code {
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, var(--accent), var(--favorite));
  background-clip: text;
  color: transparent;
}
</style>
