<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { MAX_FAVORITES } from '@/constants'
import { useI18n } from '@/composables/useI18n'
import { useFavoritesStore } from '@/stores/favorites.store'
import { cityName, countryFlag } from '@/utils/city'

const { t, locale } = useI18n()
const favorites = useFavoritesStore()
const { cities, pendingCity } = storeToRefs(favorites)

const pendingName = computed(() =>
  pendingCity.value ? cityName(pendingCity.value, locale.value) : '',
)
</script>

<template>
  <BaseModal
    :open="!!pendingCity"
    :title="t('favorites.limitTitle')"
    tone="warning"
    @close="favorites.cancelPending"
  >
    <template #icon><BaseIcon name="star" filled /></template>
    <p>{{ t('favorites.limitText', { city: pendingName, n: MAX_FAVORITES }) }}</p>
    <ul class="limit-list">
      <li v-for="city in cities" :key="city.id" class="limit-list__item">
        <span class="limit-list__flag" aria-hidden="true">{{ countryFlag(city.country) }}</span>
        <span class="limit-list__name">{{ cityName(city, locale) }}</span>
        <BaseButton
          size="sm"
          variant="ghost"
          icon="trash"
          @click="favorites.replaceWithPending(city.id)"
        >
          {{ t('favorites.limitRemove') }}
        </BaseButton>
      </li>
    </ul>
    <template #actions>
      <BaseButton variant="secondary" data-autofocus @click="favorites.cancelPending">
        {{ t('modal.cancel') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.limit-list {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-4);
}

.limit-list__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text);
}

.limit-list__flag {
  font-size: 20px;
}

.limit-list__name {
  flex: 1;
  font-weight: 700;
}

.limit-list__item :deep(.btn:hover) {
  color: var(--danger);
  background: var(--danger-soft);
}
</style>
