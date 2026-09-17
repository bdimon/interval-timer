import { WorkoutPlan } from '../types';
import { Language } from '../i18n/translations';

export const DEFAULT_PRESETS_BY_LANG: Record<Language, WorkoutPlan[]> = {
  ru: [
    {
      id: 'tabata-classic',
      name: 'Табата Классик',
      description: 'Высокоинтенсивный интервальный тренинг: 8 раундов по 20 сек работы и 10 сек отдыха.',
      prepSeconds: 5,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 8 }).map((_, i) => ({
        id: `tabata-set-${i + 1}`,
        name: `Раунд ${i + 1}`,
        workSeconds: 20,
        restSeconds: 10,
      })),
    },
    {
      id: 'hiit-pyramid',
      name: 'HIIT Пирамида (Сложные сеты)',
      description: 'Сложный цикл с переменной длительностью работы и отдыха для каждого сета.',
      prepSeconds: 10,
      cycles: 2,
      cycleRestSeconds: 60,
      isCustom: false,
      sets: [
        { id: 'pyr-1', name: 'Ступень 1: Разгон', workSeconds: 30, restSeconds: 15 },
        { id: 'pyr-2', name: 'Ступень 2: Нагрузка', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-3', name: 'Ступень 3: ПИК', workSeconds: 60, restSeconds: 30 },
        { id: 'pyr-4', name: 'Ступень 4: Снижение', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-5', name: 'Ступень 5: Спринт-финиш', workSeconds: 30, restSeconds: 15 },
      ],
    },
    {
      id: 'boxing-rounds',
      name: 'Боксёрские Раунды (3 мин)',
      description: '5 классических раундов по 3 минуты работы с 1 минутой отдыха между раундами.',
      prepSeconds: 10,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 5 }).map((_, i) => ({
        id: `boxing-set-${i + 1}`,
        name: `Бокс Раунд ${i + 1}`,
        workSeconds: 180,
        restSeconds: 60,
      })),
    },
    {
      id: 'sprint-intervals',
      name: 'Интервальный Бег / Спринт',
      description: 'Взрывные ускорения 30 секунд с активным шагом 60 секунд. 2 цикла с отдыхом 2 минуты.',
      prepSeconds: 15,
      cycles: 2,
      cycleRestSeconds: 120,
      isCustom: false,
      sets: Array.from({ length: 4 }).map((_, i) => ({
        id: `sprint-set-${i + 1}`,
        name: `Спринт ${i + 1}`,
        workSeconds: 30,
        restSeconds: 60,
      })),
    },
    {
      id: 'core-abs-circuit',
      name: 'Круговая для Пресса (Core)',
      description: '4 упражнения на пресс по 45 секунд работы и 15 секунд перехода. 3 круга.',
      prepSeconds: 8,
      cycles: 3,
      cycleRestSeconds: 45,
      isCustom: false,
      sets: [
        { id: 'core-1', name: 'Скручивания', workSeconds: 45, restSeconds: 15 },
        { id: 'core-2', name: 'Велосипед', workSeconds: 45, restSeconds: 15 },
        { id: 'core-3', name: 'Подъем ног в висе/лежа', workSeconds: 45, restSeconds: 15 },
        { id: 'core-4', name: 'Статическая планка', workSeconds: 45, restSeconds: 15 },
      ],
    },
  ],
  en: [
    {
      id: 'tabata-classic',
      name: 'Tabata Classic',
      description: 'High-intensity interval training: 8 rounds of 20s work and 10s rest.',
      prepSeconds: 5,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 8 }).map((_, i) => ({
        id: `tabata-set-${i + 1}`,
        name: `Round ${i + 1}`,
        workSeconds: 20,
        restSeconds: 10,
      })),
    },
    {
      id: 'hiit-pyramid',
      name: 'HIIT Pyramid (Variable Sets)',
      description: 'Complex cycle with variable work and rest durations for every step.',
      prepSeconds: 10,
      cycles: 2,
      cycleRestSeconds: 60,
      isCustom: false,
      sets: [
        { id: 'pyr-1', name: 'Step 1: Warmup', workSeconds: 30, restSeconds: 15 },
        { id: 'pyr-2', name: 'Step 2: Build-up', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-3', name: 'Step 3: PEAK', workSeconds: 60, restSeconds: 30 },
        { id: 'pyr-4', name: 'Step 4: Cool-down', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-5', name: 'Step 5: Sprint finish', workSeconds: 30, restSeconds: 15 },
      ],
    },
    {
      id: 'boxing-rounds',
      name: 'Boxing Rounds (3 min)',
      description: '5 classic rounds of 3 minutes work with 1 minute rest between rounds.',
      prepSeconds: 10,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 5 }).map((_, i) => ({
        id: `boxing-set-${i + 1}`,
        name: `Boxing Round ${i + 1}`,
        workSeconds: 180,
        restSeconds: 60,
      })),
    },
    {
      id: 'sprint-intervals',
      name: 'Interval Sprint / Run',
      description: 'Explosive 30-second sprints with 60 seconds active walking. 2 cycles with 2 min rest.',
      prepSeconds: 15,
      cycles: 2,
      cycleRestSeconds: 120,
      isCustom: false,
      sets: Array.from({ length: 4 }).map((_, i) => ({
        id: `sprint-set-${i + 1}`,
        name: `Sprint ${i + 1}`,
        workSeconds: 30,
        restSeconds: 60,
      })),
    },
    {
      id: 'core-abs-circuit',
      name: 'Core & Abs Circuit',
      description: '4 core exercises with 45s work and 15s transition. 3 complete rounds.',
      prepSeconds: 8,
      cycles: 3,
      cycleRestSeconds: 45,
      isCustom: false,
      sets: [
        { id: 'core-1', name: 'Crunches', workSeconds: 45, restSeconds: 15 },
        { id: 'core-2', name: 'Bicycle Crunches', workSeconds: 45, restSeconds: 15 },
        { id: 'core-3', name: 'Leg Raises', workSeconds: 45, restSeconds: 15 },
        { id: 'core-4', name: 'Static Plank', workSeconds: 45, restSeconds: 15 },
      ],
    },
  ],
  uk: [
    {
      id: 'tabata-classic',
      name: 'Табата Класик',
      description: 'Високоінтенсивний інтервальний тренінг: 8 раундів по 20 сек роботи та 10 сек відпочинку.',
      prepSeconds: 5,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 8 }).map((_, i) => ({
        id: `tabata-set-${i + 1}`,
        name: `Раунд ${i + 1}`,
        workSeconds: 20,
        restSeconds: 10,
      })),
    },
    {
      id: 'hiit-pyramid',
      name: 'HIIT Піраміда (Складні сети)',
      description: 'Складний цикл зі змінною тривалістю роботи та відпочинку для кожного сету.',
      prepSeconds: 10,
      cycles: 2,
      cycleRestSeconds: 60,
      isCustom: false,
      sets: [
        { id: 'pyr-1', name: 'Ступінь 1: Розгін', workSeconds: 30, restSeconds: 15 },
        { id: 'pyr-2', name: 'Ступінь 2: Навантаження', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-3', name: 'Ступінь 3: ПІК', workSeconds: 60, restSeconds: 30 },
        { id: 'pyr-4', name: 'Ступінь 4: Зниження', workSeconds: 45, restSeconds: 20 },
        { id: 'pyr-5', name: 'Ступінь 5: Спринт-фініш', workSeconds: 30, restSeconds: 15 },
      ],
    },
    {
      id: 'boxing-rounds',
      name: 'Боксерські Раунди (3 хв)',
      description: '5 класичних раундів по 3 хвилини роботи з 1 хвилиною відпочинку між раундами.',
      prepSeconds: 10,
      cycles: 1,
      cycleRestSeconds: 0,
      isCustom: false,
      sets: Array.from({ length: 5 }).map((_, i) => ({
        id: `boxing-set-${i + 1}`,
        name: `Бокс Раунд ${i + 1}`,
        workSeconds: 180,
        restSeconds: 60,
      })),
    },
    {
      id: 'sprint-intervals',
      name: 'Інтервальний Біг / Спринт',
      description: 'Вибухові прискорення 30 секунд з активною ходьбою 60 секунд. 2 цикли з відпочинком 2 хвилини.',
      prepSeconds: 15,
      cycles: 2,
      cycleRestSeconds: 120,
      isCustom: false,
      sets: Array.from({ length: 4 }).map((_, i) => ({
        id: `sprint-set-${i + 1}`,
        name: `Спринт ${i + 1}`,
        workSeconds: 30,
        restSeconds: 60,
      })),
    },
    {
      id: 'core-abs-circuit',
      name: 'Колове тренування для Преса (Core)',
      description: '4 вправи на прес по 45 секунд роботи та 15 секунд переходу. 3 кола.',
      prepSeconds: 8,
      cycles: 3,
      cycleRestSeconds: 45,
      isCustom: false,
      sets: [
        { id: 'core-1', name: 'Скручування', workSeconds: 45, restSeconds: 15 },
        { id: 'core-2', name: 'Велосипед', workSeconds: 45, restSeconds: 15 },
        { id: 'core-3', name: 'Підйом ніг у висі/лежачи', workSeconds: 45, restSeconds: 15 },
        { id: 'core-4', name: 'Статична планка', workSeconds: 45, restSeconds: 15 },
      ],
    },
  ],
};

export const DEFAULT_WORKOUT_PRESETS: WorkoutPlan[] = DEFAULT_PRESETS_BY_LANG.ru;

export function getDefaultPresets(lang: Language = 'ru'): WorkoutPlan[] {
  return DEFAULT_PRESETS_BY_LANG[lang] || DEFAULT_PRESETS_BY_LANG.ru;
}

export function getDefaultPresetById(id: string, lang: Language = 'ru'): WorkoutPlan | undefined {
  const list = getDefaultPresets(lang);
  return list.find((p) => p.id === id);
}

export function getLocalizedPlanName(plan: WorkoutPlan | null | undefined, lang: Language = 'ru'): string {
  if (!plan) return '';
  const def = getDefaultPresetById(plan.id, lang);
  if (def && (!plan.isCustom || plan.id === 'tabata-classic')) {
    return def.name;
  }
  return plan.name;
}

export function getLocalizedSetName(plan: WorkoutPlan | null | undefined, setIndex: number, lang: Language = 'ru'): string {
  if (!plan || !plan.sets || !plan.sets[setIndex]) return '';
  const def = getDefaultPresetById(plan.id, lang);
  if (def && def.sets && def.sets[setIndex] && (!plan.isCustom || plan.id === 'tabata-classic')) {
    return def.sets[setIndex].name;
  }
  return plan.sets[setIndex].name;
}

export function localizeWorkoutPlan(plan: WorkoutPlan, lang: Language = 'ru'): WorkoutPlan {
  const def = getDefaultPresetById(plan.id, lang);
  if (!def) return plan;
  if (plan.isCustom && plan.id !== 'tabata-classic') return plan;
  return {
    ...plan,
    name: def.name,
    description: def.description,
    sets: plan.sets.map((s, idx) => ({
      ...s,
      name: def.sets[idx] ? def.sets[idx].name : s.name,
    })),
  };
}
