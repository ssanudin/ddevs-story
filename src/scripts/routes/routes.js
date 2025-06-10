import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import NotFoundPage from '../pages/not-found/not-found-page';
import SavedStoryPage from '../pages/saved-story/saved-story-page';

export const routes = {
  '/': new HomePage(),
  '/story/:id': new StoryDetailPage(),
  '/add-story': new AddStoryPage(),
  '/saved-story': new SavedStoryPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/404': new NotFoundPage(),
  '/logout': 'logout',
  '/back': 'back',
};

export const pageNameRoutes = {
  '/': 'dDevs Story',
  '/story/:id': 'Detail Story',
  '/add-story': 'Add New Story',
  '/saved-story': 'Saved Story',
  '/login': 'Log in',
  '/register': 'Create Account',
  '/404': 'Not Found',
};
