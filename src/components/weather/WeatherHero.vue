<script setup lang="ts">
import SkyScene from './SkyScene.vue'
import WeatherIcon from './WeatherIcon.vue'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { useI18n } from '@/composables/useI18n'
import type { HeroModel } from '@/types'
import { capitalize, formatTemp } from '@/utils/format'

const props = defineProps<{ model: HeroModel }>()

const { t } = useI18n()
const temp = useAnimatedNumber(() => props.model.temp)
</script>

<template>
  <section class="hero sky" :class="[`sky--${model.period}`, `sky--${model.condition.group}`]">
    <SkyScene :group="model.condition.group" :period="model.period" />
    <div class="hero__top">
      <Transition name="fade" mode="out-in">
        <span :key="model.label" class="hero__chip">{{ model.label }}</span>
      </Transition>
      <span class="hero__date">{{ model.dateLabel }}</span>
    </div>

    <div class="hero__main">
      <div>
        <p class="hero__temp tabular">{{ formatTemp(temp) }}</p>
        <Transition name="fade" mode="out-in">
          <p :key="model.condition.description" class="hero__desc">
            {{ capitalize(model.condition.description) }}
          </p>
        </Transition>
      </div>
      <Transition name="icon" mode="out-in">
        <WeatherIcon
          :key="`${model.condition.group}-${model.period}`"
          class="hero__icon"
          :group="model.condition.group"
          :period="model.period"
          :size="120"
        />
      </Transition>
    </div>

    <div class="hero__bottom tabular">
      <span v-if="model.feelsLike !== null">
        {{ t('weather.feelsLike', { t: formatTemp(model.feelsLike) }) }}
      </span>
      <span class="hero__range">
        <span>{{ t('weather.max') }} {{ formatTemp(model.max) }}</span>
        <span>{{ t('weather.min') }} {{ formatTemp(model.min) }}</span>
      </span>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  animation: hero-in 700ms var(--ease) both;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 260px;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  overflow: hidden;
  isolation: isolate;
}

.hero::after {
  content: '';
  position: absolute;
  inset: auto -20% -60% auto;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: -1;
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
}

.hero__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.hero__chip {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--glass);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 700;
}

.hero__date {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.85;
}

.hero__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.hero__temp {
  font-size: clamp(56px, 9vw, 84px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.hero__desc {
  margin-top: var(--space-2);
  font-size: 17px;
  font-weight: 600;
}

.hero__icon {
  width: clamp(88px, 22vw, 120px);
  height: auto;
  animation: float 6s ease-in-out infinite;
}

.icon-enter-active {
  transition:
    opacity 400ms var(--ease),
    transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-leave-active {
  transition:
    opacity 180ms var(--ease),
    transform 180ms var(--ease);
}

.icon-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.6) rotate(-12deg);
}

.icon-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.hero__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  font-size: 14px;
  font-weight: 600;
  opacity: 0.92;
}

.hero__range {
  display: inline-flex;
  gap: var(--space-3);
}
</style>
