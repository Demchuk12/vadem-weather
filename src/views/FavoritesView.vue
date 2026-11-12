<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseState from '@/components/ui/BaseState.vue'
import WeatherBlock from '@/components/weather/WeatherBlock.vue'
import { MAX_FAVORITES } from '@/constants'
import { useI18n } from '@/composables/useI18n'
import { useFavoritesStore } from '@/stores/favorites.store'

const { t } = useI18n()
const { cities, count } = storeToRefs(useFavoritesStore())
</script>

<template>
  <section v-if="count" class="favorites">
    <div class="favorites__head">
      <h1 class="favorites__title">{{ t('nav.favorites') }}</h1>
      <span class="favorites__counter tabular">
        {{ t('favorites.counter', { count, n: MAX_FAVORITES }) }}
      </span>
    </div>
    <TransitionGroup name="list" tag="div" class="favorites__list">
      <WeatherBlock v-for="city in cities" :key="city.id" :city="city" :selectable="false" />
    </TransitionGroup>
  </section>

  <BaseState
    v-else
    class="favorites__empty"
    :title="t('favorites.emptyTitle')"
    :text="t('favorites.emptyText', { n: MAX_FAVORITES })"
  >
    <template #media>
      <svg class="favorites__art" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="var(--accent-soft)" />
        <path
          d="M60 28l9.5 19.3 21.3 3.1-15.4 15 3.6 21.2L60 76.6 41 86.6l3.6-21.2-15.4-15 21.3-3.1z"
          fill="var(--favorite)"
          stroke="var(--surface-solid)"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </svg>
    </template>
    <RouterLink v-slot="{ navigate }" to="/" custom>
      <BaseButton variant="primary" icon="search" @click="navigate">
        {{ t('favorites.goHome') }}
      </BaseButton>
    </RouterLink>
  </BaseState>
</template>

<style scoped>
.favorites,
.favorites__list {
  display: grid;
  gap: var(--space-5);
}

.favorites__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.favorites__title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.favorites__counter {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--favorite-soft);
  color: var(--favorite);
  font-size: 13px;
  font-weight: 700;
}

.favorites__empty {
  border-radius: var(--radius-xl);
  background: var(--surface);
  box-shadow:
    var(--shadow-md),
    0 0 0 1px var(--border);
}

.favorites__art {
  width: 120px;
  height: 120px;
  animation: float 4s ease-in-out infinite;
}
</style>
