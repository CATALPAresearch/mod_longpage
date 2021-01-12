<template>
  <div class="row no-gutters align-items-center">
    <div class="col col-auto p-0">
      <avatar
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
import Avatar from '@/components/Avatar';

export default {
  name: 'FormResponse',
  components: {
    Avatar,
  },
  props: {
    respondent: {type: Object, required: true},
  }
};
</script>
