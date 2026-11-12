<script setup lang="ts">
import { computed, useId } from 'vue'
import type { ConditionGroup, DayPeriod } from '@/types'

const props = withDefaults(
  defineProps<{ group: ConditionGroup; period?: DayPeriod; size?: number; animated?: boolean }>(),
  { period: 'day', size: 64, animated: true },
)

const uid = useId()
const ids = {
  sun: `${uid}-sun`,
  moon: `${uid}-moon`,
  cloud: `${uid}-cloud`,
  cloudDark: `${uid}-cloud-dark`,
  bolt: `${uid}-bolt`,
}

const isNight = computed(() => props.period === 'night')
const hasPrecipitation = computed(() => ['rain', 'storm', 'snow'].includes(props.group))
const showLight = computed(() => props.group === 'clear' || props.group === 'partly')
const darkCloud = computed(() => props.group === 'storm' || props.group === 'rain')

const RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
</script>

<template>
  <svg
    class="wicon"
    :class="{ 'wicon--animated': animated }"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient :id="ids.sun" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#ffe17a" />
        <stop offset="1" stop-color="#ff9d2e" />
      </radialGradient>
      <linearGradient :id="ids.moon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff6d6" />
        <stop offset="1" stop-color="#d6d0ff" />
      </linearGradient>
      <linearGradient :id="ids.cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="1" stop-color="#dfe6f5" />
      </linearGradient>
      <linearGradient :id="ids.cloudDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c9d2e6" />
        <stop offset="1" stop-color="#8e9bb8" />
      </linearGradient>
      <linearGradient :id="ids.bolt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe45c" />
        <stop offset="1" stop-color="#ffaa1f" />
      </linearGradient>
    </defs>

    <g v-if="showLight" :transform="group === 'partly' ? 'translate(-9 -9) scale(0.8)' : undefined">
      <g v-if="!isNight" class="wicon__sun">
        <line
          v-for="angle in RAYS"
          :key="angle"
          :x1="32 + Math.cos(angle) * 18"
          :y1="32 + Math.sin(angle) * 18"
          :x2="32 + Math.cos(angle) * 24"
          :y2="32 + Math.sin(angle) * 24"
          stroke="#ffb43a"
          stroke-width="3.5"
          stroke-linecap="round"
        />
        <circle cx="32" cy="32" r="13" :fill="`url(#${ids.sun})`" />
      </g>
      <g v-else class="wicon__moon">
        <path d="M38 10a22 22 0 1 0 16 36A18 18 0 0 1 38 10z" :fill="`url(#${ids.moon})`" />
        <circle cx="52" cy="14" r="1.6" fill="#fff6d6" class="wicon__star" />
        <circle cx="12" cy="18" r="1.2" fill="#fff6d6" class="wicon__star wicon__star--late" />
      </g>
    </g>

    <g v-if="group !== 'clear'" :transform="hasPrecipitation ? 'translate(0 -6)' : undefined">
      <g class="wicon__cloud">
        <path
          v-if="group === 'clouds' || group === 'mist'"
          d="M40 30a7 7 0 0 1 1.4-13.9A10 10 0 0 1 60 20a7 7 0 0 1-1 14H42z"
          :fill="`url(#${ids.cloudDark})`"
          opacity="0.85"
        />
        <path
          d="M18 50a10 10 0 0 1-1-19.9A14 14 0 0 1 44 28a10 10 0 0 1 2 22z"
          :fill="`url(#${darkCloud ? ids.cloudDark : ids.cloud})`"
        />
      </g>
    </g>

    <g
      v-if="group === 'rain' || group === 'storm'"
      class="wicon__rain"
      stroke="#5aa7ff"
      stroke-width="3"
      stroke-linecap="round"
    >
      <line x1="22" y1="50" x2="19" y2="57" />
      <line x1="32" y1="50" x2="29" y2="57" class="wicon__drop--2" />
      <line x1="42" y1="50" x2="39" y2="57" class="wicon__drop--3" />
    </g>

    <path
      v-if="group === 'storm'"
      class="wicon__bolt"
      d="M33 40l-7 12h6l-3 10 10-14h-6l4-8z"
      :fill="`url(#${ids.bolt})`"
    />

    <g
      v-if="group === 'snow'"
      class="wicon__snow"
      fill="#ffffff"
      stroke="#b9cdf0"
      stroke-width="0.8"
    >
      <circle cx="21" cy="53" r="2.6" />
      <circle cx="32" cy="57" r="2.6" class="wicon__drop--2" />
      <circle cx="43" cy="53" r="2.6" class="wicon__drop--3" />
    </g>

    <g
      v-if="group === 'mist'"
      stroke="#d5dcea"
      stroke-width="3"
      stroke-linecap="round"
      class="wicon__mist"
    >
      <line x1="12" y1="55" x2="44" y2="55" />
      <line x1="20" y1="61" x2="52" y2="61" />
    </g>
  </svg>
</template>

<style scoped>
.wicon {
  overflow: visible;
  filter: drop-shadow(0 6px 10px rgba(10, 20, 60, 0.18));
}

.wicon--animated .wicon__sun {
  transform-origin: 32px 32px;
  animation: spin 24s linear infinite;
}

.wicon--animated .wicon__cloud {
  animation: drift 6s ease-in-out infinite;
}

.wicon--animated .wicon__rain line,
.wicon--animated .wicon__snow circle {
  animation: fall 1.4s ease-in infinite;
}

.wicon--animated .wicon__drop--2 {
  animation-delay: 0.45s !important;
}

.wicon--animated .wicon__drop--3 {
  animation-delay: 0.9s !important;
}

.wicon--animated .wicon__bolt {
  animation: flash 3s ease-in-out infinite;
}

.wicon--animated .wicon__star {
  animation: twinkle 3s ease-in-out infinite;
}

.wicon--animated .wicon__star--late {
  animation-delay: 1.5s;
}

.wicon--animated .wicon__mist {
  animation: drift 5s ease-in-out infinite reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes drift {
  50% {
    transform: translateX(2px);
  }
}

@keyframes fall {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(5px);
  }
}

@keyframes flash {
  0%,
  86%,
  100% {
    opacity: 1;
  }
  90%,
  94% {
    opacity: 0.25;
  }
}

@keyframes twinkle {
  50% {
    opacity: 0.25;
  }
}
</style>
