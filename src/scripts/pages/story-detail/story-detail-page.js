import { getStoryDetail } from '../../data/api';
import Database from '../../data/database';
import { parseActivePathname } from '../../routes/url-parser';
import { generateBookmarkBtnContent, generateStoryDetailTemplate } from '../../template';
import { notifAutoClose, showFormattedDate } from '../../utils';
import { getAuth, isLoggedIn, logout } from '../../utils/auth';
import Map from '../../utils/map';
import StoryDetailPresenter from './story-detail-presenter';

export default class StoryDetailPage {
  #presenter;

  async render() {
    return `
      <section id="story-detail" class="max-w-2xl mx-auto mt-5">
        <div class="text-center mt-10 text-grey-700">Loading story...</div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();

    this.#presenter = new StoryDetailPresenter(id, {
      view: this,
      apiModel: { getStoryDetail, isLoggedIn, getAuth },
      dbModel: Database,
    });

    await this.#presenter.getStoryDetail();

    const bookmarkBtn = document.body.querySelector('#bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        const operation = e.currentTarget.dataset.status === '1' ? 'remove' : 'add';
        this.#presenter.bookmarkStory(operation);
      });
    }
  }

  renderStoryDetail(story, isBookmarked) {
    const html = generateStoryDetailTemplate(story, isBookmarked);

    document.body.querySelector('#story-detail').innerHTML = html;

    if (story.lat && story.lon) {
      const map = new Map();
      map.addMarker([story.lat, story.lon], {
        popup: `<b>${story.name}</b><br>${showFormattedDate(story.createdAt)}`,
      });
    }
  }

  renderBookmarkBtn(isBookmarked) {
    const bookmarkBtn = document.body.querySelector('#bookmark-btn');
    if (bookmarkBtn) {
      const html = generateBookmarkBtnContent(isBookmarked);
      bookmarkBtn.dataset.status = isBookmarked ? '1' : '0';
      bookmarkBtn.innerHTML = html;
    }
  }

  renderStoryDetailFailed(errorMsg = '') {
    document.body.querySelector('#story-detail').innerHTML = `
      <div id="reload-story" class="flex flex-col justify-center items-center mt-10">
        <p>${errorMsg}</p>
      </div>
    `;
  }

  renderSessionExpired() {
    notifAutoClose
      .fire({
        icon: 'warning',
        title: 'Session expired',
        text: 'Redirecting to login page. Please log in.',
      })
      .then((result) => {
        if (result.isDismissed) {
          logout();
        }
      });
  }
}
