import {toPx} from '@/util/style';
import {LONGPAGE_APP_CONTAINER_ID, MOODLE_NAVBAR_HEIGHT_IN_PX} from '@/config/constants';

if (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
) {
    const rootMarginTop = toPx(-MOODLE_NAVBAR_HEIGHT_IN_PX);
    const observer = new IntersectionObserver(entries => {
        if (entries[0].boundingClientRect.y === 50) document.body.classList.add('snapped-to-app-container');
        else document.body.classList.remove('snapped-to-app-container');
    }, {rootMargin: `${rootMarginTop} 0px 0px 0px`, threshold: 1});
    observer.observe(document.getElementById(LONGPAGE_APP_CONTAINER_ID));
}
