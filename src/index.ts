import 'normalize.css';
import 'terminal.css';
import './style.css';

import { Application } from 'stimulus';
import { definitionsFromContext } from 'stimulus/webpack-helpers';

const application = Application.start();
const context = require.context('./controllers', true, /\.ts$/);
application.load(definitionsFromContext(context));
