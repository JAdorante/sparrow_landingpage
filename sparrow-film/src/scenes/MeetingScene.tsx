import React from 'react';
import {C} from '../theme';
import {Mono} from '../components/primitives';
import {MeetingWindow} from '../components/MeetingWindow';
import {Transcript, layoutWords} from '../components/Transcript';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {tw, mix} from '../motion/transitions';
import {MEETING, PARTICIPANTS} from '../data/demoMeeting';
import {CLUSTER, TRANSCRIPT} from './layout';

/** 01 — Sparrow listens. The sentence arrives; three things matter. */
export const MeetingScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.meeting;
  const len = sceneLength('meeting');
  const inP = tw(t, q.windowIn, 1.1);
  const rec = tw(t, q.recede, 1.0, EASE_IN_OUT);
  const placed = layoutWords(MEETING.words, TRANSCRIPT.x, TRANSCRIPT.y, TRANSCRIPT.size);
  const reveal = Math.max(0, (t - q.wordsStart) / q.wordStep);
  const hl = {
    person: tw(t, q.highlight[0], 0.45),
    object: tw(t, q.highlight[1], 0.45),
    due: tw(t, q.highlight[2], 0.45),
  };
  const detach = tw(t, q.detach, 1.25, EASE_IN_OUT);
  const labelO = tw(t, q.wordsStart - 0.2, 0.4) * (1 - rec);
  return (
    <>
      <MeetingWindow
        x={360}
        y={110}
        w={1200}
        h={570}
        t={t}
        title={`${MEETING.title} · ${MEETING.day}`}
        participants={PARTICIPANTS}
        speaking={t > q.wordsStart - 0.3 && t < q.muteOthers + 0.4 ? MEETING.speaker : null}
        speakingOn={tw(t, q.wordsStart - 0.3, 0.3) * (1 - tw(t, q.muteOthers, 0.4))}
        listening={tw(t, q.listening, 0.6)}
        opacity={inP * (1 - rec)}
        scale={mix(0.97, 1, inP) * mix(1, 0.93, rec)}
        blur={rec * 6}
      />
      <div style={{position: 'absolute', left: TRANSCRIPT.x, top: TRANSCRIPT.labelY, opacity: labelO}}>
        <Mono size={14} color={C.slate}>
          {`${PARTICIPANTS[0].name} · ${MEETING.timestamp}`}
        </Mono>
      </div>
      <Transcript
        placed={placed}
        size={TRANSCRIPT.size}
        reveal={reveal}
        highlight={hl}
        mute={tw(t, q.muteOthers, 0.5)}
        detach={detach}
        targets={CLUSTER}
        hideKeys={t >= len}
        opacity={1}
      />
    </>
  );
};
