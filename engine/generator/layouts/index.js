import { registerLayout } from '../registry.js';
import {
  Blank,
  Title,
  Photo,
  Grid,
  Text,
  Mixed,
  Quote,
  Chapter,
  Contents,
} from './builtins.js';
for (const x of [
  new Blank(),
  new Title(),
  new Photo(),
  new Grid('photos-2', 2),
  new Grid('photos-3', 3),
  new Grid('photos-4', 4),
  new Text(),
  new Mixed('photo-text'),
  new Mixed('text-photo'),
  new Quote(),
  new Chapter(),
  new Contents(),
])
  registerLayout(x);
