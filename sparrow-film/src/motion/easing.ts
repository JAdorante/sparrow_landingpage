import {Easing} from 'remotion';

// Primary curve: still settles, but starts a touch more gently than the brief.
export const EASE = Easing.bezier(0.32, 0.88, 0.28, 1);
// For camera moves and morphs that should also start gently.
export const EASE_IN_OUT = Easing.bezier(0.5, 0.04, 0.28, 1);
/** Fast glide, long flare — for the sparrow landing. */
export const EASE_FLARE = Easing.bezier(0.16, 0.2, 0.06, 1);
export const LINEAR = (x: number) => x;
