<script setup lang="ts">
import { computed } from 'vue'
import type { ConditionGroup, DayPeriod } from '@/types'
import { seededRandom } from '@/utils/random'

const props = defineProps<{ group: ConditionGroup; period: DayPeriod }>()

const isNight = computed(() => props.period === 'night')
const hasRain = computed(() => props.group === 'rain' || props.group === 'storm')
const hasSnow = computed(() => props.group === 'snow')
const hasStars = computed(
  () => isNight.value && (props.group === 'clear' || props.group === 'partly'),
)
const hasSun = computed(
  () => !isNight.value && (props.group === 'clear' || props.group === 'partly'),
)
const cloudCount = computed(() => {
  if (props.group === 'clear') return 0
  if (props.group === 'partly') return 2
  return 3
})

const random = seededRandom(42)
const pick = (min: number, max: number) => min + random() * (max - min)
const pct = (value: number) => `${value.toFixed(2)}%`
const sec = (value: number) => `${value.toFixed(2)}s`

const stars = Array.from({ length: 26 }, () => ({
  left: pct(pick(0, 100)),
  top: pct(pick(0, 75)),
  size: `${pick(1, 2.6).toFixed(1)}px`,
  duration: sec(pick(2, 5)),
  delay: sec(-pick(0, 5)),
}))

const drops = Array.from({ length: 38 }, () => ({
  left: pct(pick(-10, 105)),
  height: `${Math.round(pick(12, 24))}px`,
  duration: sec(pick(0.55, 0.95)),
  delay: sec(-pick(0, 1)),
  opacity: pick(0.35, 0.8).toFixed(2),
}))

const flakes = Array.from({ length: 30 }, () => ({
  left: pct(pick(0, 100)),
  size: `${pick(3, 7).toFixed(1)}px`,
  duration: sec(pick(6, 11)),
  delay: sec(-pick(0, 11)),
  sway: `${Math.round(pick(10, 28))}px`,
  opacity: pick(0.5, 0.95).toFixed(2),
}))

const clouds = [
  { top: '8%', width: '62%', duration: '70s', delay: '-12s', opacity: 0.5 },
  { top: '38%', width: '48%', duration: '52s', delay: '-34s', opacity: 0.35 },
  { top: '62%', width: '70%', duration: '88s', delay: '-60s', opacity: 0.28 },
]
</script>

<template>
  <div class="scene" :class="[`scene--${period}`, `scene--${group}`]" aria-hidden="true">
    <Transition name="layer">
      <div v-if="hasSun" class="scene__sun">
        <span class="scene__rays" />
        <span class="scene__glow" />
      </div>
    </Transition>

    <Transition name="layer">
      <div v-if="hasStars" class="scene__stars">
        <span
          v-for="(star, i) in stars"
          :key="i"
          class="scene__star"
          :style="{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }"
        />
        <span class="scene__shooting" />
      </div>
    </Transition>

    <TransitionGroup name="layer">
      <span
        v-for="(cloud, i) in clouds.slice(0, cloudCount)"
        :key="`cloud-${i}`"
        class="scene__cloud"
        :style="{
          top: cloud.top,
          width: cloud.width,
          animationDuration: cloud.duration,
          animationDelay: cloud.delay,
          opacity: cloud.opacity,
        }"
      />
    </TransitionGroup>

    <Transition name="layer">
      <div v-if="hasRain" class="scene__rain">
        <span
          v-for="(drop, i) in drops"
          :key="i"
          class="scene__drop"
          :style="{
            left: drop.left,
            height: drop.height,
            opacity: drop.opacity,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }"
        />
      </div>
    </Transition>

    <Transition name="layer">
      <div v-if="hasSnow" class="scene__snow">
        <span
          v-for="(flake, i) in flakes"
          :key="i"
          class="scene__flake"
          :style="{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            '--sway': flake.sway,
          }"
        />
      </div>
    </Transition>

    <Transition name="layer">
      <div v-if="group === 'mist'" class="scene__fog">
        <span class="scene__band" />
        <span class="scene__band scene__band--2" />
        <span class="scene__band scene__band--3" />
      </div>
    </Transition>

    <span v-if="group === 'storm'" class="scene__flash" />
  </div>
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.scene > *,
.scene__stars,
.scene__rain,
.scene__snow,
.scene__fog {
  position: absolute;
  inset: 0;
}

.scene__sun {
  inset: -40% -30% auto auto;
  width: 520px;
  height: 520px;
}

.scene__rays {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 244, 214, 0.12) 0deg 6deg,
    transparent 6deg 18deg
  );
  mask: radial-gradient(circle, #000 18%, transparent 68%);
  animation: rotate 80s linear infinite;
}

.scene__glow {
  position: absolute;
  inset: 30%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 236, 170, 0.6), transparent 70%);
  animation: pulse 6s ease-in-out infinite;
}

.scene__star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  animation: twinkle ease-in-out infinite;
}

.scene__shooting {
  position: absolute;
  top: 12%;
  left: 70%;
  width: 90px;
  height: 1.5px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), transparent);
  transform: rotate(-24deg);
  opacity: 0;
  animation: shoot 9s ease-in 3s infinite;
}

.scene__cloud {
  position: absolute;
  left: 0;
  aspect-ratio: 3 / 1;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9), transparent 68%);
  filter: blur(6px);
  animation: drift linear infinite;
}

.scene--rain .scene__cloud,
.scene--storm .scene__cloud {
  background: radial-gradient(ellipse at center, rgba(210, 220, 240, 0.7), transparent 68%);
}

.scene--night .scene__cloud {
  background: radial-gradient(ellipse at center, rgba(170, 185, 225, 0.45), transparent 68%);
}

.scene__drop {
  position: absolute;
  top: -30px;
  width: 1.5px;
  border-radius: 2px;
  background: linear-gradient(to bottom, transparent, rgba(220, 235, 255, 0.95));
  animation: rain linear infinite;
}

.scene__flake {
  position: absolute;
  top: -10px;
  border-radius: 50%;
  background: #fff;
  filter: blur(0.4px);
  animation: snow linear infinite;
}

.scene__band {
  position: absolute;
  left: -20%;
  width: 140%;
  height: 34%;
  top: 30%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.38), transparent 70%);
  filter: blur(8px);
  animation: fog 14s ease-in-out infinite alternate;
}

.scene__band--2 {
  top: 55%;
  animation-duration: 18s;
  animation-direction: alternate-reverse;
}

.scene__band--3 {
  top: 5%;
  opacity: 0.6;
  animation-duration: 22s;
}

.scene__flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(235, 225, 255, 0.85), transparent 60%);
  opacity: 0;
  animation: flash 7s linear infinite;
}

.layer-enter-active,
.layer-leave-active {
  transition: opacity 700ms var(--ease);
}

.layer-enter-from,
.layer-leave-to {
  opacity: 0 !important;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.18);
    opacity: 0.8;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(0.6);
  }
}

@keyframes shoot {
  0% {
    opacity: 0;
    transform: rotate(-24deg) translateX(0);
  }
  2% {
    opacity: 1;
  }
  8%,
  100% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-260px);
  }
}

@keyframes drift {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(220%);
  }
}

@keyframes rain {
  from {
    transform: translate3d(0, 0, 0) rotate(12deg);
  }
  to {
    transform: translate3d(-60px, 360px, 0) rotate(12deg);
  }
}

@keyframes snow {
  0% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(var(--sway), 90px, 0);
  }
  50% {
    transform: translate3d(0, 180px, 0);
  }
  75% {
    transform: translate3d(calc(var(--sway) * -1), 270px, 0);
  }
  100% {
    transform: translate3d(0, 360px, 0);
  }
}

@keyframes fog {
  to {
    transform: translateX(12%);
  }
}

@keyframes flash {
  0%,
  88%,
  91%,
  100% {
    opacity: 0;
  }
  89%,
  92.5% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scene__rain,
  .scene__snow,
  .scene__shooting,
  .scene__flash {
    display: none;
  }
}
</style>
