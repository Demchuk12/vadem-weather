<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import AddBlockButton from '@/components/weather/AddBlockButton.vue'
import WeatherBlock from '@/components/weather/WeatherBlock.vue'
import { MAX_BLOCKS } from '@/constants'
import { useI18n } from '@/composables/useI18n'
import { useBlocksStore, type WeatherBlockModel } from '@/stores/blocks.store'
import { cityName } from '@/utils/city'

defineOptions({ name: 'HomeView' })

const { t, locale } = useI18n()
const blocksStore = useBlocksStore()
const { blocks, canRemove, isDetecting } = storeToRefs(blocksStore)

const blockToRemove = ref<WeatherBlockModel | null>(null)

const removeMessage = computed(() => {
  const city = blockToRemove.value?.city
  return city
    ? t('modal.confirmRemoveText', { city: cityName(city, locale.value) })
    : t('modal.confirmRemoveEmpty')
})

function confirmRemove() {
  if (blockToRemove.value) blocksStore.remove(blockToRemove.value.id)
  blockToRemove.value = null
}

onMounted(blocksStore.detectDefaultCity)
</script>

<template>
  <section class="home">
    <TransitionGroup name="list" tag="div" class="home__list">
      <WeatherBlock
        v-for="(block, index) in blocks"
        :key="block.id"
        :city="block.city"
        :removable="canRemove"
        :detecting="index === 0 && isDetecting"
        @select="blocksStore.setCity(block.id, $event)"
        @remove="blockToRemove = block"
      />
    </TransitionGroup>

    <AddBlockButton :count="blocks.length" :max="MAX_BLOCKS" @click="blocksStore.add" />

    <ConfirmModal
      :open="!!blockToRemove"
      :title="t('modal.confirmRemoveTitle')"
      :message="removeMessage"
      :confirm-label="t('modal.confirmRemove')"
      @confirm="confirmRemove"
      @cancel="blockToRemove = null"
    />
  </section>
</template>

<style scoped>
.home,
.home__list {
  display: grid;
  gap: var(--space-5);
}
</style>
