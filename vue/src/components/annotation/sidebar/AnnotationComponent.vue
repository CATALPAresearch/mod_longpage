<template>
  <div class="row no-gutters">
    <div class="col col-auto p-0">
      <user-avatar
        :fullname="author.fullname"
        :profile-image="author.profileimage"
      />
    </div>
    <div class="col p-0">
      <div class="row no-gutters mb-1 align-items-center">
        <div class="col p-0">
          <a
            class="mr-1 align-middle"
            href="#"
          >{{ author.fullname }}</a>
          <user-role-button
            v-if="author.role"
            :role="author.role"
            :href="author.roleOverview"
          />
        </div>

        <div class="col col-auto p-0">
          <font-awesome-icon icon="ellipsis-v" />
          <!--              <div class="annotation-actions text-right">-->
          <!--                <div-->
          <!--                  v-if="!isBeingEdited"-->
          <!--                  class="d-flex justify-content-between"-->
          <!--                >-->
          <!--                  <font-awesome-icon-->
          <!--                    class="ml-1"-->
          <!--                    icon="trash"-->
          <!--                    @click.stop="deleteAnnotation"-->
          <!--                  />-->
          <!--                  <font-awesome-icon-->
          <!--                    class="ml-1"-->
          <!--                    icon="pen"-->
          <!--                    @click.stop="openEditor"-->
          <!--                  />-->
          <!--                </div>-->
          <!--                <div-->
          <!--                  v-else-->
          <!--                  class="d-flex justify-content-between"-->
          <!--                >-->
          <!--                  <font-awesome-icon-->
          <!--                    class="ml-1"-->
          <!--                    icon="times"-->
          <!--                    @click.stop="closeEditor"-->
          <!--                  />-->
          <!--                  <font-awesome-icon-->
          <!--                    class="ml-1"-->
          <!--                    icon="save"-->
          <!--                    @click.stop="updateAnnotation"-->
          <!--                  />-->
          <!--                </div>-->
          <!--              </div>-->
        </div>
      </div>
      <div class="row no-gutters my-1">
        <div class="col col-auto p-0">
          <div>
            <div class="text-small">
              {{ $t('annotationCard.created') }}
              <date-time-text :date-time="annotation.timecreated" />
              <span v-if="annotation.timecreated.getTime() !== annotation.timemodified.getTime()">
                <span class="font-italic">
                  ({{ $t('annotationCard.modified') }}
                  <date-time-text :date-time="annotation.timemodified" />)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="highlightedText"
        class="row no-gutters my-1"
      >
        <div class="col col-auto p-0">
          <span
            class="font-italic longpage-highlight text-small"
            :class="annotationTarget.styleclass"
          >
            {{ highlightedText }}
          </span>
        </div>
      </div>
      <div class="row no-gutters my-1">
        <div class="col col-12 p-0">
          <div>
            <span v-if="!isBeingEdited">{{ annotation.body }}</span>
            <textarea
              v-else
              v-model="annotationUpdate.body"
              class="form-control"
              rows="3"
              @click.stop=""
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ACT, GET, MUTATE} from '@/store/types';
import {Annotation} from '@/lib/annotation/types/annotation';
import {cloneDeep} from 'lodash';
import DateTimeText from '@/components/DateTimeText';
import {HighlightingConfig, SCROLL_INTO_VIEW_OPTIONS, SelectorType} from '@/config/constants';
import {mapActions, mapGetters, mapMutations} from 'vuex';
import scrollIntoView from 'scroll-into-view-if-needed';
import UserAvatar from '@/components/UserAvatar';
import UserRoleButton from '@/components/UserRoleButton';

/*
  TODO:
    - Add to user info:
      - profile,
      - role,
      - roleOverview.
 */

export default {
  name: 'AnnotationCard',
  components: {
    UserAvatar,
    UserRoleButton,
    DateTimeText,
  },
  props: {
    annotation: {type: Annotation, required: true},
  },
  data() {
    return {
      annotationUpdate: null,
      isBeingEdited: false,
    };
  },
  computed: {
    annotationTarget() {
      return this.annotation.target[0];
    },
    author() {
      return this[GET.USER](this.annotation.userId);
    },
    highlightedText() {
      const textQuoteSelector = this.annotationTarget.selector ? this.annotationTarget.selector.find(sel => sel.type === SelectorType.TEXT_QUOTE_SELECTOR) : undefined;
      return textQuoteSelector ? textQuoteSelector.exact : '';
    },
    ...mapGetters([GET.USER]),
  },
  methods: {
    closeEditor() {
      this.isBeingEdited = false;
    },
    deleteAnnotation() {
      this[ACT.DELETE_ANNOTATION](this.annotation);
    },
    getHighlightHTMLElement() {
      return Array
          .from(document.getElementsByTagName(HighlightingConfig.HL_TAG_NAME))
          .find(element => element._annotation.id === this.annotation.id);
    },
    openEditor() {
      this.isBeingEdited = true;
      this.annotationUpdate = cloneDeep(this.annotation);
    },
    selectAnnotation() {
      this[MUTATE.SET_SELECTED_ANNOTATIONS]([this.annotation]);
      scrollIntoView(this.getHighlightHTMLElement(), SCROLL_INTO_VIEW_OPTIONS);
      // Document.getElementById(LONGPAGE_TEXT_OVERLAY_ID).style.display = 'block';
      // TODO: Reintroduce and fix overlay (overlays every highlight) or introduce other form of highlighting annotation selected
    },
    updateAnnotation() {
      this[ACT.UPDATE_ANNOTATION](this.annotationUpdate);
      this.closeEditor();
    },
    ...mapActions([ACT.DELETE_ANNOTATION, ACT.UPDATE_ANNOTATION]),
    ...mapMutations([MUTATE.SET_SELECTED_ANNOTATIONS]),
  }
};
</script>
