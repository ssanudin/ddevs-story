import { pageNameRoutes, routes } from '../routes/routes';
import {
  getActivePathname,
  getActiveRoute,
  getRoute,
  parseActivePathname,
  parsePathname,
} from '../routes/url-parser';
import { isServiceWorkerAvailable } from '../utils/register-sw';
import { getAuth, isLoggedIn, logout } from '../utils/auth';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification';
import {
  generateDropdownMenu,
  generateMainNavMenu,
  generateProfileBtnContent,
  generateSubscribeBtnContent,
} from '../template';

class App {
  #content = null;
  #currentPath = null;
  #previousPath = null;
  #pageName = null;
  #skipToContentBtn = null;
  #backButon = null;
  #profileBtnWrapper = null;
  #profileBtn = null;
  #dropdownMenu = null;
  #navList = null;
  #boundSubscribeHandler = null;
  #token = null;

  constructor({
    pageName,
    content,
    skipToContentBtn,
    backButton,
    profileBtnWrapper,
    profileBtn,
    dropdownMenu,
    navList,
  }) {
    this.#content = content;
    this.#currentPath = getActivePathname();
    this.#pageName = pageName;
    this.#skipToContentBtn = skipToContentBtn;
    this.#backButon = backButton;
    this.#profileBtnWrapper = profileBtnWrapper;
    this.#profileBtn = profileBtn;
    this.#dropdownMenu = dropdownMenu;
    this.#navList = navList;

    this.#boundSubscribeHandler = this.#subscribeHandler.bind(this);

    this.#handleProfileBtn();
  }

  #handleProfileBtn() {
    if (this.#profileBtn) {
      this.#profileBtn.addEventListener('click', () => {
        this.#dropdownMenu.classList.toggle('hidden');
      });

      window.addEventListener('click', (e) => {
        if (!this.#profileBtn.contains(e.target) && !this.#dropdownMenu.contains(e.target)) {
          this.#dropdownMenu.classList.add('hidden');
        }
      });
    }
  }

  async #setupNav() {
    if (isLoggedIn()) {
      if (this.#navList.innerHTML === '') {
        this.#navList.innerHTML = generateMainNavMenu(
          await isCurrentPushSubscriptionAvailable(),
          !isServiceWorkerAvailable()
        );
      }
      if (this.#profileBtn.innerHTML === '') {
        this.#profileBtn.innerHTML = generateProfileBtnContent(getAuth('name'));
      }
      if (this.#dropdownMenu.innerHTML === '') {
        this.#dropdownMenu.innerHTML = generateDropdownMenu();
      }

      this.#navList.classList.remove('hidden');
      this.#profileBtnWrapper.classList.remove('hidden');
    } else {
      this.#navList.classList.add('hidden');
      this.#navList.innerHTML = '';

      this.#profileBtnWrapper.classList.add('hidden');
      this.#profileBtn.innerHTML = '';
      this.#dropdownMenu.innerHTML = '';
    }
  }

  async renderPage() {
    if (isLoggedIn()) {
      if (!this.#token) {
        this.#token = getAuth('token');
      }
    }
    this.#setupNav();

    const url = getActiveRoute();
    const page = routes[url] || routes['/404'];
    const pageNameStr = pageNameRoutes[url] || pageNameRoutes['/404'];

    if (typeof page === 'string') {
      if (page === 'logout') {
        logout();
      } else if (page === 'back') {
        if (this.#previousPath === '/saved-story') {
          window.location = '/#/saved-story';
        } else {
          window.location = '/#/';
        }
      }
      return;
    } else {
      this.#pageName.innerHTML = pageNameStr;

      if (['Detail Story', 'Add New Story'].includes(pageNameStr)) {
        this.#backButon.classList.remove('hidden');
      } else {
        this.#backButon.classList.add('hidden');
      }
    }

    this.#skipToContentBtn.removeEventListener('click', this.#skipToContent.bind(this));
    this.#skipToContentBtn.addEventListener('click', this.#skipToContent.bind(this));

    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      return;
    }

    const navigationType = this.#getNavigationType();
    let targetThumbnail = null;

    if (navigationType === 'list-to-detail') {
      const parsedPathname = parseActivePathname();
      targetThumbnail = document.body.querySelector(
        `.card-story[data-id="${parsedPathname.id}"] .story-item-image`
      );
      if (targetThumbnail) {
        targetThumbnail.style.viewTransitionName = 'story-image';
      }
    }

    const transition = document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();

      if (navigationType === 'detail-to-list') {
        const parsedPathname = parsePathname(this.#currentPath);
        targetThumbnail = document.body.querySelector(
          `.card-story[data-id="${parsedPathname.id}"] .story-item-image`
        );
        if (targetThumbnail) {
          targetThumbnail.style.viewTransitionName = 'story-image';
        }
      }
    });

    transition.updateCallbackDone.then(() => {
      // console.log('Callback has been executed.');
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
    transition.ready.then(() => {
      // console.log('View transition is ready to run.');
    });
    transition.finished.then(() => {
      // console.log('View transition has finished.');
      if (targetThumbnail) {
        targetThumbnail.style.viewTransitionName = '';
      }
      this.#previousPath = this.#currentPath;
      this.#currentPath = getActivePathname();
    });
  }

  #getNavigationType() {
    const fromRoute = getRoute(this.#currentPath);
    const toRoute = getActiveRoute();

    const storyListPath = ['/'];
    const storyDetailPath = ['/story/:id'];

    if (storyListPath.includes(fromRoute) && storyDetailPath.includes(toRoute)) {
      return 'list-to-detail';
    }

    if (storyDetailPath.includes(fromRoute) && storyListPath.includes(toRoute)) {
      return 'detail-to-list';
    }

    return null;
  }

  #skipToContent() {
    this.#skipToContentBtn.blur();

    this.#content.focus();
    this.#content.scrollIntoView({ behavior: 'smooth' });
  }

  async #setupPushNotification() {
    const subscribeBtn = document.body.querySelector('#subscribe-btn');
    if (!subscribeBtn) {
      return;
    }

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    subscribeBtn.innerHTML = generateSubscribeBtnContent(isSubscribed);
    subscribeBtn.setAttribute('data-text', isSubscribed ? 'unsubscribe' : 'subscribe');
    subscribeBtn.removeAttribute('disabled');

    subscribeBtn.removeEventListener('click', this.#boundSubscribeHandler);
    subscribeBtn.addEventListener('click', this.#boundSubscribeHandler);
  }

  #subscribeHandler(e) {
    if (!this.#token) {
      return;
    }

    e.currentTarget.setAttribute('disabled', true);
    const currentStatus = e.currentTarget.getAttribute('data-text')?.toLowerCase();
    if (currentStatus === 'subscribe') {
      subscribe(this.#token).finally(() => {
        this.#setupPushNotification();
      });
    } else if (currentStatus === 'unsubscribe') {
      unsubscribe(this.#token).finally(() => {
        this.#setupPushNotification();
      });
    }
  }
}

export default App;
