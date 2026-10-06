/**
 * Hand-off positions shared between neighbouring scenes. When scene N ends
 * with an object here, scene N+1 starts with it here — that is what makes
 * the film one continuous transformation instead of a slideshow.
 */
import {TokenTarget} from '../components/Transcript';

export const TRANSCRIPT = {x: 360, y: 800, size: 46, labelY: 752};

/** Where the three extracted tokens gather between Meeting and Extraction. */
export const CLUSTER: Record<string, TokenTarget> = {
  person: {x: 690, y: 468, size: 46},
  object: {x: 812, y: 548, size: 46},
  due: {x: 1128, y: 468, size: 46},
};

export const COMMIT_ROW = {x: 160, y: 440};
export const DECISION_POS = {x: 840, y: 440, w: 440};
export const QUESTION_POS = {x: 1320, y: 440, w: 440};

export const COMMIT_FOCUS = {x: 640, y: 300};
export const COMMIT_TUCK = {x: 160, y: 150, scale: 0.72};

export const PROFILE_MAIN = {x: 720, y: 170, w: 520, h: 560};
export const PROFILE_NODE = {x: 1240, y: 190, w: 520, h: 470};

export const EMAIL_POS = {x: 160, y: 140};
export const CAL_POS = {x: 160, y: 610};
