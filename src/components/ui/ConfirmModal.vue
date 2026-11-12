<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'
import BaseModal from './BaseModal.vue'
import { useI18n } from '@/composables/useI18n'

defineProps<{ open: boolean; title: string; message: string; confirmLabel: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

const { t } = useI18n()
</script>

<template>
  <BaseModal :open="open" :title="title" tone="danger" @close="emit('cancel')">
    <template #icon><BaseIcon name="trash" /></template>
    <p>{{ message }}</p>
    <template #actions>
      <BaseButton variant="ghost" @click="emit('cancel')">{{ t('modal.cancel') }}</BaseButton>
      <BaseButton variant="danger" data-autofocus @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
