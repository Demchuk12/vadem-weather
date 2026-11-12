<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from 'vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useCitySearch } from '@/composables/useCitySearch'
import { useClickOutside } from '@/composables/useClickOutside'
import { useI18n } from '@/composables/useI18n'
import { AUTOCOMPLETE_MIN_CHARS } from '@/constants'
import type { City } from '@/types'
import { cityName, cityRegion, countryFlag } from '@/utils/city'

const props = defineProps<{ city: City | null }>()
const emit = defineEmits<{ select: [city: City] }>()

const { t, locale } = useI18n()
const { results, status, isLoading, search, reset } = useCitySearch()
const listId = useId()

const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(0)

const selectedLabel = computed(() => (props.city ? cityName(props.city, locale.value) : ''))
const activeId = computed(() =>
  isOpen.value && status.value === 'results' ? `${listId}-${activeIndex.value}` : undefined,
)

watch(selectedLabel, (label) => (query.value = label), { immediate: true })
watch(results, () => (activeIndex.value = 0))

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function onInput() {
  open()
  search(query.value)
}

function onFocus() {
  input.value?.select()
  if (query.value !== selectedLabel.value) open()
}

function restore() {
  close()
  reset()
  query.value = selectedLabel.value
}

function choose(city: City) {
  emit('select', city)
  query.value = cityName(city, locale.value)
  close()
  reset()
  input.value?.blur()
}

function clear() {
  query.value = ''
  reset()
  open()
  input.value?.focus()
}

function move(step: 1 | -1) {
  open()
  const count = results.value.length
  if (count) activeIndex.value = (activeIndex.value + step + count) % count
}

function chooseActive() {
  const city = results.value[activeIndex.value]
  if (isOpen.value && city) choose(city)
}

useClickOutside(root, () => isOpen.value && restore())
</script>

<template>
  <div ref="root" class="search">
    <label class="search__field">
      <span class="visually-hidden">{{ t('search.label') }}</span>
      <BaseIcon class="search__icon" name="search" :size="18" />
      <input
        ref="input"
        v-model="query"
        class="search__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :placeholder="t('search.placeholder')"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-activedescendant="activeId"
        @input="onInput"
        @focus="onFocus"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="chooseActive"
        @keydown.esc="restore"
      />
      <AppSpinner v-if="isLoading" class="search__spinner" :size="16" />
      <button
        v-else-if="query"
        type="button"
        class="search__clear"
        :aria-label="t('search.clear')"
        @click="clear"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </label>

    <Transition name="dropdown">
      <div v-if="isOpen" class="search__dropdown">
        <ul v-if="status === 'results'" :id="listId" class="search__list" role="listbox">
          <li
            v-for="(option, index) in results"
            :id="`${listId}-${index}`"
            :key="option.id"
            role="option"
            class="search__option"
            :class="{ 'is-active': index === activeIndex }"
            :aria-selected="index === activeIndex"
            @pointerenter="activeIndex = index"
            @pointerdown.prevent="choose(option)"
          >
            <span class="search__flag" aria-hidden="true">
              {{ countryFlag(option.country) || '🌍' }}
            </span>
            <span class="search__text">
              <span class="search__name">{{ cityName(option, locale) }}</span>
              <span class="search__meta">{{ cityRegion(option) }}</span>
            </span>
          </li>
        </ul>
        <p v-else class="search__message" :class="{ 'search__message--error': status === 'error' }">
          <AppSpinner v-if="status === 'loading'" :size="16" />
          <template v-else-if="status === 'hint'">
            {{ t('search.hint', { n: AUTOCOMPLETE_MIN_CHARS }) }}
          </template>
          <template v-else-if="status === 'error'">{{ t('search.error') }}</template>
          <template v-else>{{ t('search.noResults') }}</template>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  width: 100%;
}

.search__field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 46px;
  padding-inline: var(--space-4) var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
  transition: box-shadow var(--duration) var(--ease);
  cursor: text;
}

.search__field:focus-within {
  box-shadow:
    inset 0 0 0 1.5px var(--accent),
    var(--focus-ring);
}

.search__icon {
  color: var(--text-subtle);
}

.search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  font-weight: 600;
}

.search__input:focus {
  outline: none;
  box-shadow: none;
}

.search__input::placeholder {
  color: var(--text-subtle);
  font-weight: 500;
}

.search__spinner {
  margin-right: var(--space-2);
  color: var(--accent);
}

.search__clear {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--text-subtle);
}

.search__clear:hover {
  color: var(--text);
  background: var(--surface-3);
}

.search__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--surface-solid);
  box-shadow:
    var(--shadow-lg),
    0 0 0 1px var(--border);
}

.search__option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.search__option.is-active {
  background: var(--accent-soft);
}

.search__flag {
  font-size: 22px;
  line-height: 1;
}

.search__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.search__name {
  font-weight: 700;
}

.search__meta {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search__message {
  display: flex;
  justify-content: center;
  padding: var(--space-4);
  font-size: 14px;
  color: var(--text-muted);
}

.search__message--error {
  color: var(--danger);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 160ms var(--ease),
    transform 220ms var(--ease);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
