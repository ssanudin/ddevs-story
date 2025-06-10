class NotFoundPage {
  async render() {
    return `
      <section class="not-found-page container py-8 text-center">
        <h2 class="text-4xl font-bold mb-4">404 - Page Not Found</h2>
        <p class="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
        <a href="#/" class="text-sky-700 hover:underline"><i class="fa-solid fa-arrow-left"></i> Go back to Home</a>
      </section>
    `;
  }

  async afterRender() {
    // Any post-render logic if needed
  }
}

export default NotFoundPage;
