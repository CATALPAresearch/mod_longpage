<template>
  <div class="row no-gutters align-items-center">
    <div class="col col-auto p-0">
      <user-avatar
        :name="respondent.name"
        :picture="respondent.picture"
        :profile="respondent.profile"
      />
    </div>
    <div class="col p-0">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="Antworte"
        >
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
          >
            <font-awesome-icon icon="paper-plane" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from '@/components/UserAvatar';

export default {
  name: 'ResponseForm',
  components: {
    UserAvatar,
  },
  props: {
    respondent: {type: Object, required: true},
  }
};
</script>
