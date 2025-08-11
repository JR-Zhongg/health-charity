<template>
  <div class="home">
    <!-- ===== Hero ===== -->
    <section class="hero">
      <div class="hero-container">
        <section class="left">
          <h1>Your Health, Our Priority</h1>
          <p>
            This platform helps seniors access reliable health information,
            support, and community connections.
          </p>
          <button @click="goLearnMore" class="btn-primary">Learn More</button>
        </section>

        <!-- 右侧：轻量轮播 -->
        <section
          class="right"
          aria-label="featured tips carousel"
        >
          <article
            v-for="(s, i) in slides"
            :key="s.id"
            class="slide"
            v-show="i === current"
            aria-live="polite"
          >
            <h3 class="slide-title">{{ s.title }}</h3>
            <p class="slide-desc">{{ s.desc }}</p>

            <ul class="slide-tags" role="list">
              <li v-for="tag in s.tags" :key="tag" class="tag">#{{ tag }}</li>
            </ul>
          </article>

          <!-- dots -->
          <ul class="dots" role="tablist" aria-label="carousel pagination">
          <li v-for="(_, i) in slides" :key="i">
            <button
              class="dot"
              :class="{ active: i === current }"
              :aria-label="`Go to slide ${i + 1}`"
              :aria-current="i === current"
              role="tab"
              @click="go(i)"
            />
          </li>
          </ul>

          <!-- controls -->
          <button
            class="ctrl prev"
            aria-label="Previous slide"
            @click="prev"
          >
            ‹
          </button>
          <button
            class="ctrl next"
            aria-label="Next slide"
            @click="next"
          >
            ›
          </button>
        </section>
      </div>
    </section>

    <!-- ===== Features ===== -->
    <section class="features container" aria-labelledby="features-title">
      <h2 id="features-title" class="section-title">What you can do here</h2>

      <ul class="feature-grid" role="list">
        <li v-for="f in features" :key="f.id" class="feature-card">
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </li>
      </ul>
    </section>

    <!-- ===== Quick Links ===== -->
    <section class="quick-links container" aria-labelledby="ql-title">
      <h2 id="ql-title" class="section-title">Quick Links</h2>

      <div class="ql-grid">
        <RouterLink to="/resources" class="ql-item">
          <span class="ql-title">Browse Health Resources</span>
          <span class="ql-desc">Evidence-based tips & guides</span>
        </RouterLink>

        <RouterLink to="/community" class="ql-item">
          <span class="ql-title">Join the Community</span>
          <span class="ql-desc">Share experiences & get support</span>
        </RouterLink>

        <RouterLink to="/carer-support" class="ql-item">
          <span class="ql-title">Carer Support</span>
          <span class="ql-desc">Tools & advice for caregivers</span>
        </RouterLink>

        <RouterLink to="/contact" class="ql-item">
          <span class="ql-title">Contact & Support</span>
          <span class="ql-desc">We’re here to help</span>
        </RouterLink>
      </div>
    </section>

    <!-- ===== Stats (占位数据) ===== -->
    <section class="stats" aria-labelledby="stats-title">
      <div class="container stats-container">
        <h2 id="stats-title" class="visually-hidden">Platform highlights</h2>

        <div class="stat">
          <strong>{{ stats.resources }}</strong>
          <span>Health Resources</span>
        </div>
        <div class="stat">
          <strong>{{ stats.members }}</strong>
          <span>Community Members</span>
        </div>
        <div class="stat">
          <strong>{{ stats.reviews }}</strong>
          <span>User Reviews</span>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="cta container" aria-labelledby="cta-title">
      <h2 id="cta-title">Ready to get started?</h2>
      <p>
        Create an account to rate resources, join discussions, and personalise your experience.
      </p>
      <RouterLink to="/register" class="btn-primary btn-large">
        Create a free account
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()
const goLearnMore = () => router.push('/about')

type Feature = { id: number; title: string; desc: string }
const features: Feature[] = [
  {
    id: 1,
    title: 'Trusted Health Information',
    desc: 'Simple, practical guidance on exercise, nutrition, mental health and more.'
  },
  {
    id: 2,
    title: 'Role-based Access',
    desc: 'Admins can manage content; users can browse, rate and interact.'
  },
  {
    id: 3,
    title: 'Community Support',
    desc: 'Join discussions and connect with others who share similar journeys.'
  },
  {
    id: 4,
    title: 'Accessibility First',
    desc: 'Designed for seniors with large fonts, high contrast and clear navigation.'
  }
]

interface Slide {
  id: number
  title: string
  desc: string
  tags: string[]
}

const slides = ref<Slide[]>([
  {
    id: 1,
    title: 'Stay Active at Home',
    desc: 'Low-impact exercises to keep you moving safely every day.',
    tags: ['exercise', 'mobility', 'fall-prevention']
  },
  {
    id: 2,
    title: 'Eating Well as You Age',
    desc: 'Simple and nutritious meal ideas tailored for seniors.',
    tags: ['food', 'diet', 'elderly']
  },
  {
    id: 3,
    title: 'Mind & Community',
    desc: 'Tips to reduce loneliness and maintain mental wellbeing.',
    tags: ['mental-health', 'community', 'wellbeing']
  }
])

const current = ref(0)
let timer: number | undefined

function next() {
  current.value = (current.value + 1) % slides.value.length
}
function prev() {
  current.value =
    (current.value - 1 + slides.value.length) % slides.value.length
}
function go(i: number) {
  current.value = i
}

onMounted(() => {
  timer = window.setInterval(next, 5000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

// 占位统计数字（可在 A3 时接 Firebase/Serverless 真实统计）
const stats = {
  resources: 120,
  members: 3500,
  reviews: 870
}
</script>

<style scoped>
/* 复用容器宽度 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}

/* 视觉隐藏（给屏幕阅读器） */
.visually-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
  clip: rect(0 0 0 0);
  overflow: hidden;
}

/* ===== Hero ===== */
.home {
  background: #f2f2f2;
  width: 100%;
  min-height: calc(100vh - 120px);
}

.hero {
  background: #f2f2f2;
  width: 100%;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px 60px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4rem; /* 左右之间的空隙 */
  box-sizing: border-box;
}

/* ---- Desktop 默认（>= 1200px 走这里的比例） ---- */
.left {
  flex: 0 1 58%;
}
.right {
  flex: 0 1 32%;
  min-height: 380px;
  background: #fff;
  border: 1px solid #ccc;
  position: relative;
  border-radius: 6px;
  padding: 20px 18px 48px; /* 底部给 dots 和 ctrl 留空间 */
  box-sizing: border-box;
  overflow: hidden;
}

/* 轮播内部 */
.slide {
  animation: fade 0.25s ease;
}
.slide-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 .5rem 0;
}
.slide-desc {
  color: #444;
  margin-bottom: .75rem;
  line-height: 1.6;
}
.slide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.tag {
  background: #f1f3f4;
  color: #5f6368;
  font-size: .85rem;
  border-radius: 9999px;
  padding: 2px 8px;
}

/* dots */
.dots {
  position: absolute;
  left: 14px;
  bottom: 12px;
  display: flex;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0d0d0;
  border: 0;
  cursor: pointer;
}
.dot.active {
  background: #333;
}

/* controls */
.ctrl {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 0 2px rgba(0,0,0,.1);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
}
.ctrl.prev { left: 6px; }
.ctrl.next { right: 6px; }

@keyframes fade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.left h1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 24px;
}
.left p {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 24px;
}
.btn-primary {
  padding: 14px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-large {
  padding: 16px 30px;
  font-size: 1.1rem;
}

/* ---- 超大屏（≥1400px）进一步放大 ---- */
@media (min-width: 1400px) {
  .left h1 {
    font-size: 3.4rem;
  }
  .right {
    min-height: 420px;
  }
}

/* ---- 平板（992px ~ 1199px）---- */
@media (max-width: 1199px) {
  .hero-container {
    padding: 64px 32px 48px;
    gap: 3rem;
  }
  .left {
    flex: 0 1 60%;
  }
  .right {
    flex: 0 1 40%;
    min-height: 340px;
  }
  .left h1 {
    font-size: 2.6rem;
  }
  .left p {
    font-size: 1.05rem;
  }
}

/* ---- 小屏（< 768px）手机端：上下布局 ---- */
@media (max-width: 767px) {
  .hero-container {
    flex-direction: column;
  gap: 2rem;
  padding: 48px 20px 32px;
  }
  .left,
  .right {
    flex: 1 1 100%;
    max-width: 100%;
  }
  .right {
    min-height: 220px;
  }
  .left h1 {
    font-size: 2rem;
  }
  .left p {
    font-size: 1rem;
  }
  .btn-primary {
    padding: 12px 20px;
    font-size: 0.95rem;
  }

  .container {
    padding: 0 20px;
  }
}

/* ===== Features ===== */
.section-title {
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
  font-weight: 700;
}
.features {
  padding: 40px 0 10px;
  background: #fff;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.feature-card {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 18px 16px;
}
.feature-title {
  margin: 0 0 6px 0;
}
.feature-desc {
  color: #555;
  line-height: 1.6;
}

/* ===== Quick Links ===== */
.quick-links {
  padding: 30px 0 40px;
}
.ql-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.ql-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 14px;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  text-decoration: none;
  color: #111;
  background: #fff;
  transition: box-shadow 0.15s ease;
}
.ql-item:hover {
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}
.ql-title {
  font-weight: 700;
}
.ql-desc {
  color: #666;
  font-size: 0.9rem;
}

/* ===== Stats ===== */
.stats {
  background: #111;
  color: #fff;
  padding: 36px 0;
  margin-top: 20px;
}
.stats-container {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
}
.stat {
  text-align: center;
}
.stat strong {
  font-size: 2rem;
  font-weight: 800;
  display: block;
  margin-bottom: 4px;
}
.stat span {
  color: #aaa;
}
@media (max-width: 576px) {
  .stats-container {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
}

/* ===== CTA ===== */
.cta {
  text-align: center;
  padding: 60px 0 100px;
}
.cta h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}
.cta p {
  color: #555;
  margin-bottom: 1.25rem;
}
</style>
