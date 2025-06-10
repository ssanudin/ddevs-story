// CSS imports
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faRightToBracket,
  faRightFromBracket,
  faUser,
  faHouse,
  faCirclePlus,
  faBell,
  faBellSlash,
  faArrowLeft,
  faLocationDot,
  faRotateRight,
  faArrowUpRightFromSquare,
  faCamera,
  faImages,
  faPaperPlane,
  faBookmark,
  faBookBookmark,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/styles.css';
import '../styles/tiny-animations.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import { registerServiceWorker } from './utils/register-sw';

document.addEventListener('DOMContentLoaded', async () => {
  library.add(
    faRightToBracket,
    faRightFromBracket,
    faUser,
    faHouse,
    faCirclePlus,
    faBell,
    faBellSlash,
    faArrowLeft,
    faLocationDot,
    faRotateRight,
    faArrowUpRightFromSquare,
    faCamera,
    faImages,
    faPaperPlane,
    faBookmark,
    faBookBookmark
  );
  dom.watch();

  const app = new App({
    content: document.querySelector('#main-content'),
    pageName: document.querySelector('#page-name'),
    skipToContentBtn: document.querySelector('#skip-to-content'),
    backButton: document.querySelector('#back-button'),
    profileBtnWrapper: document.querySelector('#profile-btn-wrapper'),
    profileBtn: document.querySelector('#profile-btn'),
    dropdownMenu: document.querySelector('#dropdown-menu'),
    navList: document.querySelector('#nav-list'),
  });
  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
