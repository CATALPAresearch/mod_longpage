import {remove} from 'lodash';
import {THREAD_CONTAINER_ID} from "@/config/constants";
import {ACT} from "@/store/types";

// TODO: Put these functions in general utils
const entryIntersecting = (entry, root) => entry.isIntersecting || elementsIntersecting(entry.target, root)

const elementsIntersecting = (element, root) => rectsIntersecting(element.getBoundingClientRect(), root.getBoundingClientRect())

const rectsIntersecting =
    (r1, r2) => !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)

const isHidden = (el) => el.offsetParent === null

export class PostReadingStatusEstimator {
    static initialized = false
    static intersectionLogs = []
    static intersectionObserver = null
    static root = null

    static init() {
        this.root = document.getElementById(THREAD_CONTAINER_ID)
        this.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const isIntersecting = entryIntersecting(entry, this.root)
                const {target} = entry
                const {dataset} = target
                const log = {
                    postId: Number(dataset.postId),
                    threadId: Number(dataset.threadId),
                    isTop: dataset.position === 'top',
                }
                if (isIntersecting && !isHidden(target)) {
                    const logOfOtherEnd = this.intersectionLogs.find(({postId, isTop}) => postId === log.postId && isTop !== log.isTop)
                    if (logOfOtherEnd) this.createPostReading(log);
                    else this.intersectionLogs.push(log)
                } else {
                    const contentElement = log.isTop ? target.nextSibling : target.previousSibling
                    if (!elementsIntersecting(contentElement, this.root)) remove(this.intersectionLogs, ({postId}) => postId === log.postId)
                }
            })
        }, {root: this.root})
        this.initialized = true
    }

    static createPostReading(log) {
        this.toggleReadingStatus(log.postId, log.threadId); // TODO: Await this, so no new logs for the post trigger in the meanwhile
        remove(this.intersectionLogs, ({postId}) => postId === log.postId); // TODO Is it dangerous manipulating the array asynchronously?
    }

    // TODO Replace by setting instead of toggling
    static toggleReadingStatus(postId, threadId) {
        this.store.dispatch(ACT.TOGGLE_POST_READING, {postId, threadId})
    }

    static startEstimating(store, postTopIndicator, postBottomIndicator) {
        if (!this.store) this.store = store
        if (!this.initialized) this.init() // TODO Handle async to omit multiple init
        this.intersectionObserver.observe(postTopIndicator)
        this.intersectionObserver.observe(postBottomIndicator)
        return this.stopEstimating.bind(this, postTopIndicator, postBottomIndicator)
    }

    static stopEstimating(postTopIndicator, postBottomIndicator) {
        this.intersectionObserver.unobserve(postTopIndicator)
        this.intersectionObserver.unobserve(postBottomIndicator)
    }
}
