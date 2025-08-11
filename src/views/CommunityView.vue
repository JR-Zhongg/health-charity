<template>
  <div class="container-wide">
    <h1>Community Forum</h1>
    <p class="lead">
      A friendly space for seniors and carers to share experiences, tips, and encouragement.
      (Placeholder content)
    </p>

    <section class="section">
      <h2>Popular Topics</h2>
      <ul class="topics">
        <li v-for="t in topics" :key="t.id" class="topic">
          <h3 class="title">{{ t.title }}</h3>
          <p class="desc">{{ t.desc }}</p>
          <small class="meta">Posts: {{ t.posts }} · Last updated: {{ t.updated }}</small>
        </li>
      </ul>
    </section>

    <section class="section">
      <h2>How to Participate</h2>
      <ol class="steps">
        <li>Register an account and log in.</li>
        <li>Browse or search topics relevant to your needs.</li>
        <li>Post questions or share your experience.</li>
        <li>Be kind and respectful to all members.</li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
const topics = [
  { id: 1, title: 'Staying Active at Home', desc: 'Low-impact exercises and daily routines.', posts: 23, updated: '2025-07-10' },
  { id: 2, title: 'Healthy Eating Tips', desc: 'Simple, nutritious meals for seniors.', posts: 17, updated: '2025-07-18' },
  { id: 3, title: 'Mental Wellbeing & Loneliness', desc: 'Coping strategies and support groups.', posts: 31, updated: '2025-07-20' }
]
</script>

<style scoped>
.container-wide {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  box-sizing: border-box;
}
.lead {
  color: #555;
  margin-bottom: 1.25rem;
}
.section + .section {
  margin-top: 2rem;
}
.topics {
  list-style: none;
  margin: 0;
  padding: 0;
}
.topic + .topic {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.title {
  margin: 0 0 .25rem 0;
}
.meta {
  color: #777;
}
.steps {
  line-height: 1.8;
}
</style>
