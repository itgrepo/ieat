<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        <th v-if="hasActions">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.id">
        <slot name="row" :row="row">
          <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
        </slot>
        <td v-if="hasActions">
          <slot name="actions" :row="row"></slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  columns: Array,
  data: Array,
  hasActions: Boolean
})
</script>

<style scoped>
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { padding: 16px 24px; background: var(--bg-table-header); color: var(--text-muted); font-size: 13px; text-transform: uppercase; font-weight: 600; border-bottom: var(--border-default); }
.data-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
</style>
