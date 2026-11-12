<script setup lang="ts">
import { useId, useTemplateRef } from 'vue'
import IconButton from './IconButton.vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useI18n } from '@/composables/useI18n'
import { useScrollLock } from '@/composables/useScrollLock'

const props = withDefaults(
  defineProps<{ open: boolean; title: string; tone?: 'default' | 'danger' | 'warning' }>(),
  { tone: 'default' },
)
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const titleId = useId()
const dialog = useTemplateRef<HTMLElement>('dialog')

useScrollLock(() => props.open)
const { onKeydown } = useFocusTrap(dialog, () => props.open)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @keydown="onKeydown" @keydown.esc="emit('close')">
        <div class="modal__backdrop" @click="emit('close')" />
        <div
          ref="dialog"
          class="modal__dialog"
          :class="`modal__dialog--${tone}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="modal__header">
            <span v-if="$slots.icon" class="modal__icon"><slot name="icon" /></span>
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <IconButton
              class="modal__close"
              icon="close"
              :label="t('modal.close')"
              @click="emit('close')"
            />
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.actions" class="modal__actions"><slot name="actions" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--gutter);
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(6px);
}

.modal__dialog {
  position: relative;
  width: min(440px, 100%);
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: var(--surface-solid);
  box-shadow:
    var(--shadow-lg),
    0 0 0 1px var(--border);
}

.modal__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.modal__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  background: var(--accent-soft);
  color: var(--accent);
}

.modal__dialog--danger .modal__icon {
  background: var(--danger-soft);
  color: var(--danger);
}

.modal__dialog--warning .modal__icon {
  background: var(--favorite-soft);
  color: var(--favorite);
}

.modal__title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.modal__close {
  width: 34px;
  height: 34px;
  box-shadow: none;
  background: transparent;
}

.modal__body {
  color: var(--text-muted);
}

.modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration) var(--ease);
}

.modal-enter-active .modal__dialog,
.modal-leave-active .modal__dialog {
  transition: transform 320ms var(--ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__dialog,
.modal-leave-to .modal__dialog {
  transform: translateY(16px) scale(0.97);
}
</style>
