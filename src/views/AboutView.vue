<template>
  <div class="container-wide">
    <h1>About Us</h1>
    <p class="lead">
      We are a health charity dedicated to improving the wellbeing of elderly populations through
      trusted information, community support, and accessible digital services.
    </p>

    <section class="section">
      <h2>Our Mission</h2>
      <p>
        To empower seniors and their carers with reliable health resources, supportive communities,
        and user-friendly tools that improve quality of life and reduce social isolation.
      </p>
    </section>

    <section class="section">
      <h2>What We Do</h2>
      <ul>
        <li>Provide health education and practical guides tailored to seniors.</li>
        <li>Create safe online communities to reduce loneliness and foster connection.</li>
        <li>Offer carer support resources and tools for managing day-to-day care.</li>
        <li>Promote digital inclusion through accessible design and user-friendly features.</li>
      </ul>
    </section>

    <section class="section">
      <h2>Our Values</h2>
      <ul>
        <li>Compassion & Respect</li>
        <li>Evidence-based Information</li>
        <li>Accessibility & Inclusion</li>
        <li>Community-driven Support</li>
      </ul>
    </section>

    <section class="section">
      <h2>Get Involved</h2>
      <p>
        Whether you’re a senior, carer, volunteer, or healthcare professional, your contribution
        can make a difference. Join our community today!
      </p>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

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
ul {
  line-height: 1.8;
}
</style>
