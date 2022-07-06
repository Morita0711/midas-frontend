import { transition, trigger, query, style, animate, group } from '@angular/animations';

const animations = ['CreateToken', 'ConfigToken', 'AddLiquidity', 'LockLiquidity', 'BurnTokens'];

const animationsArrayDown = (animations: string[]) => {
  const animation = [];
  for (let index = 0; index < animations.length; index++) {
    const element = animations[index];
    const element2 = animations[index + 1];
    const newAnimation = transition(`${element} => ${element2}`, [
      query(':enter, :leave', style({ position: 'fixed', width: '60%' }), { optional: true }),
      group([
        query(':enter', [style({ transform: 'translateY(100%)' }), animate('0.5s ease-in-out', style({ transform: 'translateY(0%)' }))], {
          optional: true,
        }),
        query(':leave', [style({ transform: 'translateY(0%)' }), animate('0.5s ease-in-out', style({ transform: 'translateY(-100%)' }))], {
          optional: true,
        }),
      ]),
    ]);
    animation.push(newAnimation);
  }
  return animation;
};

const animationsArrayUp = (animations: string[]) => {
  const animation = [];
  for (let index = 0; index < animations.length; index++) {
    const element = animations[index];
    const element2 = animations[index + 1];
    const newAnimation = transition(`${element} => ${element2}`, [
      query(':enter, :leave', style({ position: 'fixed', width: '60%' }), { optional: true }),
      group([
        query(':enter', [style({ transform: 'translateY(-100%)' }), animate('0.5s ease-in-out', style({ transform: 'translateY(0%)' }))], {
          optional: true,
        }),
        query(':leave', [style({ transform: 'translateY(0%)' }), animate('0.5s ease-in-out', style({ transform: 'translateY(100%)' }))], {
          optional: true,
        }),
      ]),
    ]);
    animation.push(newAnimation);
  }
  return animation;
};

const arrAnimations = [...animationsArrayDown(animations), ...animationsArrayUp(animations.reverse())];

export const slideInAnimation = trigger('routeAnimations', arrAnimations);

export const fadeInAnimation = trigger('fadeInOut', [
  transition(':enter', [
    // :enter is alias to 'void => *'
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 })),
  ]),
  transition(':leave', [
    // :leave is alias to '* => void'
    animate(300, style({ opacity: 0 })),
  ]),
]);
